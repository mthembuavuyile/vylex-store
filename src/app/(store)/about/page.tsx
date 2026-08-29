'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Info, ShieldCheck, Truck, Zap, 
  CheckCircle2, ArrowRight, HeartHandshake, MapPin 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function AboutPage() {
  return (
    <div>
      <PageHeader 
        title="About Vybetek"
        subtitle="Empowering your digital life with premium mobile technology, power accessories, and audio gear across South Africa."
        badge="Our Brand Story"
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        
        {/* Story Section */}
        <div className="editorial-content-grid">
          
          <div className="editorial-main">
            <section className="editorial-section">
              <h2>Welcome to Vybetek Store</h2>
              <p>
                <strong>Vybetek</strong> (operated under <code>store.vylex.co.za</code>) is the official online retail destination for premium consumer electronics, wireless audio devices, smart wearables, and advanced GaN power delivery accessories.
              </p>
              <p>
                In a market saturated with cheap counterfeit cables, unreliable power banks, and inflated import markups, Vybetek was created with a single objective: <strong>to deliver high-performance, safety-certified tech essentials directly to South African consumers at honest, competitive prices.</strong>
              </p>
            </section>

            <section className="editorial-section">
              <h2>Direct South Africa Warehousing & Dispatch</h2>
              <p>
                We do not operate drop-shipping models from unknown overseas locations with 30-day delivery estimates. All products featured on our store are warehoused locally in Johannesburg, Gauteng.
              </p>
              <p>
                When you place an order, our fulfillment team packages your items immediately and hands them over to <strong>The Courier Guy</strong> for door-to-door tracking and express nationwide delivery.
              </p>
            </section>

            <section className="editorial-section">
              <h2>Our Core Pillars</h2>
              <div className="editorial-pillars-grid">
                <div className="pillar-card">
                  <div className="pillar-icon">
                    <ShieldCheck size={24} style={{ color: 'var(--orange)' }} />
                  </div>
                  <h3>Safety & Certification</h3>
                  <p>Every power bank and wall charger features multi-stage surge, over-voltage, and short-circuit protection.</p>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon">
                    <Truck size={24} style={{ color: 'var(--orange)' }} />
                  </div>
                  <h3>Fast Courier Guy Delivery</h3>
                  <p>Reliable 1–3 business day delivery to major metropolitan hubs across all 9 provinces.</p>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon">
                    <HeartHandshake size={24} style={{ color: 'var(--orange)' }} />
                  </div>
                  <h3>7-Day Money Back</h3>
                  <p>Peace of mind with our straightforward return and exchange guarantee on all purchases.</p>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon">
                    <Zap size={24} style={{ color: 'var(--orange)' }} />
                  </div>
                  <h3>Cutting-Edge GaN Tech</h3>
                  <p>Compact, high-efficiency GaN fast chargers that charge laptops, tablets, and phones simultaneously.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Highlights */}
          <aside className="editorial-sidebar">
            <div className="info-box-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--navy)' }}>
                Quick Facts
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, fontSize: '0.88rem' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <MapPin size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Headquarters:</strong> Sandton / Johannesburg, South Africa</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <Truck size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Delivery Partner:</strong> The Courier Guy Express</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Payment Security:</strong> Stripe (Card/Apple Pay) & PayFast Instant EFT</span>
                </li>
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--slate)' }}>
                <Link href="/shop" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Explore Catalog <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
