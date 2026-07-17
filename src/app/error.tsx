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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', marginBottom: '24px' }}>
          <AlertOctagon size={32} />
        </div>

        <div className="error-code" style={{ background: 'linear-gradient(135deg, var(--red) 30%, var(--navy) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          500
        </div>
        <h1 className="error-title">System Glitch</h1>
        
        <p className="error-description">
          Something went offline. Our systems encountered an unexpected technical error. Let's try reconnecting your session.
        </p>

        <div className="error-actions">
          <button 
            onClick={handleReset} 
            className="error-btn-primary" 
            disabled={isResetting}
            style={{ opacity: isResetting ? 0.7 : 1 }}
          >
            <RefreshCw size={18} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Reconnecting...' : 'Try Reconnecting'}
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
          {showDetails ? 'Hide Diagnostic Logs' : 'Show Diagnostic Logs'}
        </button>

        {showDetails && (
          <div className="error-diagnostics-content">
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--orange)' }}>
              DIAGNOSTIC REPORT:
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
