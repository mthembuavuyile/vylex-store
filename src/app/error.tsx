'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertOctagon, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error('Captured Runtime Error:', error);
  }, [error]);

  const handleReset = () => {
    setIsResetting(true);
    // Call the reset function to attempt to re-render the segment
    try {
      reset();
    } catch (err) {
      console.error('Failed to reset error boundary:', err);
    } finally {
      setTimeout(() => setIsResetting(false), 800);
    }
  };

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-circle error-500">
          <AlertOctagon size={32} />
        </div>

        <div className="error-badge" style={{ color: 'var(--red)', background: 'var(--red-light)', borderColor: 'var(--red-border)' }}>
          Server Error 500
        </div>

        <h1 className="error-title">Something Went Wrong</h1>
        
        <p className="error-description">
          We encountered an unexpected issue while loading this page. You can retry loading or return to the store homepage.
        </p>

        <div className="error-actions">
          <button 
            onClick={handleReset} 
            className="error-btn-primary" 
            disabled={isResetting}
            style={{ opacity: isResetting ? 0.7 : 1 }}
          >
            <RefreshCw size={18} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Retrying...' : 'Try Again'}
          </button>
          
          <Link href="/" className="error-btn-secondary">
            <Home size={18} />
            Return to Store
          </Link>
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)} 
          className="error-diagnostics-toggle"
        >
          {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
        </button>

        {showDetails && (
          <div className="error-diagnostics-content">
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--orange)' }}>
              ERROR DETAILS:
            </div>
            <div><strong>Message:</strong> {error.message || 'Unknown runtime error'}</div>
            {error.digest && <div style={{ marginTop: '4px' }}><strong>Digest ID:</strong> {error.digest}</div>}
            <div style={{ marginTop: '8px', opacity: 0.6 }}>
              Timestamp: {new Date().toISOString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
