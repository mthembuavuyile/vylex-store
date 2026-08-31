'use client';

import React, { useState } from 'react';
import {
  BatteryCharging, Headphones, Watch, Zap, Smartphone, 
  Leaf, Pill
} from 'lucide-react';
import { isImageUrl } from '@/lib/products';

// Maps an icon key string to the corresponding Lucide icon component
function getIconForKey(key: string) {
  const normalized = (key || '').toLowerCase().trim();

  if (
    normalized === 'powerbank' || 
    normalized === 'power banks' || 
    normalized === '🔋' || 
    normalized === '🔌'
  ) {
    return BatteryCharging;
  }
  if (
    normalized === 'earbuds' || 
    normalized === '🎧' ||
    normalized === 'audio'
  ) {
    return Headphones;
  }
  if (
    normalized === 'smartwatch' || 
    normalized === 'smartwatches' || 
    normalized === '⌚'
  ) {
    return Watch;
  }
  if (
    normalized === 'charger' || 
    normalized === 'chargers' || 
    normalized === '⚡'
  ) {
    return Zap;
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
    return Leaf;
  }
  if (
    normalized === 'pills' ||
    normalized === 'health' ||
    normalized === '💊'
  ) {
    return Pill;
  }

  return null;
}

export function ProductIcon({ name, iconKey, className, alt = 'Product Image' }: { name: string, iconKey?: string | null, className?: string, alt?: string }) {
  const [imageError, setImageError] = useState(false);

  // 1. If it's a real image URL and hasn't failed to load, render actual image
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

  // 2. If an explicit iconKey is provided, use it as the primary icon lookup
  if (iconKey) {
    const IconFromKey = getIconForKey(iconKey);
    if (IconFromKey) {
      return <IconFromKey className={className} strokeWidth={1.5} />;
    }
  }

  // 3. Fall back to matching the name string against known category keywords
  const IconFromName = getIconForKey(name);
  if (IconFromName) {
    return <IconFromName className={className} strokeWidth={1.5} />;
  }

  // 4. If the image is a single emoji character, render it directly
  if (name && name.length <= 4) {
    return (
      <span className={className} style={{ fontSize: '3rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {name}
      </span>
    );
  }

  // 5. Final fallback
  return <Smartphone className={className} strokeWidth={1.5} />;
}

