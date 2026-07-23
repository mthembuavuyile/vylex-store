'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'N/A';

  return (
    <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#fee2e2',
        color: 'var(--red)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
      }}>
        <AlertCircle size={40} />
      </div>

      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Transaction Cancelled</h1>
        <p style={{ color: 'var(--sdark)' }}>Your payment was not completed, and your order has been marked as cancelled. No funds were deducted.</p>
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

      <p style={{ fontSize: '0.92rem', color: 'var(--sdark)' }}>
        If you experienced a connection issue or want to use a different payment method, you can return to your shopping cart and try checkout again.
      </p>

      <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
        <Link href="/" className="btn btn-outline" style={{ flexGrow: 1 }}>
          Return to Catalog
        </Link>
        <Link href="/" className="btn btn-primary" style={{ flexGrow: 1, gap: '8px' }}>
          <RefreshCw size={18} /> Retry Checkout <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
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
            <p>Loading order status details...</p>
          </div>
        }>
          <CancelContent />
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
