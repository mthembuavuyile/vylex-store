import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/" className="btn btn-outline" style={{ display: 'inline-flex', marginBottom: '32px', gap: '8px', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Store
      </Link>
      
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Truck size={32} style={{ color: 'var(--orange)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Shipping & Deliveries</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>🇿🇦 Nationwide Express Delivery</h3>
            <p>We deliver nationwide across all 9 provinces in South Africa via <strong>The Courier Guy</strong> directly to your door.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>⏱️ Dispatch & Delivery Times</h3>
            <p>Orders placed before 14:00 Monday to Friday are dispatched within 24 hours. Delivery to main centres (Johannesburg, Cape Town, Durban, Pretoria) takes 1–3 business days.</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>🚚 Shipping Rates</h3>
            <p>Standard door-to-door courier delivery is <strong>R99</strong>. Orders of <strong>R1,000 or more qualify for FREE delivery</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
