'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Truck, Clock, PackageCheck, MapPin, 
  ShieldCheck, HelpCircle, ArrowRight 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function ShippingPage() {
  return (
    <div>
      <PageHeader 
        title="Shipping & Deliveries"
        subtitle="Fast, tracked courier delivery across all 9 provinces in South Africa direct to your door."
        badge="Nationwide Courier"
        breadcrumbs={[{ label: 'Shipping Policy' }]}
      />

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div className="editorial-content-grid">
          
          <div className="editorial-main">
            
            {/* Overview */}
            <section className="editorial-section">
              <h2>Express Door-to-Door Delivery</h2>
              <p>
                We partner with <strong>The Courier Guy</strong> to provide seamless, trackable parcel delivery across South Africa. Whether you are situated in a major city center or a regional town, your order is dispatched swiftly with full real-time SMS & email notifications.
              </p>
            </section>

            {/* Rates Table */}
            <section className="editorial-section">
              <h2>Shipping Rates & Free Delivery</h2>
              <div className="shipping-rates-cards">
                <div className="shipping-rate-card highlight">
                  <span className="rate-badge">Most Popular</span>
                  <h3>Standard Nationwide Courier</h3>
                  <div className="rate-price">R99.00</div>
                  <p>Flat-rate door-to-door delivery anywhere in South Africa for orders under R1,000.</p>
                </div>

                <div className="shipping-rate-card free">
                  <span className="rate-badge free-badge">Free Shipping</span>
                  <h3>Orders R1,000 and Above</h3>
                  <div className="rate-price">FREE</div>
                  <p>Automatically applied at checkout when your cart subtotal reaches R1,000 or more.</p>
                </div>
              </div>
            </section>

            {/* Timetable Breakdown */}
            <section className="editorial-section">
              <h2>Estimated Delivery Times</h2>
              <div className="custom-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Region / Destination</th>
                      <th>Estimated Transit Time</th>
                      <th>Carrier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Gauteng</strong> (Johannesburg, Pretoria, Centurion)</td>
                      <td>1 – 2 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td><strong>Western Cape</strong> (Cape Town, Stellenbosch)</td>
                      <td>2 – 3 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td><strong>KwaZulu-Natal</strong> (Durban, Umhlanga, Pietermaritzburg)</td>
                      <td>2 – 3 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td><strong>Eastern Cape / Free State / Mpumalanga / Limpopo</strong></td>
                      <td>2 – 4 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td><strong>Outlying & Remote Areas</strong></td>
                      <td>3 – 5 Business Days</td>
                      <td>The Courier Guy Regional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order Tracking */}
            <section className="editorial-section">
              <h2>Tracking Your Order</h2>
              <p>
                As soon as your package is scanned into The Courier Guy depot, you will receive an automatic dispatch email and SMS containing your unique <strong>waybill number</strong> and a live tracking link.
              </p>
              <p>
                You can monitor your parcel's journey from dispatch to final delivery in real time.
              </p>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="editorial-sidebar">
            <div className="info-box-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--navy)' }}>
                Dispatch Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--orange)', flexShrink: 0 }} />
                  <span><strong>14:00 Cut-Off:</strong> Orders placed before 14:00 Mon–Fri are dispatched on the same day.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <PackageCheck size={18} style={{ color: 'var(--orange)', flexShrink: 0 }} />
                  <span><strong>Weekend Orders:</strong> Orders placed over weekends are processed on Monday morning.</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--slate)' }}>
                <Link href="/shop" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Start Shopping <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
