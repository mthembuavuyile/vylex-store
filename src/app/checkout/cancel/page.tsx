'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ShoppingBag, ArrowRight, RefreshCw } from 'lucide-react';

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
        <a href="/" className="btn btn-outline" style={{ flexGrow: 1 }}>
          Return to Catalog
        </a>
        <a href="/" className="btn btn-primary" style={{ flexGrow: 1, gap: '8px' }}>
          <RefreshCw size={18} /> Retry Checkout <ArrowRight size={16} />
        </a>
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
          <a href="/" className="logo">
            <div className="logo-dot"></div>
            Vylex<span>Store</span>
          </a>
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
          <p>&copy; {new Date().getFullYear()} Vylex Store. Secure Payment Gateway Verification.</p>
        </div>
      </footer>
    </div>
  );
}
