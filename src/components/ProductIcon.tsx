'use client';

import React, { useState } from 'react';
import {
  BatteryCharging, Headphones, Watch, Zap, Smartphone, 
  Leaf, Pill, ShoppingBag, Sparkles, Home, Laptop, Dumbbell, Package, Shirt, Tag
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
    normalized === 'audio' ||
    normalized === 'headphones' ||
    normalized === 'speakers'
  ) {
    return Headphones;
  }
  if (
    normalized === 'smartwatch' || 
    normalized === 'smartwatches' || 
    normalized === 'watch' ||
    normalized === 'watches' ||
    normalized === '⌚'
  ) {
    return Watch;
  }
  if (
    normalized === 'charger' || 
    normalized === 'chargers' || 
    normalized === 'cables' ||
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
    normalized === 'wellness' ||
    normalized === '🌱' ||
    normalized === '🌿'
  ) {
    return Leaf;
  }
  if (
    normalized === 'pills' ||
    normalized === 'health' ||
    normalized === 'medical' ||
    normalized === '💊'
  ) {
    return Pill;
  }
  if (
    normalized === 'skincare' ||
    normalized === 'beauty' ||
    normalized === 'cosmetics' ||
    normalized === 'care' ||
    normalized === '✨'
  ) {
    return Sparkles;
  }
  if (
    normalized === 'clothing' ||
    normalized === 'apparel' ||
    normalized === 'fashion' ||
    normalized === 'wear'
  ) {
    return Shirt;
  }
  if (
    normalized === 'bags' ||
    normalized === 'accessories' ||
    normalized === 'store'
  ) {
    return ShoppingBag;
  }
  if (
    normalized === 'home' ||
    normalized === 'kitchen' ||
    normalized === 'living'
  ) {
    return Home;
  }
  if (
    normalized === 'electronics' ||
    normalized === 'computers' ||
    normalized === 'laptops' ||
    normalized === 'tech'
  ) {
    return Laptop;
  }
  if (
    normalized === 'fitness' ||
    normalized === 'gym' ||
    normalized === 'sports'
  ) {
    return Dumbbell;
  }
  if (
    normalized === 'smartphone' ||
    normalized === 'phone' ||
    normalized === 'phones' ||
    normalized === 'mobile' ||
    normalized === '📱'
  ) {
    return Smartphone;
  }
  if (
    normalized === 'general' ||
    normalized === 'merchandise' ||
    normalized === 'package' ||
    normalized === 'essentials' ||
    normalized === '📦'
  ) {
    return Package;
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
  return <Package className={className} strokeWidth={1.5} />;
}


