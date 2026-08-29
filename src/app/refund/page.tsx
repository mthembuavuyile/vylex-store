import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', marginBottom: '32px', gap: '8px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>
      
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <RefreshCw size={32} style={{ color: 'var(--orange)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Refund & Return Policy</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>🔄 7-Day Money Back Guarantee</h3>
            <p>We want you to be completely satisfied with your purchase. You may return any unopened, unused item in its original packaging within 7 days of receipt.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>⚠️ Defective or Damaged Products</h3>
            <p>If your order arrives damaged or malfunctioning, notify our team within 48 hours with order details and photos. We will arrange a free exchange or replacement immediately.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>💳 Refund Processing</h3>
            <p>Approved refunds are returned directly to your original payment account (Card / EFT) within 3–5 working days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
