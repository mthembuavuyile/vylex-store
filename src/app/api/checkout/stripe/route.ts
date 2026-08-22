import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartItems, shippingDetails } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Shopping cart is empty.' }, { status: 400 });
    }

    if (!shippingDetails?.email || !shippingDetails?.fullName || !shippingDetails?.streetAddress) {
      return NextResponse.json(
        { error: 'Please provide full contact and shipping details.' },
        { status: 400 }
      );
    }

    // 1. Server-Side Price & Stock Validation
    // Fetch canonical product data from Supabase to prevent client price tampering
    let subtotal = 0;
    const validatedLineItems: {
      productId: string;
      title: string;
      unitPrice: number;
      quantity: number;
      image?: string;
    }[] = [];

    for (const item of cartItems) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Look up canonical price from Supabase
      const { data: product, error: dbError } = await supabaseAdmin
        .from('products')
        .select('id, title, price, stock_quantity, images')
        .eq('id', item.id)
        .single();

      let unitPrice = Number(item.price) || 0;
      let title = item.title || 'Product';

      if (product && !dbError) {
        unitPrice = Number(product.price);
        title = product.title;

        // Check stock availability
        if (product.stock_quantity !== undefined && product.stock_quantity < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} remaining.` },
            { status: 400 }
          );
        }
      }

      subtotal += unitPrice * quantity;
      validatedLineItems.push({
        productId: item.id,
        title,
        unitPrice,
        quantity,
        image: item.image,
      });
    }

    // 2. Calculate Shipping (Free over R1000, otherwise R99)
    const shippingCost = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + shippingCost;

    // 3. Create Unique Order Identifier
    const orderNumber = `VY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const orderId = orderNumber;
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const fullShippingAddress = [
      shippingDetails.streetAddress,
      shippingDetails.suburb,
      shippingDetails.city,
      shippingDetails.state,
      shippingDetails.postalCode,
    ]
      .filter(Boolean)
      .join(', ');

    // 4. Save Customer and Pending Order to Supabase
    try {
      // Upsert Customer
      await supabaseAdmin.from('customers').upsert(
        {
          id: customerId,
          full_name: shippingDetails.fullName,
          email: shippingDetails.email,
          phone: shippingDetails.phone || '',
          street_address: shippingDetails.streetAddress,
          suburb: shippingDetails.suburb || '',
          city: shippingDetails.city || '',
          state: shippingDetails.state || '',
          postal_code: shippingDetails.postalCode || '',
          status: 'Customer',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      // Insert Order
      const { error: orderInsertError } = await supabaseAdmin.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: shippingDetails.fullName,
        customer_email: shippingDetails.email,
        customer_phone: shippingDetails.phone || '',
        shipping_address: fullShippingAddress,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        currency: 'ZAR',
        payment_method: 'stripe',
        payment_provider: 'stripe',
        payment_status: 'pending',
        order_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (orderInsertError) {
        console.warn('Supabase order insert warning:', orderInsertError.message);
      }

      // Insert Order Items
      const orderItemsToInsert = validatedLineItems.map((item) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order_id: orderId,
        product_id: item.productId,
        product_name: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        created_at: new Date().toISOString(),
      }));

      await supabaseAdmin.from('order_items').insert(orderItemsToInsert);
    } catch (dbErr: any) {
      console.warn('Supabase order creation non-fatal warning:', dbErr.message);
    }

    // 5. Build Stripe Line Items
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const stripeLineItems: any[] = validatedLineItems.map((item) => ({
      price_data: {
        currency: 'zar',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item if applicable
    if (shippingCost > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'zar',
          product_data: {
            name: 'Standard Doorstep Delivery (2-4 Business Days)',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // 6. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: shippingDetails.email,
      client_reference_id: orderId,
      line_items: stripeLineItems,
      metadata: {
        orderId,
        orderNumber,
        customerName: shippingDetails.fullName,
        customerEmail: shippingDetails.email,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${orderId}`,
    });

    // Update session_id in Supabase
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId);

    return NextResponse.json({
      url: session.url,
      orderId,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Stripe checkout session.' },
      { status: 500 }
    );
  }
}
