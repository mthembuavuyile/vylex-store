import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';

// PayFast valid IP ranges for ITN callbacks
// https://developers.payfast.co.za/docs#step_4_confirm_payment
const PAYFAST_VALID_IPS = [
  '197.97.145.144', '197.97.145.145', '197.97.145.146', '197.97.145.147',
  '197.97.145.148', '197.97.145.149', '197.97.145.150', '197.97.145.151',
  '197.97.145.152', '197.97.145.153', '197.97.145.154', '197.97.145.155',
  '197.97.145.156', '197.97.145.157', '197.97.145.158', '197.97.145.159',
  // Sandbox IPs
  '41.74.179.194', '41.74.179.195', '41.74.179.196', '41.74.179.197',
  '41.74.179.198', '41.74.179.199', '41.74.179.200', '41.74.179.201',
  '41.74.179.202', '41.74.179.203', '41.74.179.204', '41.74.179.205',
  '41.74.179.206', '41.74.179.207', '41.74.179.208', '41.74.179.209',
  '41.74.179.210', '41.74.179.211', '41.74.179.212', '41.74.179.213',
  '41.74.179.214',
];

function generateSignature(params: Record<string, string>, passphrase?: string): string {
  const sortedKeys = Object.keys(params).sort();
  let paramString = '';
  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      paramString += `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}&`;
    }
  });
  
  let signatureString = paramString.slice(0, -1);
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export async function POST(req: Request) {
  try {
    // Step 1: Validate source IP (skip in development)
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

      if (!clientIp || !PAYFAST_VALID_IPS.includes(clientIp)) {
        console.error(`PayFast ITN rejected: Invalid source IP ${clientIp}`);
        return new Response('Forbidden: Invalid source IP', { status: 403 });
      }
    }

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

    console.log('Received PayFast ITN callback data:', payfastData);

    // Step 2: Verify merchant_id matches
    if (MERCHANT_ID && payfastData.merchant_id !== MERCHANT_ID) {
      console.error('PayFast ITN failed: Merchant ID mismatch');
      return new Response('Invalid Merchant ID', { status: 400 });
    }

    // Step 3: Validate Signature
    const calculatedSignature = generateSignature(payfastData, PASSPHRASE);
    if (calculatedSignature !== receivedSignature) {
      console.error('PayFast ITN failed: Signature verification mismatch');
      return new Response('Invalid Signature', { status: 400 });
    }

    // Step 4: Verify payment amount matches the order total in database
    const orderId = payfastData.m_payment_id;
    const paymentAmount = parseFloat(payfastData.amount_gross || '0');
    const paymentStatus = payfastData.payment_status;

    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, status')
      .eq('id', orderId)
      .single();

    if (orderFetchError || !order) {
      console.error(`PayFast ITN: Order ${orderId} not found in database`);
      // Still return 200 to prevent PayFast from retrying indefinitely
      return new Response('Order not found', { status: 200 });
    }

    // Check amount matches (with small tolerance for floating point)
    const orderTotal = parseFloat(order.total_amount);
    // Add shipping cost calculation to match
    const shippingCost = orderTotal >= 1000 ? 0 : 99;
    const expectedTotal = orderTotal + shippingCost;
    
    if (Math.abs(paymentAmount - expectedTotal) > 0.02 && Math.abs(paymentAmount - orderTotal) > 0.02) {
      console.error(
        `PayFast ITN: Amount mismatch for order ${orderId}. ` +
        `Expected ~R${expectedTotal.toFixed(2)} or ~R${orderTotal.toFixed(2)}, got R${paymentAmount.toFixed(2)}`
      );
      // Log the mismatch but don't block — flag for manual review
      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'failed',
        details: `AMOUNT MISMATCH: Order ${orderId} expected R${expectedTotal.toFixed(2)} but PayFast sent R${paymentAmount.toFixed(2)}. Needs manual review.`
      });
    }

    // Step 5: Process Order Status
    if (paymentStatus === 'COMPLETE') {
      console.log(`Payment successful for Order ID: ${orderId}`);
      
      // Use supabaseAdmin (service role) to bypass RLS and update the order
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'paid',
          payment_reference: payfastData.pf_payment_id || null 
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError.message);
      }

      // Log success
      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'success',
        details: `Order ${orderId} marked as PAID via PayFast ITN. Ref: ${payfastData.pf_payment_id}`
      });
      
    } else {
      console.log(`Payment status for Order ID ${orderId} was: ${paymentStatus}`);
      
      await supabaseAdmin.from('supplier_sync_logs').insert({
        status: 'failed',
        details: `Order ${orderId} payment status: ${paymentStatus}`
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error handling PayFast ITN webhook:', error);
    return new Response('ITN Handler Error', { status: 500 });
  }
}
