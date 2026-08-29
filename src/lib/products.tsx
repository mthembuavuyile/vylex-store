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


// Helper to normalize and check if an image identifier is a real URL
export function isImageUrl(str?: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim().toLowerCase();
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/') || s.startsWith('data:image') || s.startsWith('blob:');
}

// Re-export ProductIcon from component
export { ProductIcon } from '@/components/ProductIcon';
