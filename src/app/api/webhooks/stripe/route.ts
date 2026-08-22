import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Processing event in unverified development mode.');
      event = JSON.parse(body) as Stripe.Event;
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`Stripe Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle specific Stripe Events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      const paymentIntentId = (session.payment_intent as string) || session.id;

      if (!orderId) {
        console.warn('Stripe checkout.session.completed received with no orderId in metadata.');
        break;
      }

      console.log(`Processing successful Stripe payment for Order ID: ${orderId}`);

      try {
        // 1. Update Order Status in Supabase
        const { error: updateOrderError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'processing',
            payment_reference: paymentIntentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateOrderError) {
          console.error(`Failed to update order ${orderId} status:`, updateOrderError.message);
        }

        // 2. Decrement Product Stock Atomically
        const { error: rpcError } = await supabaseAdmin.rpc('deduct_order_stock', {
          p_order_id: orderId,
        });

        if (rpcError) {
          // Fallback direct stock deduction if stored procedure is not yet deployed
          console.warn('deduct_order_stock RPC notice (using direct update):', rpcError.message);
          const { data: orderItems } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId);

          if (orderItems && orderItems.length > 0) {
            for (const item of orderItems) {
              if (item.product_id) {
                const { data: prod } = await supabaseAdmin
                  .from('products')
                  .select('stock_quantity')
                  .eq('id', item.product_id)
                  .single();

                if (prod && typeof prod.stock_quantity === 'number') {
                  await supabaseAdmin
                    .from('products')
                    .update({
                      stock_quantity: Math.max(0, prod.stock_quantity - item.quantity),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', item.product_id);
                }
              }
            }
          }
        }

        // 3. Log to Supplier / Order Activity Log
        await supabaseAdmin.from('supplier_sync_logs').insert({
          status: 'success',
          details: `Order ${orderId} marked as PAID via Stripe Checkout. Payment Intent Ref: ${paymentIntentId}`,
        });

        console.log(`Order ${orderId} successfully marked as PAID and stock deducted.`);
      } catch (err: any) {
        console.error(`Error completing fulfillment for order ${orderId}:`, err);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn(`Payment failed for PaymentIntent: ${paymentIntent.id}`);

      try {
        await supabaseAdmin.from('supplier_sync_logs').insert({
          status: 'failed',
          details: `Payment failed for Stripe Intent: ${paymentIntent.id}. Message: ${paymentIntent.last_payment_error?.message || 'Unknown reason'}`,
        });
      } catch (err) {
        console.error('Error logging payment failure:', err);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
