import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';

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

    // 1. Verify merchant_id matches
    if (payfastData.merchant_id !== MERCHANT_ID) {
      console.error('PayFast ITN failed: Merchant ID mismatch');
      return new Response('Invalid Merchant ID', { status: 400 });
    }

    // 2. Validate Signature
    const calculatedSignature = generateSignature(payfastData, PASSPHRASE);
    if (calculatedSignature !== receivedSignature) {
      console.error('PayFast ITN failed: Signature verification mismatch');
      return new Response('Invalid Signature', { status: 400 });
    }

    // 3. Process Order Status
    const orderId = payfastData.m_payment_id;
    const paymentStatus = payfastData.payment_status; // 'COMPLETE', 'FAILED', etc.

    if (paymentStatus === 'COMPLETE') {
      console.log(`Payment successful for Order ID: ${orderId}`);
      
      // Update order status in Supabase to 'paid'
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_reference: payfastData.pf_payment_id || null 
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status in Supabase:', error.message);
      }

      // Log sync history
      await supabase.from('supplier_sync_logs').insert({
        status: 'success',
        details: `Order ${orderId} successfully marked as PAID via PayFast ITN reference ${payfastData.pf_payment_id}`
      });
      
    } else {
      console.log(`Payment status for Order ID ${orderId} was: ${paymentStatus}`);
      
      await supabase.from('supplier_sync_logs').insert({
        status: 'failed',
        details: `Order ${orderId} failed or cancelled. Status: ${paymentStatus}`
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error handling PayFast ITN webhook:', error);
    return new Response('ITN Handler Error', { status: 500 });
  }
}
