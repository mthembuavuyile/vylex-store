import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildPayfastPayload } from '@/lib/payfast';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';

if (!MERCHANT_ID || !MERCHANT_KEY) {
  console.warn(
    'WARNING: PAYFAST_MERCHANT_ID or PAYFAST_MERCHANT_KEY is missing from env. ' +
    'Checkout will fail in production.'
  );
}

export async function POST(req: Request) {
  try {
    // Fail early if PayFast credentials are missing
    if (!MERCHANT_ID || !MERCHANT_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Contact store administrator.' },
        { status: 503 }
      );
    }

    const { cartItems, shippingDetails } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingDetails?.email || !shippingDetails?.fullName || !shippingDetails?.streetAddress) {
      return NextResponse.json({ error: 'Missing shipping or contact details' }, { status: 400 });
    }

    // 1. Validate items and fetch prices from database server-side
    let subtotal = 0;
    const validatedItems: { product_id: string; title: string; quantity: number; price: number }[] = [];

    for (const item of cartItems) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        return NextResponse.json({ error: `Invalid quantity for item ${item.id}` }, { status: 400 });
      }

      // Look up canonical product from DB
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, price, stock_quantity, title')
        .eq('id', item.id)
        .single();

      let unitPrice = Number(item.price) || 0;
      let title = item.title || 'Vylex Item';

      if (!productError && product) {
        unitPrice = Number(product.price);
        title = product.title;

        if (product.stock_quantity !== undefined && product.stock_quantity < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} available.` },
            { status: 400 }
          );
        }
      }

      subtotal += unitPrice * quantity;
      validatedItems.push({
        product_id: item.id,
        title,
        quantity,
        price: unitPrice,
      });
    }

    // 2. Shipping calculation: Free over R1000, otherwise R99
    const shippingCost = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + shippingCost;

    // 3. Unique order identifiers
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

    // 4. Save Customer and Pending Order into Supabase
    try {
      // Upsert customer record
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
        { onConflict: 'phone' }
      );

      // Insert Order record
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
        payment_method: 'payfast',
        payment_status: 'pending',
        order_status: 'pending',
        notes: 'Order initiated via PayFast Gateway',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (orderInsertError) {
        console.warn('Supabase PayFast order insert warning:', orderInsertError.message);
      }

      // Insert Order Items
      const orderItemsToInsert = validatedItems.map((item, idx) => ({
        id: `item_${orderId}_${idx}`,
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.title,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsToInsert);
      if (itemsError) {
        console.warn('Supabase PayFast order items insert warning:', itemsError.message);
      }
    } catch (dbErr: any) {
      console.warn('Database initialization note:', dbErr.message);
    }

    // 5. Resolve Public Site URL for callbacks & redirects
    const requestOrigin = req.headers.get('origin') || 
      (req.headers.get('x-forwarded-host') ? `https://${req.headers.get('x-forwarded-host')}` : null);
    
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin || 'http://localhost:3000').replace(/\/$/, '');

    // 6. Prepare PayFast Payload with strict documentation order & MD5 signature
    const payfastParams = buildPayfastPayload(
      {
        merchant_id: MERCHANT_ID,
        merchant_key: MERCHANT_KEY,
        return_url: `${baseUrl}/checkout/success?order_id=${orderId}`,
        cancel_url: `${baseUrl}/checkout/cancel?order_id=${orderId}`,
        notify_url: `${baseUrl}/api/payfast/itn`,
        name_first: shippingDetails.fullName.split(' ')[0] || 'Customer',
        name_last: shippingDetails.fullName.split(' ').slice(1).join(' ') || 'Customer',
        email_address: shippingDetails.email,
        cell_number: shippingDetails.phone || '',
        m_payment_id: orderId,
        amount: totalAmount.toFixed(2),
        item_name: `Vylex Order ${orderNumber}`,
      },
      PASSPHRASE
    );

    return NextResponse.json({
      payfastUrl: PAYFAST_URL,
      params: payfastParams,
      orderId,
      orderNumber,
    });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
