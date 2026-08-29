import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', marginBottom: '32px', gap: '8px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>
      
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={32} style={{ color: 'var(--orange)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Terms & Conditions</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>📜 Store Terms & Agreements</h3>
            <p>By placing an order on <strong>Vybetek</strong> (<code>store.vylex.co.za</code>), you agree to our purchase and delivery terms.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>🔒 Secure Payment Options</h3>
            <p>All payments are securely processed via PayFast and Instant EFT. Vybetek never stores or sees raw payment credentials.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>🛒 Pricing & Stock Availability</h3>
            <p>All prices are listed in South African Rands (ZAR) including VAT where applicable. Stock quantities are updated live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
