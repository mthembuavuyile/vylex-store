export interface ProductSpecItem {
  key: string;
  value: string;
}

export type ProductSpecification = string | ProductSpecItem;

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  sku: string;
  slug: string;
  description: string;
  vendor?: string;
  status?: 'active' | 'draft' | 'archived';
  is_featured?: boolean;
  tags?: string[];
  specifications?: ProductSpecification[];
  images: string[];
  stock_quantity?: number;
  low_stock_threshold?: number;
  allow_backorder?: boolean;
  weight_kg?: number;
  seo_title?: string;
  seo_description?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
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

// Seed / Mock products including tech and supplements
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'vy-org-chl-500',
    title: 'True Organics Liquid Chlorophyll Juice (500 ml)',
    category: 'Supplements',
    vendor: 'True Organics',
    price: 150.00,
    compare_at_price: 185.00,
    cost_price: 75.00,
    sku: 'TO-CHL-500ML',
    slug: 'true-organics-liquid-chlorophyll-juice-500-ml',
    status: 'active',
    is_featured: true,
    tags: ['chlorophyll', 'vegan', 'antioxidant', 'supplements', 'liquid', 'detox'],
    description: 'True Organics Liquid Chlorophyll Juice 500ml – premium vegan-friendly antioxidant supplement in bioavailable liquid form. Supports natural internal detox, energetic vitality, skin health, and cellular repair.',
    specifications: [
      { key: 'Form', value: 'Liquid Extract' },
      { key: 'Volume', value: '500 ml' },
      { key: 'Dietary', value: '100% Vegan, Non-GMO, Gluten-Free' },
      { key: 'Target Health Goal', value: 'Internal Cleansing, Antioxidant Support' },
      { key: 'Flavor', value: 'Natural Spearmint Fresh' },
      { key: 'Serving Size', value: '15 ml in water daily' }
    ],
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
    stock_quantity: 85,
    low_stock_threshold: 10,
    allow_backorder: false,
    weight_kg: 0.55,
    seo_title: 'True Organics Liquid Chlorophyll Juice 500ml | Vegan Antioxidant Supplement',
    seo_description: 'True Organics Liquid Chlorophyll Juice 500ml – vegan-friendly antioxidant supplement in liquid form. Fast delivery across South Africa.',
    source: 'manual'
  },
  {
    id: 'vy-nc20-blk',
    title: 'Vybetek NeoCharge 20K Power Bank',
    category: 'Power Banks',
    vendor: 'VybeTek',
    price: 799.00,
    compare_at_price: 949.00,
    cost_price: 420.00,
    sku: 'VY-NC20-BLK',
    slug: 'vybetek-neocharge-20k-power-bank',
    status: 'active',
    is_featured: true,
    tags: ['powerbank', 'fast-charge', 'usb-c', 'portable'],
    description: 'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs, and an LED battery percentage indicator. Charges smartphones 4-5 times.',
    specifications: [
      { key: 'Capacity', value: '20,000mAh Lithium Polymer' },
      { key: 'Fast Charging', value: '22.5W PD 3.0 & QC 4.0' },
      { key: 'Ports', value: '1x USB-C In/Out, 2x USB-A Out' },
      { key: 'Display', value: 'Digital LED Battery Percentage' }
    ],
    images: ['powerbank'],
    stock_quantity: 45,
    low_stock_threshold: 5,
    seo_title: 'Vybetek NeoCharge 20K Power Bank | 22.5W Fast Charging PD',
    seo_description: 'High-capacity 20,000mAh power bank with 22.5W Power Delivery and dual USB ports. Shop at VybeTek.',
    source: 'manual'
  },
  {
    id: 'vy-wpp-wht',
    title: 'Vybetek WavePods Pro Earbuds',
    category: 'Earbuds',
    vendor: 'VybeTek',
    price: 1299.00,
    compare_at_price: 1499.00,
    cost_price: 650.00,
    sku: 'VY-WPP-WHT',
    slug: 'vybetek-wavepods-pro-earbuds',
    status: 'active',
    is_featured: true,
    tags: ['audio', 'wireless', 'anc', 'bluetooth'],
    description: 'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of playtime with the wireless charging case. Smart touch controls and water-resistant rating IPX7.',
    specifications: [
      { key: 'ANC Depth', value: 'Active Noise Cancellation up to 30dB' },
      { key: 'Bluetooth', value: 'Version 5.3 Ultra Low-Latency' },
      { key: 'Battery Life', value: 'Up to 36 Hours with Charging Case' },
      { key: 'Water Resistance', value: 'IPX7 Sweat & Rain Proof' }
    ],
    images: ['earbuds'],
    stock_quantity: 12,
    low_stock_threshold: 5,
    seo_title: 'Vybetek WavePods Pro ANC Earbuds | 36hr Battery',
    seo_description: 'Active Noise Cancelling wireless earbuds with bluetooth 5.3 and 36-hour playtime. Order online.',
    source: 'manual'
  },
  {
    id: 'vy-tfv4-gry',
    title: 'Vybetek TitanFit Smartwatch V4',
    category: 'Smartwatches',
    vendor: 'VybeTek',
    price: 1899.00,
    compare_at_price: 2199.00,
    cost_price: 950.00,
    sku: 'VY-TFV4-GRY',
    slug: 'vybetek-titanfit-smartwatch-v4',
    status: 'active',
    is_featured: true,
    tags: ['wearables', 'smartwatch', 'fitness', 'amoled'],
    description: 'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, GPS tracking, and sleep analysis. Compatible with Android & iOS. 10-day battery life.',
    specifications: [
      { key: 'Display', value: '1.9" Always-on HD AMOLED' },
      { key: 'Health Tracking', value: 'Heart Rate, SpO2 & Sleep Monitor' },
      { key: 'Sports Modes', value: '100+ Built-in Fitness Workouts' },
      { key: 'Battery', value: '10-day Endurance on Single Charge' }
    ],
    images: ['smartwatch'],
    stock_quantity: 8,
    low_stock_threshold: 5,
    seo_title: 'Vybetek TitanFit Smartwatch V4 | AMOLED & GPS',
    seo_description: 'Premium smartwatch featuring 1.9" AMOLED display, SpO2, heart rate, and GPS tracking.',
    source: 'manual'
  },
  {
    id: 'vy-sp65-gan',
    title: 'Vybetek SuperPort 65W GaN Charger',
    category: 'Chargers',
    vendor: 'VybeTek',
    price: 549.00,
    compare_at_price: 649.00,
    cost_price: 280.00,
    sku: 'VY-SP65-GAN',
    slug: 'vybetek-superport-65w-gan-charger',
    status: 'active',
    is_featured: false,
    tags: ['chargers', 'gan', 'fast-charge', 'macbook'],
    description: 'Ultra-compact Gallium Nitride (GaN) wall charger. Features 2x USB-C PD ports and 1x USB-A port. Safely fast-charge your MacBook, tablet, smartwatch, and smartphone simultaneously.',
    specifications: [
      { key: 'Total Power', value: '65W GaN Fast Delivery' },
      { key: 'Port Configuration', value: '2x USB-C PD, 1x USB-A QC' },
      { key: 'Compatibility', value: 'Laptops, Tablets, iPhones & Android' }
    ],
    images: ['charger'],
    stock_quantity: 90,
    low_stock_threshold: 10,
    seo_title: 'Vybetek SuperPort 65W GaN Fast Charger | 3 Ports',
    seo_description: 'Ultra-compact Gallium Nitride 65W wall charger with 2 USB-C and 1 USB-A ports.',
    source: 'manual'
  }
];

export const CATEGORIES = ['All', 'Supplements', 'Earbuds', 'Power Banks', 'Smartwatches', 'Chargers'];

// Helper to normalize and check if an image identifier is a real URL
export function isImageUrl(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim().toLowerCase();
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/') || s.startsWith('data:image') || s.startsWith('blob:');
}

// Re-export ProductIcon from component
export { ProductIcon } from '@/components/ProductIcon';
