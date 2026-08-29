'use client';

import React, { useState } from 'react';
import {
  BatteryCharging, Headphones, Watch, Zap, Smartphone, 
  Leaf, Pill
} from 'lucide-react';
import { isImageUrl } from '@/lib/products';

export function ProductIcon({ name, className, alt = 'Product Image' }: { name: string, className?: string, alt?: string }) {
  const [imageError, setImageError] = useState(false);
  const normalized = (name || '').toLowerCase().trim();

  // If it's a real image URL and hasn't failed to load, render actual image
  if (isImageUrl(name) && !imageError) {
    return (
      <img
        src={name}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImageError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 'inherit'
        }}
      />
    );
  }

  // Map categories and item identifiers
  if (
    normalized === 'powerbank' || 
    normalized === 'power banks' || 
    normalized === '🔋' || 
    normalized === '🔌'
  ) {
    return <BatteryCharging className={className} strokeWidth={1.5} />;
  }
  if (
    normalized === 'earbuds' || 
    normalized === '🎧' ||
    normalized === 'audio'
  ) {
    return <Headphones className={className} strokeWidth={1.5} />;
  }
  if (
    normalized === 'smartwatch' || 
    normalized === 'smartwatches' || 
    normalized === '⌚'
  ) {
    return <Watch className={className} strokeWidth={1.5} />;
  }
  if (
    normalized === 'charger' || 
    normalized === 'chargers' || 
    normalized === '⚡'
  ) {
    return <Zap className={className} strokeWidth={1.5} />;
  }
  if (
    normalized === 'supplements' ||
    normalized === 'herbal supplements' ||
    normalized === 'chlorophyll' ||
    normalized === 'vitamins' ||
    normalized === 'herbal' ||
    normalized === '🌱' ||
    normalized === '🌿'
  ) {
    return <Leaf className={className} strokeWidth={1.5} />;
  }
  if (
    normalized === 'pills' ||
    normalized === 'health' ||
    normalized === '💊'
  ) {
    return <Pill className={className} strokeWidth={1.5} />;
  }

  // If the image is a single emoji character (e.g. from manual/csv upload), render it directly
  if (name && name.length <= 4) {
    return (
      <span className={className} style={{ fontSize: '3rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {name}
      </span>
    );
  }

  return <Smartphone className={className} strokeWidth={1.5} />;
}
