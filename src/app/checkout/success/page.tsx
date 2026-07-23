'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'N/A';

  return (
    <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#d1fae5',
        color: 'var(--green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
      }}>
        <CheckCircle2 size={40} />
      </div>

      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Payment Approved</h1>
        <p style={{ color: 'var(--sdark)' }}>Thank you for shopping with Vylex Store. Your transaction was processed successfully.</p>
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
        <div><strong>Order Reference:</strong> <span style={{ color: 'var(--orange)' }}>{orderId}</span></div>
        <div><strong>Status:</strong> <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>PAID (Pending Fulfillment)</span></div>
      </div>

      <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--slate)', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} style={{ color: 'var(--orange)' }} /> Fulfillment Tracker
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.5 }}>
          Our <strong>Supplier Sync Engine</strong> is updating the supplier inventory. The package will be shipped directly from the regional supplier warehouse to your door. You will receive an SMS and email notification with your tracking number as soon as the courier collects the items.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
        <Link href="/" className="btn btn-outline" style={{ flexGrow: 1 }}>
          Return Home
        </Link>
        <Link href="/" className="btn btn-primary" style={{ flexGrow: 1, gap: '8px' }}>
          <ShoppingBag size={18} /> Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: 'var(--bg)' 
    }}>
      {/* Header */}
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="logo">
            <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px 24px'
      }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center' }}>
            <p>Loading order confirmation details...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          <p>&copy; {new Date().getFullYear()} Vylex Store. Secure Payment Gateway Verification. By <a href="https://vylex.co.za" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)', textDecoration: 'underline' }}>Vylex</a></p>
        </div>
      </footer>
    </div>
  );
}
