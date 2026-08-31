'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Truck, Clock, PackageCheck, 
  ShieldCheck, ArrowRight 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function ShippingPage() {
  return (
    <div className="shipping-page">
      <PageHeader 
        title="Shipping & Deliveries"
        subtitle="Trackable door-to-door courier delivery across all 9 provinces in South Africa."
        breadcrumbs={[{ label: 'Shipping Policy' }]}
      />

      <div className="container editorial-container">
        <div className="editorial-layout">
          
          <main className="editorial-main-flow">
            
            {/* Overview */}
            <section className="editorial-block">
              <h2>Door-to-Door Nationwide Delivery</h2>
              <p>
                We partner with <strong>The Courier Guy</strong> to provide fast, insured, and trackable parcel delivery across South Africa. All orders are dispatched with real-time SMS & email waybill notifications.
              </p>
            </section>

            {/* Rates */}
            <section className="editorial-block">
              <h2>Shipping Rates</h2>
              <div className="rates-grid-clean">
                <div className="rate-card-clean">
                  <div className="rate-card-header">
                    <h3>Standard Nationwide Courier</h3>
                    <span className="rate-amount">R99.00</span>
                  </div>
                  <p>Flat-rate door-to-door delivery anywhere in South Africa for orders under R1,000.</p>
                </div>

                <div className="rate-card-clean free-tier">
                  <div className="rate-card-header">
                    <h3>Free Courier Delivery</h3>
                    <span className="rate-amount free-highlight">FREE</span>
                  </div>
                  <p>Automatically applied at checkout on all orders with a subtotal of R1,000 or more.</p>
                </div>
              </div>
            </section>

            {/* Responsive Timetable */}
            <section className="editorial-block">
              <h2>Estimated Delivery Times</h2>
              <p className="table-scroll-hint">
                Scroll horizontally to view transit details across regions &rarr;
              </p>
              <div className="table-responsive-container">
                <table className="clean-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '42%', minWidth: '150px' }}>Region / Destination</th>
                      <th style={{ width: '28%', minWidth: '125px' }}>Estimated Transit</th>
                      <th style={{ width: '30%', minWidth: '140px' }}>Carrier Partner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Gauteng</strong>
                        <span className="table-subtext">Johannesburg, Pretoria, Centurion</span>
                      </td>
                      <td>1 – 2 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Western Cape</strong>
                        <span className="table-subtext">Cape Town, Stellenbosch, Paarl</span>
                      </td>
                      <td>2 – 3 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>KwaZulu-Natal</strong>
                        <span className="table-subtext">Durban, Umhlanga, Pietermaritzburg</span>
                      </td>
                      <td>2 – 3 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Other Provinces</strong>
                        <span className="table-subtext">Eastern Cape, Free State, Mpumalanga, Limpopo, NW</span>
                      </td>
                      <td>2 – 4 Business Days</td>
                      <td>The Courier Guy Express</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Regional & Outlying Areas</strong>
                        <span className="table-subtext">Farms, plots & remote postal routes</span>
                      </td>
                      <td>3 – 5 Business Days</td>
                      <td>The Courier Guy Regional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order Tracking */}
            <section className="editorial-block">
              <h2>Tracking Your Parcel</h2>
              <p>
                Once your order is processed at our Johannesburg hub, you will receive an automatic email and SMS with your <strong>waybill number</strong> and direct tracking URL.
              </p>
              <p>
                You can track the live status of your courier parcel directly on The Courier Guy tracking portal 24/7.
              </p>
            </section>

          </main>

          {/* Clean Sidebar */}
          <aside className="editorial-sidebar-clean">
            <div className="sidebar-summary-box">
              <h3>Dispatch Schedule</h3>
              <ul className="sidebar-fact-list">
                <li>
                  <Clock size={16} className="fact-icon" />
                  <div>
                    <strong>14:00 Daily Cut-Off</strong>
                    <span>Orders placed before 14:00 (Mon–Fri) are handed to the courier the same day.</span>
                  </div>
                </li>
                <li>
                  <PackageCheck size={16} className="fact-icon" />
                  <div>
                    <strong>Weekend Orders</strong>
                    <span>Orders placed over the weekend are prioritized and dispatched Monday morning.</span>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={16} className="fact-icon" />
                  <div>
                    <strong>Parcel Insurance</strong>
                    <span>All shipments are fully insured against transit loss or physical damage.</span>
                  </div>
                </li>
              </ul>

              <div className="sidebar-cta-divider">
                <Link href="/shop" className="btn btn-primary" style={{ width: '100%' }}>
                  Start Shopping <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

