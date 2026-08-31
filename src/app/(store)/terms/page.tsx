'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function TermsPage() {
  return (
    <div className="terms-page">
      <PageHeader 
        title="Terms & Conditions"
        subtitle="Standard conditions of sale, POPIA privacy policy, and customer legal disclosures."
        breadcrumbs={[{ label: 'Terms of Service' }]}
      />

      <div className="container editorial-container">
        <div className="editorial-layout">
          
          <main className="editorial-main-flow">
            
            <section className="editorial-block">
              <h2>1. Agreement & Acceptance</h2>
              <p>
                By visiting, browsing, and placing orders on <strong>CartMate</strong> (<code>store.vylex.co.za</code>), you acknowledge and agree to comply with these terms, our Refund Policy, and South African Consumer Protection Act (CPA) regulations.
              </p>
            </section>

            <section className="editorial-block">
              <h2>2. Product Pricing & Currency</h2>
              <p>
                All prices quoted across the store are in <strong>South African Rand (ZAR)</strong>. We endeavor to ensure all displayed pricing and inventory stock levels are accurate. In the rare event an item is listed with an erroneous price due to typographical error, we reserve the right to cancel the order and provide an immediate full refund.
              </p>
            </section>

            <section className="editorial-block">
              <h2>3. Payment Methods & Security</h2>
              <p>
                Payments are processed through certified, PCI-DSS compliant South African payment gateway (PayFast, supporting Visa, Mastercard, Instant EFT, and Capitec Pay). We do not store or process sensitive credit card details directly on our servers. All transactions utilize 256-bit SSL encryption.
              </p>
            </section>

            <section className="editorial-block">
              <h2>4. Privacy & POPIA Compliance</h2>
              <p>
                In compliance with the Protection of Personal Information Act (POPIA), your personal data (name, delivery address, phone number, email) is collected strictly to fulfill your order, generate shipping waybills with The Courier Guy, and deliver tracking notifications. We do not sell, rent, or distribute your personal data to third parties.
              </p>
            </section>

          </main>

          {/* Clean Sidebar */}
          <aside className="editorial-sidebar-clean">
            <div className="sidebar-summary-box">
              <h3>Legal & Inquiries</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', lineHeight: 1.6, marginBottom: '20px' }}>
                If you have legal or compliance inquiries regarding transactions, please contact our support team.
              </p>
              <Link href="/contact" className="btn btn-outline" style={{ width: '100%' }}>
                Contact Support <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

