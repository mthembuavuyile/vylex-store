'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, RefreshCw, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'N/A';

  return (
    <div className="container" style={{ padding: '60px 24px 100px', display: 'flex', justifyContent: 'center' }}>
      <div className="info-box-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px' }}>
        
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: 'var(--red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={42} />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
            Payment Incomplete
          </h1>
          <p style={{ color: 'var(--sdark)' }}>
            Your transaction was cancelled or not completed. No funds have been deducted from your account.
          </p>
        </div>

        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--slate)',
          borderRadius: 'var(--border-radius)',
          padding: '16px 24px',
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          color: 'var(--navy)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div><strong>Order Reference:</strong> <span style={{ color: 'var(--sdark)' }}>{orderId}</span></div>
          <div><strong>Status:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>CANCELLED / UNPAID</span></div>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--sdark)', lineHeight: 1.5 }}>
          If you experienced an interruption with your card authorization or prefer Instant EFT / WhatsApp assistance, you can easily retry your checkout.
        </p>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
            Browse Products
          </Link>
          <Link href="/checkout" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Retry Checkout <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <div>
      <PageHeader 
        title="Payment Status"
        breadcrumbs={[{ label: 'Checkout', href: '/checkout' }, { label: 'Payment Cancelled' }]}
      />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>}>
        <CancelContent />
      </Suspense>
    </div>
  );
}
