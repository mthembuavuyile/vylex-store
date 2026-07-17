import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Use default PayFast Sandbox credentials if not provided in env
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f09e6ca4e13';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';

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
    const { cartItems, shippingDetails } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingDetails.email || !shippingDetails.fullName || !shippingDetails.streetAddress) {
      return NextResponse.json({ error: 'Missing shipping or contact details' }, { status: 400 });
    }

    // 1. Calculate total order amount
    let totalAmount = 0;
    cartItems.forEach((item: any) => {
      totalAmount += Number(item.price) * Number(item.quantity);
    });

    // Add flat rate shipping (e.g. R99) if under R1000
    const shippingCost = totalAmount >= 1000 ? 0 : 99;
    totalAmount += shippingCost;

    // 2. Insert order into Supabase
    let orderId = crypto.randomUUID(); // Fallback UUID if DB call fails/is not setup
    let supabaseSuccess = false;

    try {
      const p_items = cartItems.map((item: any) => ({
        product_id: item.id.includes('vy-') ? null : item.id, // Bypass if seed mock id
        quantity: item.quantity,
      })).filter((item: any) => item.product_id !== null); // Remove mock items since DB requires real UUIDs

      if (p_items.length === 0) {
        throw new Error('No valid products in cart for real checkout (mocks not supported).');
      }

      const p_shipping_address = {
        streetAddress: shippingDetails.streetAddress,
        suburb: shippingDetails.suburb || '',
        city: shippingDetails.city,
        state: shippingDetails.state,
        postalCode: shippingDetails.postalCode,
      };

      const { data: createdOrderId, error: orderError } = await supabase.rpc('create_order', {
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
      console.warn('Supabase DB connectivity error, bypass check for local demo flow:', e.message);
    }

    // 3. Prepare PayFast Payload
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

    // 4. Generate Signature
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
