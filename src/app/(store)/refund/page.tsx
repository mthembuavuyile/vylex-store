'use client';

import React from 'react';
import Link from 'next/link';
import { 
  RefreshCw, ShieldCheck, CheckCircle2, 
  AlertTriangle, CreditCard, ArrowRight, MessageSquare 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function RefundPage() {
  return (
    <div>
      <PageHeader 
        title="Refund & Return Policy"
        subtitle="Hassle-free 7-day returns, replacements, and straightforward refunds for peace of mind."
        badge="Customer Protection"
        breadcrumbs={[{ label: 'Refund Policy' }]}
      />

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div className="editorial-content-grid">
          
          <div className="editorial-main">
            
            {/* Guarantee Highlight */}
            <section className="editorial-section">
              <h2>7-Day Money Back Guarantee</h2>
              <p>
                We want you to be 100% satisfied with every purchase made at <strong>Vybetek Store</strong>. If you change your mind, you may return any unused, unopened item in its original packaging within <strong>7 days of receipt</strong> for a full refund or store credit.
              </p>
            </section>

            {/* Return Process Steps */}
            <section className="editorial-section">
              <h2>How to Initiate a Return</h2>
              <div className="process-steps">
                <div className="process-step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Contact Customer Support</h4>
                    <p>Send an email to <code>support@vylex.co.za</code> or message our WhatsApp team with your Order Reference Number and reason for return.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Pack & Collection</h4>
                    <p>Ensure the product is in its original box with all cables, adapters, and manuals. We will arrange a Courier Guy collection from your address.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Inspection & Fast Payout</h4>
                    <p>Once received at our Johannesburg hub, our technicians verify the item. Approved refunds are processed directly to your bank account or card within 3–5 business days.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Defective or Damaged Products */}
            <section className="editorial-section">
              <h2>Damaged or Defective Items</h2>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#991b1b', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                    Received a faulty item or transit damage?
                  </h4>
                  <p style={{ color: '#7f1d1d', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Please report damaged packaging or malfunctioning electronics within <strong>48 hours of delivery</strong>. We will arrange immediate free collection and dispatch a brand-new replacement at zero additional cost to you.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="editorial-sidebar">
            <div className="info-box-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--navy)' }}>
                Need Help with a Return?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.6, marginBottom: '20px' }}>
                Our team is standing by to help make your return or exchange as smooth as possible.
              </p>
              
              <a
                href="https://wa.me/27821234567?text=Hi%20Vybetek%20Store%2C%20I%20would%20like%20to%20return%20an%20order"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <MessageSquare size={16} /> WhatsApp Returns Help
              </a>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
