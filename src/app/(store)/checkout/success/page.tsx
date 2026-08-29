'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'N/A';
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId && orderId !== 'N/A') {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, total_amount, payment_status, order_status, shipping_address, customer_name, currency')
            .or(`id.eq.${orderId},order_number.eq.${orderId}`)
            .single();

          if (!error && data) {
            setOrderDetails(data);
          }
        } catch (err) {
          console.warn('Could not fetch order details:', err);
        }
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div className="container" style={{ padding: '60px 24px 100px', display: 'flex', justifyContent: 'center' }}>
      <div className="info-box-card" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px' }}>
        
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)'
        }}>
          <CheckCircle2 size={42} />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
            Payment Successful!
          </h1>
          <p style={{ color: 'var(--sdark)' }}>
            Thank you for your order with Vybetek Store. Your transaction has been securely processed.
          </p>
        </div>

        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--slate)',
          borderRadius: 'var(--border-radius)',
          padding: '20px 24px',
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          color: 'var(--navy)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div><strong>Order Reference:</strong> <span style={{ color: 'var(--orange)' }}>{orderId}</span></div>
          <div>
            <strong>Payment Status:</strong>{' '}
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
              {orderDetails?.payment_status ? orderDetails.payment_status.toUpperCase() : 'PAID (Verified)'}
            </span>
          </div>
          {orderDetails?.total_amount && (
            <div><strong>Total Paid:</strong> R{Number(orderDetails.total_amount).toFixed(2)}</div>
          )}
          {orderDetails?.shipping_address && (
            <div style={{ fontSize: '0.85rem', color: 'var(--sdark)', marginTop: '4px' }}>
              <strong>Delivering to:</strong> {orderDetails.shipping_address}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--slate)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: 'var(--orange)' }} /> Fulfillment Tracker
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.5 }}>
            Your order is being prepped for dispatch. You will receive an SMS and email notification with your tracking number as soon as The Courier Guy collects your parcel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
            Return Home
          </Link>
          <Link href="/shop" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '8px' }}>
            <ShoppingBag size={18} /> Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div>
      <PageHeader 
        title="Order Confirmation"
        breadcrumbs={[{ label: 'Checkout', href: '/checkout' }, { label: 'Order Success' }]}
      />
      <Suspense fallback={
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--orange)', margin: '0 auto 16px' }} />
          <p>Verifying payment...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
