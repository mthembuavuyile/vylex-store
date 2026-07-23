import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27810000000';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
}

export async function POST(req: Request) {
  try {
    const { cartItems, shippingDetails, totalAmount } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingDetails?.fullName || !shippingDetails?.phone || !shippingDetails?.streetAddress) {
      return NextResponse.json({ error: 'Missing full name, phone number, or street address' }, { status: 400 });
    }

    const customerId = 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const orderNumber = 'VY-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Insert or update Customer in Supabase
    const customerPayload = {
      id: customerId,
      full_name: shippingDetails.fullName.trim(),
      email: shippingDetails.email ? shippingDetails.email.trim() : null,
      phone: shippingDetails.phone.trim(),
      street_address: shippingDetails.streetAddress.trim(),
      suburb: shippingDetails.suburb ? shippingDetails.suburb.trim() : null,
      city: shippingDetails.city ? shippingDetails.city.trim() : null,
      state: shippingDetails.state ? shippingDetails.state.trim() : null,
      postal_code: shippingDetails.postalCode ? shippingDetails.postalCode.trim() : null,
      status: 'Lead',
      updated_at: new Date().toISOString()
    };

    const { error: custErr } = await supabaseAdmin
      .from('customers')
      .upsert(customerPayload, { onConflict: 'id' });

    if (custErr) {
      console.warn('Customer upsert note:', custErr.message);
    }

    // 2. Insert Order in Supabase
    const fullAddress = [
      shippingDetails.streetAddress,
      shippingDetails.suburb,
      shippingDetails.city,
      shippingDetails.state,
      shippingDetails.postalCode
    ].filter(Boolean).join(', ');

    const calculatedTotal = totalAmount || cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    const orderPayload = {
      id: orderId,
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: shippingDetails.fullName.trim(),
      customer_email: shippingDetails.email ? shippingDetails.email.trim() : null,
      customer_phone: shippingDetails.phone.trim(),
      shipping_address: fullAddress,
      total_amount: calculatedTotal,
      shipping_cost: 0.00,
      payment_method: 'whatsapp_inquiry',
      payment_status: 'pending',
      order_status: 'pending',
      notes: 'Customer initialized WhatsApp order inquiry',
      created_at: new Date().toISOString()
    };

    const { error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload);

    if (orderErr) {
      console.warn('Order insert note:', orderErr.message);
    }

    // 3. Insert Order Items
    const itemsPayload = cartItems.map((item: any, idx: number) => ({
      id: `item_${orderId}_${idx}`,
      order_id: orderId,
      product_id: item.id || null,
      product_name: item.title || item.name,
      quantity: item.quantity || 1,
      unit_price: item.price || 0,
      total_price: (item.price || 0) * (item.quantity || 1)
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(itemsPayload);

    if (itemsErr) {
      console.warn('Order items insert note:', itemsErr.message);
    }

    // 4. Construct WhatsApp pre-formatted URL
    const itemLines = cartItems
      .map((i: any) => `• ${i.quantity}x ${i.title || i.name} (${formatMoney((i.price || 0) * (i.quantity || 1))})`)
      .join('\n');

    const messageText = `*New Order Request (${orderNumber})*\n\n` +
      `*Customer Details:*\n` +
      `• Name: ${shippingDetails.fullName}\n` +
      `• Phone: ${shippingDetails.phone}\n` +
      `• Email: ${shippingDetails.email || 'N/A'}\n` +
      `• Delivery Address: ${fullAddress}\n\n` +
      `*Order Items:*\n${itemLines}\n\n` +
      `*Total: ${formatMoney(calculatedTotal)}*\n\n` +
      `_Order saved in store CRM. Please confirm payment details & delivery schedule._`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({
      success: true,
      orderNumber,
      whatsappUrl
    });

  } catch (err: any) {
    console.error('WhatsApp order handler error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
