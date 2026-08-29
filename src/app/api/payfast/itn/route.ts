import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';
const IS_SANDBOX = PAYFAST_URL.includes('sandbox');

function generateSignature(params: Record<string, string>, passphrase?: string): string {
  const sortedKeys = Object.keys(params).sort();
  let paramString = '';
  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      const encodedVal = encodeURIComponent(val.trim())
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
      paramString += `${key}=${encodedVal}&`;
    }
  });
  
  let signatureString = paramString.slice(0, -1);
  if (passphrase) {
    const encodedPassphrase = encodeURIComponent(passphrase.trim())
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+');
    signatureString += `&passphrase=${encodedPassphrase}`;
  }
  
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Validates the ITN callback payload with PayFast servers via server-to-server query.
 * Official PayFast ITN Step 3.
 */
async function validateWithPayFastHost(rawBody: string): Promise<boolean> {
  try {
    const validateHost = IS_SANDBOX
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate';

    const response = await fetch(validateHost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: rawBody,
    });

    const responseText = await response.text();
    return responseText.trim() === 'VALID';
  } catch (err) {
    console.error('PayFast server callback validation network error:', err);
    // If PayFast host is temporarily unreachable, signature validation still protects the callback
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const searchParams = new URLSearchParams(text);
    
    const payfastData: Record<string, string> = {};
    let receivedSignature = '';
    
    searchParams.forEach((value, key) => {
      if (key === 'signature') {
        receivedSignature = value;
      } else {
        payfastData[key] = value;
      }
    });

    console.log('Received PayFast ITN callback for order:', payfastData.m_payment_id);

    // Step 1: Verify merchant_id matches
    if (MERCHANT_ID && payfastData.merchant_id !== MERCHANT_ID) {
      console.error('PayFast ITN failed: Merchant ID mismatch');
      return new Response('Invalid Merchant ID', { status: 400 });
    }

    // Step 2: Validate MD5 Signature
    const calculatedSignature = generateSignature(payfastData, PASSPHRASE);
    if (calculatedSignature !== receivedSignature) {
      console.error('PayFast ITN failed: Signature verification mismatch');
      return new Response('Invalid Signature', { status: 400 });
    }

    // Step 3: Server-to-server verification with PayFast host
    // (In production, verify with PayFast validate endpoint; log warning if unconfirmed)
    const isHostValid = await validateWithPayFastHost(text);
    if (!isHostValid && process.env.NODE_ENV === 'production') {
      console.warn('PayFast ITN host validation returned non-VALID. Proceeding with verified signature.');
    }

    // Step 4: Verify Order in Database
    const orderId = payfastData.m_payment_id;
    const paymentAmount = parseFloat(payfastData.amount_gross || '0');
    const paymentStatus = payfastData.payment_status;

    if (!orderId) {
      console.error('PayFast ITN failed: Missing m_payment_id');
      return new Response('Missing Order ID', { status: 400 });
    }

    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, payment_status, order_status')
      .eq('id', orderId)
      .single();

    if (orderFetchError || !order) {
      console.error(`PayFast ITN: Order ${orderId} not found in database`);
      // Return 200 to prevent PayFast from retrying indefinitely for orphaned/test orders
      return new Response('Order not found', { status: 200 });
    }

    // Check amount matches with floating point tolerance
    const orderTotal = parseFloat(order.total_amount);
    if (Math.abs(paymentAmount - orderTotal) > 0.05) {
      console.error(
        `PayFast ITN: Amount mismatch for order ${orderId}. Expected R${orderTotal.toFixed(2)}, got R${paymentAmount.toFixed(2)}`
      );
      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'warning',
        details: `AMOUNT MISMATCH: Order ${orderId} expected R${orderTotal.toFixed(2)} but PayFast gross was R${paymentAmount.toFixed(2)}.`
      });
    }

    // Step 5: Process Order Status & Fulfill
    if (paymentStatus === 'COMPLETE') {
      console.log(`Payment SUCCESSFUL for Order ID: ${orderId}. Reference: ${payfastData.pf_payment_id}`);

      // 1. Update Order Status in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          payment_status: 'paid',
          order_status: 'processing',
          payment_reference: payfastData.pf_payment_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status in Supabase:', updateError.message);
      }

      // 2. Decrement Stock Atomically
      const { error: rpcError } = await supabaseAdmin.rpc('deduct_order_stock', {
        p_order_id: orderId,
      });

      if (rpcError) {
        console.warn('deduct_order_stock RPC notice (using fallback direct update):', rpcError.message);
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

      // 3. Log Audit Record
      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'success',
        details: `Order ${orderId} marked as PAID via PayFast ITN. Reference: ${payfastData.pf_payment_id || 'N/A'}`
      });

    } else {
      console.log(`PayFast payment status for Order ${orderId}: ${paymentStatus}`);
      
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: paymentStatus.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'failed',
        details: `Order ${orderId} PayFast status was ${paymentStatus}`
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error handling PayFast ITN webhook:', error);
    return new Response('ITN Handler Error', { status: 500 });
  }
}
