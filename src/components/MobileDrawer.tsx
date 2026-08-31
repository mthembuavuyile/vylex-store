'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, Search, ShoppingBag, Info, MessageSquare, 
  Truck, RefreshCw, FileText, UserCheck, ChevronRight
} from 'lucide-react';
const CATEGORIES = ['All', 'Supplements', 'Earbuds', 'Power Banks', 'Smartwatches', 'Chargers'];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background page from scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <>
      <div className="mobile-nav-backdrop" onClick={onClose} />
      <div 
        className="mobile-nav-drawer-side"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <Link href="/" className="logo logo-light" onClick={onClose}>
            <img src="/logo.png" alt="CartMate Logo" width="28" height="28" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="logo-text">CartMate</span>
          </Link>
          <button className="mobile-drawer-close" onClick={onClose} aria-label="Close navigation menu">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mobile-drawer-search">
          <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
            <Search size={16} className="search-icon-left" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* Drawer Navigation Links */}
        <div className="mobile-drawer-body">
          {/* Main Store Pages */}
          <nav className="mobile-nav-group">
            <div className="drawer-section-title">Navigation</div>
            <ul className="mobile-menu-links">
              <li>
                <Link href="/" className="mobile-link" onClick={onClose}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="mobile-link highlight-link" onClick={onClose}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} style={{ color: 'var(--orange)' }} /> Shop All Products
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--orange)' }} />
                </Link>
              </li>
              <li>
                <Link href="/about" className="mobile-link" onClick={onClose}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="mobile-link" onClick={onClose}>
                  Contact & Support
                </Link>
              </li>
            </ul>
          </nav>

          {/* Shop Categories */}
          <div className="mobile-nav-group">
            <div className="drawer-section-title">Categories</div>
            <ul className="mobile-menu-links">
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <li key={cat}>
                  <Link 
                    href={`/shop?category=${encodeURIComponent(cat)}`} 
                    className="mobile-link"
                    onClick={onClose}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="mobile-nav-group">
            <div className="drawer-section-title">Customer Care</div>
            <ul className="mobile-menu-links">
              <li>
                <Link href="/shipping" className="mobile-link sub-link" onClick={onClose}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={15} /> Shipping & Deliveries
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/refund" className="mobile-link sub-link" onClick={onClose}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={15} /> Refund & Return Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="mobile-link sub-link" onClick={onClose}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} /> Terms & Conditions
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp Contact CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <a
              href="https://wa.me/27821234567?text=Hi%20CartMate%20Store%20Support"
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px'
              }}
              onClick={onClose}
            >
              <MessageSquare size={18} /> WhatsApp Live Support
            </a>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="mobile-drawer-footer">
          <Link href="/admin" className="mobile-admin-link" onClick={onClose}>
            <UserCheck size={14} /> Staff Admin Portal
          </Link>
        </div>
      </div>
    </>
  );
}
