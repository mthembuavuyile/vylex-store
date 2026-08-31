'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Truck, Zap, 
  ArrowRight, HeartHandshake, MapPin, Check 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function AboutPage() {
  return (
    <div className="about-page">
      <PageHeader 
        title="About CartMate"
        subtitle="Your premier destination for high-quality lifestyle essentials, skincare, and everyday goods."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <div className="container editorial-container">
        <div className="editorial-layout">
          
          <main className="editorial-main-flow">
            <section className="editorial-block">
              <h2>Direct South African Retail</h2>
              <p>
                <strong>CartMate</strong> (<code>store.vylex.co.za</code>) was established to provide South Africans with a reliable source for premium everyday essentials, skincare, and high-quality lifestyle products without inflated markups.
              </p>
              <p>
                We source, inspect, and supply a curated range of high-performance goods directly to South African customers at honest, upfront prices.
              </p>
            </section>

            <section className="editorial-block">
              <h2>Local Warehousing & Nationwide Dispatch</h2>
              <p>
                We do not operate overseas drop-shipping with uncertain 30-day shipping windows. All products listed on our store are held in stock locally at our Johannesburg logistics facility.
              </p>
              <p>
                When an order is placed, our team packages it securely and hands it over to <strong>The Courier Guy</strong> for direct, door-to-door delivery with real-time tracking across all 9 provinces.
              </p>
            </section>

            <section className="editorial-block">
              <h2>Our Core Commitments</h2>
              <div className="pillars-grid-clean">
                <div className="pillar-item-clean">
                  <div className="pillar-icon-box">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3>Quality Assurance</h3>
                    <p>Every product is rigorously tested and verified to ensure it meets our strict quality standards.</p>
                  </div>
                </div>

                <div className="pillar-item-clean">
                  <div className="pillar-icon-box">
                    <Truck size={22} />
                  </div>
                  <div>
                    <h3>Nationwide Courier</h3>
                    <p>Reliable 1–3 business day delivery to major city centers via The Courier Guy Express.</p>
                  </div>
                </div>

                <div className="pillar-item-clean">
                  <div className="pillar-icon-box">
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3>7-Day Money Back</h3>
                    <p>Hassle-free 7-day returns and exchanges if you change your mind or need a replacement.</p>
                  </div>
                </div>

                <div className="pillar-item-clean">
                  <div className="pillar-icon-box">
                    <Check size={22} />
                  </div>
                  <div>
                    <h3>Curated Selection</h3>
                    <p>Carefully selected items that enhance your everyday life, from skincare routines to daily wellness.</p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Clean Sidebar */}
          <aside className="editorial-sidebar-clean">
            <div className="sidebar-summary-box">
              <h3>Store Highlights</h3>
              <ul className="sidebar-fact-list">
                <li>
                  <MapPin size={16} className="fact-icon" />
                  <div>
                    <strong>Location</strong>
                    <span>Johannesburg, Gauteng, South Africa</span>
                  </div>
                </li>
                <li>
                  <Truck size={16} className="fact-icon" />
                  <div>
                    <strong>Fulfillment Partner</strong>
                    <span>The Courier Guy Door-to-Door</span>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={16} className="fact-icon" />
                  <div>
                    <strong>Payment Options</strong>
                    <span>PayFast (Cards, Instant EFT, Capitec Pay)</span>
                  </div>
                </li>
              </ul>

              <div className="sidebar-cta-divider">
                <Link href="/shop" className="btn btn-primary" style={{ width: '100%' }}>
                  Browse All Products <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

