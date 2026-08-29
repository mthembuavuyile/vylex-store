'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Scale, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function TermsPage() {
  return (
    <div>
      <PageHeader 
        title="Terms & Conditions"
        subtitle="Standard conditions of sale, privacy policy, and customer legal disclosures for Vybetek Store."
        badge="Legal & Privacy"
        breadcrumbs={[{ label: 'Terms of Service' }]}
      />

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div className="editorial-content-grid">
          
          <div className="editorial-main">
            
            <section className="editorial-section">
              <h2>1. Agreement & Acceptance</h2>
              <p>
                By visiting, browsing, and placing orders on <strong>Vybetek Store</strong> (<code>store.vylex.co.za</code>), you acknowledge and agree to comply with these terms, our Return Policy, and South African Consumer Protection Act (CPA) guidelines.
              </p>
            </section>

            <section className="editorial-section">
              <h2>2. Product Pricing & Availability</h2>
              <p>
                All prices quoted on the store are denominated in <strong>South African Rand (ZAR)</strong>. We endeavor to ensure all pricing and inventory stock levels displayed are accurate. In the rare event an item is listed with an erroneous price due to typographical error, we reserve the right to cancel the order and provide an immediate full refund.
              </p>
            </section>

            <section className="editorial-section">
              <h2>3. Payment Methods & Security</h2>
              <p>
                Payments are processed through certified, bank-grade gateways (Stripe and PayFast). We do not store or process sensitive credit card numbers directly on our servers. All transactions utilize 256-bit SSL encryption.
              </p>
            </section>

            <section className="editorial-section">
              <h2>4. Privacy & POPIA Compliance</h2>
              <p>
                In compliance with the Protection of Personal Information Act (POPIA), your personal data (name, delivery address, phone number, email) is collected strictly to fulfill your order, generate shipping waybills with The Courier Guy, and deliver tracking notifications. We will never sell, rent, or distribute your private data to third parties.
              </p>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="editorial-sidebar">
            <div className="info-box-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--navy)' }}>
                Questions About Terms?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.6, marginBottom: '20px' }}>
                If you have legal or compliance inquiries regarding transactions, please email our legal team.
              </p>
              <Link href="/contact" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Contact Legal Support
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
