'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, setIsCartOpen } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          {/* Brand Logo */}
          <Link href="/" className="logo logo-light">
            <img 
              src="/logo.png" 
              alt="CartMate Logo" 
              width="36" 
              height="36" 
              style={{ flexShrink: 0, objectFit: 'contain' }} 
            />
            <span className="logo-text">CartMate</span>
          </Link>

          {/* Desktop Search */}
          <div className="header-search-desktop">
            <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
              <Search size={16} className="search-icon-left" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ padding: '8px 14px 8px 38px', fontSize: '0.85rem' }}
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-desktop">
            <Link href="/shop" className="nav-link">
              Shop
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
            <Link href="/admin" className="nav-link" style={{ color: 'var(--orange)' }}>
              Staff Admin
            </Link>
          </nav>

          {/* Actions: Cart & Mobile Hamburger */}
          <div className="header-actions">
            <button 
              className="cart-trigger" 
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={22} />
              <span className="cart-badge">{cartCount}</span>
            </button>

            <button 
              className="mobile-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
