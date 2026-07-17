import {
  BatteryCharging, Headphones, Watch, Zap, Smartphone
} from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  sku: string;
  slug: string;
  description: string;
  specifications?: string[];
  images: string[];
  stock_quantity?: number;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  variant?: string;
}

// Seed / Mock products for tech accessories dropshipping store
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'vy-nc20-blk',
    title: 'Vylex NeoCharge 20K Power Bank',
    category: 'Power Banks',
    price: 799.00,
    sku: 'VY-NC20-BLK',
    slug: 'vylex-neocharge-20k-power-bank',
    description: 'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs, and an LED battery percentage indicator. Charges smartphones 4-5 times.',
    specifications: ['20,000mAh Lithium Polymer battery', '22.5W Fast Charging PD 3.0', '1x USB-C Input/Output, 2x USB-A Output', 'Digital LED Battery Display', 'Flight approved safety multi-protect'],
    images: ['powerbank'],
  },
  {
    id: 'vy-wpp-wht',
    title: 'Vylex WavePods Pro Earbuds',
    category: 'Earbuds',
    price: 1299.00,
    sku: 'VY-WPP-WHT',
    slug: 'vylex-wavepods-pro-earbuds',
    description: 'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of playtime with the wireless charging case. Smart touch controls and water-resistant rating IPX7.',
    specifications: ['Active Noise Cancellation up to 30dB', 'Bluetooth 5.3 low-latency connection', '36 hours total battery life with case', 'IPX7 Water & Sweat Resistant', 'Smart touch controls with voice assistant support'],
    images: ['earbuds'],
  },
  {
    id: 'vy-tfv4-gry',
    title: 'Vylex TitanFit Smartwatch V4',
    category: 'Smartwatches',
    price: 1899.00,
    sku: 'VY-TFV4-GRY',
    slug: 'vylex-titanfit-smartwatch-v4',
    description: 'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, GPS tracking, and sleep analysis. Compatible with Android & iOS. 10-day battery life.',
    specifications: ['1.9" Always-on AMOLED Display', 'Heart rate, SpO2, and Sleep tracking', '100+ Sports tracking modes', 'GPS route tracing via app connectivity', '10-day battery life on a single charge'],
    images: ['smartwatch'],
  },
  {
    id: 'vy-sp65-gan',
    title: 'Vylex SuperPort 65W GaN Charger',
    category: 'Chargers',
    price: 549.00,
    sku: 'VY-SP65-GAN',
    slug: 'vylex-superport-65w-gan-charger',
    description: 'Ultra-compact Gallium Nitride (GaN) wall charger. Features 2x USB-C PD ports and 1x USB-A port. Safely fast-charge your MacBook, tablet, smartwatch, and smartphone simultaneously.',
    specifications: ['65W Total Power output via GaN Technology', '2x USB-C Power Delivery ports, 1x USB-A port', 'Intelligent power allocation control', 'Advanced over-temperature & short-circuit protection', 'Extremely compact foldable plug design'],
    images: ['charger'],
  }
];

export const CATEGORIES = ['All', 'Earbuds', 'Power Banks', 'Smartwatches', 'Chargers'];

export const ProductIcon = ({ name, className }: { name: string, className?: string }) => {
  const normalized = (name || '').toLowerCase().trim();

  // Map categories, item identifiers, and emojis to correct Lucide components
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
    normalized === '🎧'
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

  // If the image is a single emoji character (e.g. from manual/csv upload), render it directly
  if (name && name.length <= 3) {
    return (
      <span className={className} style={{ fontSize: '3rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {name}
      </span>
    );
  }

  return <Smartphone className={className} strokeWidth={1.5} />;
};
