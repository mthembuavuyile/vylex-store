import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(251, 169, 25, 0.1)', color: 'var(--orange)', marginBottom: '24px' }}>
          <Compass size={32} />
        </div>

        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        
        <p className="error-description">
          Lost in Tech? The link you followed has powered down, or the page has moved to a new socket. Let's get you back online.
        </p>

        <div className="error-actions">
          <Link href="/" className="error-btn-primary">
            <ArrowLeft size={18} />
            Back to Catalog
          </Link>
        </div>

        <h2 className="error-categories-title">Quick Categories</h2>
        <div className="error-categories-grid">
          <Link href="/#catalog" className="error-category-link">
            Smartwatches
          </Link>
          <Link href="/#catalog" className="error-category-link">
            Power Banks
          </Link>
          <Link href="/#catalog" className="error-category-link">
            Earbuds
          </Link>
          <Link href="/#catalog" className="error-category-link">
            Chargers
          </Link>
        </div>
      </div>
    </div>
  );
}
