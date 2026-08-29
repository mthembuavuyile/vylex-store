'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle, MessageSquare, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function RefundPage() {
  return (
    <div className="refund-page">
      <PageHeader 
        title="Refund & Return Policy"
        subtitle="7-day money-back guarantee, replacements, and straightforward returns."
        breadcrumbs={[{ label: 'Refund Policy' }]}
      />

      <div className="container editorial-container">
        <div className="editorial-layout">
          
          <main className="editorial-main-flow">
            
            {/* Guarantee Policy */}
            <section className="editorial-block">
              <h2>7-Day Satisfaction Guarantee</h2>
              <p>
                We want you to be completely satisfied with your purchase from <strong>Vybetek Store</strong>. If you are not satisfied or simply change your mind, you may return any unused item in its original, undamaged packaging within <strong>7 days of receipt</strong> for a full refund or exchange.
              </p>
            </section>

            {/* 3-Step Process */}
            <section className="editorial-block">
              <h2>How to Request a Return</h2>
              <div className="timeline-process">
                <div className="timeline-item">
                  <div className="timeline-num">1</div>
                  <div className="timeline-content">
                    <h3>Notify Customer Support</h3>
                    <p>
                      Email <code>support@vylex.co.za</code> or message our WhatsApp team with your Order Reference Number and reason for the return.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-num">2</div>
                  <div className="timeline-content">
                    <h3>Collection Arranged</h3>
                    <p>
                      Pack the item securely with all cables, chargers, and manuals. We will schedule The Courier Guy to collect the package from your delivery address.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-num">3</div>
                  <div className="timeline-content">
                    <h3>Inspection & Payout</h3>
                    <p>
                      Once the item is inspected at our Johannesburg facility, your refund will be processed directly to your bank account or card within 3–5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Damaged or Defective Items */}
            <section className="editorial-block">
              <h2>Transit Damage or Faulty Items</h2>
              <div className="notice-box-warning">
                <AlertCircle size={20} className="notice-icon" />
                <div>
                  <strong>Report within 48 hours</strong>
                  <p>
                    If your package arrived damaged in transit or the electronic device is defective upon unboxing, notify us within 48 hours of delivery. We will arrange immediate free collection and dispatch a replacement item at zero additional cost.
                  </p>
                </div>
              </div>
            </section>

          </main>

          {/* Clean Sidebar */}
          <aside className="editorial-sidebar-clean">
            <div className="sidebar-summary-box">
              <h3>Need Help with a Return?</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.6, marginBottom: '20px' }}>
                Our local support team is available Monday to Friday to assist with return collections and exchanges.
              </p>
              
              <a
                href="https://wa.me/27821234567?text=Hi%20Vybetek%20Store%2C%20I%20would%20like%20to%20return%20an%20order"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', gap: '8px' }}
              >
                <MessageSquare size={16} /> WhatsApp Returns
              </a>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link href="/contact" style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600, textDecoration: 'underline' }}>
                  Or submit an email inquiry &rarr;
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

