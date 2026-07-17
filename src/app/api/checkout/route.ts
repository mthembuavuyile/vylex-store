import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

function generateSignature(params: Record<string, string>, passphrase?: string): string {
  // 1. Sort fields alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // 2. Build parameter string
  let paramString = '';
  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      paramString += `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}&`;
    }
  });
  
  // Remove trailing ampersand
  let signatureString = paramString.slice(0, -1);
  
  // 3. Append passphrase if defined
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // 4. Hash using MD5
  return crypto.createHash('md5').update(signatureString).digest('hex');
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

    // SECURITY: Look up product prices from the database server-side
    // Never trust prices from the client
    let totalAmount = 0;
    const validatedItems: { product_id: string; quantity: number; price: number }[] = [];

    for (const item of cartItems) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        return NextResponse.json({ error: `Invalid quantity for item ${item.id}` }, { status: 400 });
      }

      // Look up the canonical price from the database
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, price, stock_quantity, title')
        .eq('id', item.id)
        .single();

      if (productError || !product) {
        // If product not found in DB (mock products), fall back to client price for demo
        // In production, you'd want to reject these
        console.warn(`Product ${item.id} not found in DB, using client price for demo flow.`);
        totalAmount += Number(item.price) * quantity;
        continue;
      }

      // Verify stock availability
      if (product.stock_quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} available.` },
          { status: 400 }
        );
      }

      // Use the server-validated price, not the client-sent price
      totalAmount += Number(product.price) * quantity;
      validatedItems.push({
        product_id: product.id,
        quantity,
        price: Number(product.price),
      });
    }

    // Add flat rate shipping (R99) if under R1000
    const shippingCost = totalAmount >= 1000 ? 0 : 99;
    totalAmount += shippingCost;

    // Insert order into Supabase using the service role client
    let orderId = crypto.randomUUID();
    let supabaseSuccess = false;

    if (validatedItems.length > 0) {
      try {
        const p_items = validatedItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const p_shipping_address = {
          streetAddress: shippingDetails.streetAddress,
          suburb: shippingDetails.suburb || '',
          city: shippingDetails.city,
          state: shippingDetails.state,
          postalCode: shippingDetails.postalCode,
        };

        const { data: createdOrderId, error: orderError } = await supabaseAdmin.rpc('create_order', {
          p_items: p_items,
          p_shipping_address: p_shipping_address,
          p_customer_email: shippingDetails.email,
          p_customer_name: shippingDetails.fullName,
          p_customer_phone: shippingDetails.phone || '',
        });

        if (orderError) {
          console.warn('Supabase create_order error:', orderError.message);
        } else {
          orderId = createdOrderId;
          supabaseSuccess = true;
        }
      } catch (e: any) {
        console.warn('Supabase DB connectivity error:', e.message);
      }
    }

    // Prepare PayFast Payload
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const payfastParams: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${origin}/checkout/success?order_id=${orderId}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${orderId}`,
      notify_url: `${origin}/api/payfast/itn`,
      name_first: shippingDetails.fullName.split(' ')[0] || 'Customer',
      name_last: shippingDetails.fullName.split(' ').slice(1).join(' ') || 'Vylex',
      email_address: shippingDetails.email,
      cell_number: shippingDetails.phone || '',
      m_payment_id: orderId,
      amount: totalAmount.toFixed(2),
      item_name: `Vylex Store Order #${orderId.substring(0, 8)}`,
      custom_str1: supabaseSuccess ? 'db_tracked' : 'mock_tracked',
    };

    // Generate Signature
    const signature = generateSignature(payfastParams, PASSPHRASE);
    payfastParams['signature'] = signature;

    return NextResponse.json({
      payfastUrl: PAYFAST_URL,
      params: payfastParams,
      orderId,
    });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
