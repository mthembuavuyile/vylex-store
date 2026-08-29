import React from 'react';
import Link from 'next/link';
import { Info, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', marginBottom: '32px', gap: '8px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>
      
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Info size={32} style={{ color: 'var(--orange)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>About Vybetek</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>ℹ️ Welcome to Vybetek</h3>
            <p><strong>Vybetek</strong> (<code>store.vylex.co.za</code>) is the official online technology retail store for all things Vybetek.</p>
            <p>We specialize in premium mobile electronics, power banks, wireless audio, smartwatch accessories, and fast charging gear for South African tech enthusiasts.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>📍 Direct South Africa Dispatch</h3>
            <p>All products are stocked locally and shipped direct to your home or office with full order tracking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
