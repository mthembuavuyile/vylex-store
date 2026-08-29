'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/products';
import { ShieldCheck, Truck, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col">
            <Link href="/" className="logo logo-light" style={{ marginBottom: '16px' }}>
              <img 
                src="/logo.png" 
                alt="Vybetek Logo" 
                width="32" 
                height="32" 
                style={{ flexShrink: 0, objectFit: 'contain' }} 
              />
              <span className="logo-text">vybetek</span>
            </Link>
            <p style={{ maxWidth: '300px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.7)' }}>
              Premium online technology retail store. High-performance power banks, wireless audio, smart wearables, and chargers dispatched direct across South Africa.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <a
                href="https://wa.me/27821234567?text=Hi%20Vybetek%20Store"
                target="_blank"
                rel="noreferrer"
                style={{ 
                  color: '#10B981', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}
              >
                <MessageSquare size={16} /> WhatsApp Support
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="footer-col">
            <h3>Shop Catalog</h3>
            <ul className="footer-links">
              <li>
                <Link href="/shop">All Products</Link>
              </li>
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <li key={cat}>
                  <Link href={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="footer-col">
            <h3>Customer Care</h3>
            <ul className="footer-links">
              <li>
                <Link href="/shipping">Shipping & Deliveries</Link>
              </li>
              <li>
                <Link href="/refund">Refund & Return Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/about">About Vybetek</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/admin" style={{ color: 'var(--orange)', fontWeight: 600 }}>
                  Staff Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Value Guarantee */}
          <div className="footer-col">
            <h3>Our Guarantee</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Truck size={18} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>The Courier Guy:</strong> Fast door-to-door nationwide delivery across all 9 provinces.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>7-Day Returns:</strong> Hassle-free exchanges and money-back guarantee.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Vybetek. All rights reserved.
          </p>
          <p style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a 
              href="https://vylex.co.za" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--orange)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              vylex.co.za
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
