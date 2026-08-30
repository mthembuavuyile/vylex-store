import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, SearchX, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-circle">
          <SearchX size={32} />
        </div>

        <div className="error-badge">
          Error 404
        </div>

        <h1 className="error-title">Page Not Found</h1>
        
        <p className="error-description">
          The page or product you are looking for does not exist, has been moved, or the link you followed may be incorrect.
        </p>

        <div className="error-actions">
          <Link href="/shop" className="error-btn-primary">
            <ShoppingBag size={18} />
            Browse Catalog
          </Link>
          
          <Link href="/" className="error-btn-secondary">
            <ArrowLeft size={18} />
            Return Home
          </Link>
        </div>

        <div className="error-categories-section">
          <h2 className="error-categories-title">Popular Categories</h2>
          <div className="error-categories-grid">
            <Link href="/shop?category=Smartwatches" className="error-category-link">
              Smartwatches
            </Link>
            <Link href="/shop?category=Power%20Banks" className="error-category-link">
              Power Banks
            </Link>
            <Link href="/shop?category=Earbuds" className="error-category-link">
              Earbuds
            </Link>
            <Link href="/shop?category=Chargers" className="error-category-link">
              Fast Chargers
            </Link>
            <Link href="/shop" className="error-category-link">
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

