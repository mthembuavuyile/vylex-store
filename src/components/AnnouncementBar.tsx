'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auto-dismiss the announcement bar after 30 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 30000);

    return () => clearTimeout(dismissTimer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 400); // match CSS animation duration
  };

  if (!mounted || !isVisible) {
    return null;
  }

  const announcementText = "🇿🇦 Fast Courier Delivery across South Africa • Free Delivery on Orders Over R1,000";

  return (
    <aside 
      className={`announcement-bar ${isClosing ? 'closing' : ''}`}
      aria-label="Delivery Announcement"
    >
      <div className="announcement-content">
        {/* Desktop single centered line */}
        <span className="announcement-desktop-text">
          {announcementText}
        </span>

        {/* Mobile single horizontal ticker stream */}
        <div className="announcement-mobile-marquee" aria-hidden="true">
          <div className="announcement-ticker-track">
            <span>{announcementText}</span>
            <span className="announcement-ticker-spacer">•</span>
            <span>{announcementText}</span>
          </div>
        </div>

        {/* Subtle manual close button */}
        <button
          type="button"
          onClick={handleClose}
          className="announcement-close-btn"
          aria-label="Dismiss announcement"
          title="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
