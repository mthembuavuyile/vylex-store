'use client';

import React from 'react';

interface PaymentBadgesProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function PaymentBadges({ className = '', size = 'md' }: PaymentBadgesProps) {
  const isSm = size === 'sm';
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: isSm ? '2px 7px' : '4px 9px',
    height: isSm ? '24px' : '30px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div
      className={`payment-badges-row ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '6px' : '8px',
        flexWrap: 'wrap',
      }}
      aria-label="Supported Payment Methods: Visa, PayFast, Mastercard"
    >
      {/* Visa */}
      <span style={badgeStyle} title="Visa">
        <svg viewBox="0 0 48 16" style={{ height: isSm ? '11px' : '14px', width: 'auto', display: 'block' }}>
          <path fill="#1434CB" d="M19.5 0.5l-3.2 15h-2.6l3.2-15h2.6zm13.1 9.8c0-2.4-3.3-2.6-3.3-3.7 0-.8.9-1.2 1.8-1.2 1.2 0 2.4.4 3.1.9l.6-2.5c-.8-.3-1.9-.6-3.2-.6-3.3 0-5.6 1.8-5.6 4.3 0 2.6 3.6 2.7 3.6 4.1 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.8-.5-3.6-1.1l-.6 2.6c1 .5 2.4.8 3.8.8 3.6 0 6.1-1.8 6.1-4.6zm8.8 5.2h2.4l-2.1-15h-2.2c-.7 0-1.3.4-1.6 1l-5.6 14h2.7l.5-1.5h3.4l.5 1.5zm-2.9-3.8l1.4-4 0.8 4h-2.2zm-28.7-11.2l-2.6 10.4c-.2.7-.7 1.2-1.4 1.2-1 0-2.6-.9-3.8-2.2l4.8-14.4h3z"/>
          <polygon fill="#F9A01B" points="6.8,0.5 0.5,0.5 0.4,1 3.5,4.7 5.1,0.5"/>
        </svg>
      </span>

      {/* PayFast */}
      <span style={badgeStyle} title="PayFast Gateway">
        <img
          src="/images/payments/payfast.png"
          alt="PayFast"
          style={{
            height: isSm ? '13px' : '17px',
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </span>

      {/* Mastercard */}
      <span style={badgeStyle} title="Mastercard">
        <svg viewBox="0 0 36 22" style={{ height: isSm ? '13px' : '17px', width: 'auto', display: 'block' }}>
          <circle cx="12" cy="11" r="10" fill="#EB001B" />
          <circle cx="24" cy="11" r="10" fill="#F79E1B" />
          <path d="M18 4.2a10 10 0 0 1 0 13.6 10 10 0 0 1 0-13.6z" fill="#FF5F00" />
        </svg>
      </span>
    </div>
  );
}

