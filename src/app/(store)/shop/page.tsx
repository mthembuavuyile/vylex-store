'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, X, ArrowUpDown, 
  Store, RotateCcw, ChevronDown, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product, CATEGORIES } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { PageHeader } from '@/components/PageHeader';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [pricePreset, setPricePreset] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL search parameters change
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q !== null) setSearchQuery(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, sku, category, images, stock_quantity, slug, specifications')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Error querying Supabase products:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Handle Preset Price click
  const handlePricePresetChange = (preset: string) => {
    setPricePreset(preset);
    if (preset === 'all') {
      setMinPrice(0);
      setMaxPrice(3000);
    } else if (preset === 'under-500') {
      setMinPrice(0);
      setMaxPrice(500);
    } else if (preset === '500-1000') {
      setMinPrice(500);
      setMaxPrice(1000);
    } else if (preset === '1000-2000') {
      setMinPrice(1000);
      setMaxPrice(2000);
    } else if (preset === 'over-2000') {
      setMinPrice(2000);
      setMaxPrice(5000);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Category Filter
        const matchesCategory = 
          selectedCategory === 'All' || 
          product.category?.toLowerCase() === selectedCategory.toLowerCase();

        // Search Query Filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !query || 
          product.title?.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query);

        // Price Filter
        const price = Number(product.price);
        const matchesPrice = price >= minPrice && price <= maxPrice;

        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === 'price-high') {
          return Number(b.price) - Number(a.price);
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0; // 'featured' keeps original ordering
      });
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPricePreset('all');
    setMinPrice(0);
    setMaxPrice(3000);
    setSortBy('featured');
    router.replace('/shop');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    searchQuery.trim() !== '' || 
    pricePreset !== 'all' || 
    minPrice > 0 || 
    maxPrice < 3000 || 
    sortBy !== 'featured';

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  return (
    <div>
      <PageHeader 
        title="Shop All Products"
        subtitle="Explore our full collection of premium power banks, wireless audio, smartwatches, and fast chargers."
        badge="Direct South Africa Stock"
        breadcrumbs={[{ label: 'Shop Catalog' }]}
      />

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        
        {/* Top Control Bar (Search, Active Count, Sorting, Mobile Filter Trigger) */}
        <div className="shop-control-bar">
          {/* Mobile Filter Toggle */}
          <button 
            className="btn btn-outline shop-filter-mobile-btn" 
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>

          {/* Search bar inside shop */}
          <div className="shop-search-wrapper">
            <Search size={16} className="search-icon-left" />
            <input
              type="text"
              placeholder="Search by name, category, or specs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sdark)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="shop-sort-wrapper">
            <span style={{ fontSize: '0.85rem', color: 'var(--sdark)', whiteSpace: 'nowrap' }}>Sort by:</span>
            <div className="select-wrapper">
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="shop-sort-select"
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-asc">Product Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filter-chips">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sdark)' }}>Active Filters:</span>
            
            {selectedCategory !== 'All' && (
              <span className="filter-chip">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')}><X size={12} /></button>
              </span>
            )}

            {searchQuery && (
              <span className="filter-chip">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={12} /></button>
              </span>
            )}

            {pricePreset !== 'all' && (
              <span className="filter-chip">
                Price: R{minPrice} - R{maxPrice}
                <button onClick={() => handlePricePresetChange('all')}><X size={12} /></button>
              </span>
            )}

            <button 
              onClick={handleClearFilters}
              className="filter-clear-all"
            >
              <RotateCcw size={12} /> Reset All
            </button>
          </div>
        )}

        {/* Main 2-Column Layout (Sidebar + Product Grid) */}
        <div className="shop-layout-grid">
          
          {/* Desktop Filter Sidebar */}
          <aside className="shop-sidebar">
            <div className="shop-filter-panel">
              
              {/* Category Filter */}
              <div className="filter-section">
                <h3 className="filter-title">Categories</h3>
                <div className="filter-category-list">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`filter-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat}</span>
                      <span className="category-count">
                        {categoryCounts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-section">
                <h3 className="filter-title">Filter by Price</h3>
                
                {/* Price Presets */}
                <div className="price-presets-list">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-500', label: 'Under R500' },
                    { id: '500-1000', label: 'R500 – R1,000' },
                    { id: '1000-2000', label: 'R1,000 – R2,000' },
                    { id: 'over-2000', label: 'Over R2,000' },
                  ].map(preset => (
                    <label key={preset.id} className="price-preset-radio">
                      <input 
                        type="radio" 
                        name="price-preset" 
                        checked={pricePreset === preset.id}
                        onChange={() => handlePricePresetChange(preset.id)}
                      />
                      <span>{preset.label}</span>
                    </label>
                  ))}
                </div>

                {/* Custom Min / Max Range Inputs */}
                <div className="price-custom-inputs">
                  <div className="price-input-group">
                    <span className="price-currency">R</span>
                    <input 
                      type="number" 
                      min={0}
                      max={maxPrice}
                      value={minPrice}
                      onChange={e => {
                        setMinPrice(Number(e.target.value));
                        setPricePreset('custom');
                      }}
                      className="price-number-input"
                      placeholder="Min"
                    />
                  </div>
                  <span style={{ color: 'var(--sdark)' }}>to</span>
                  <div className="price-input-group">
                    <span className="price-currency">R</span>
                    <input 
                      type="number" 
                      min={minPrice}
                      max={10000}
                      value={maxPrice}
                      onChange={e => {
                        setMaxPrice(Number(e.target.value));
                        setPricePreset('custom');
                      }}
                      className="price-number-input"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="btn btn-outline" 
                  style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                >
                  <RotateCcw size={14} /> Clear All Filters
                </button>
              )}

            </div>
          </aside>

          {/* Product Results Column */}
          <main className="shop-results-column">
            
            {/* Results Count Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--sdark)', fontWeight: 500 }}>
                Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>

            {loading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="product-skeleton-card">
                    <div style={{ width: '100%', aspectRatio: '4/3', background: '#e2e8f0', borderRadius: '10px', marginBottom: '12px' }} />
                    <div style={{ width: '40%', height: '12px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '85%', height: '16px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }} />
                    <div style={{ width: '60%', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="shop-empty-state">
                <Store size={48} style={{ color: 'var(--sdark)', marginBottom: '16px' }} />
                <h3>No matching products found</h3>
                <p>
                  No items matched your current filter criteria. Try expanding your price range or clearing search keywords.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  <RotateCcw size={16} /> Reset All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Mobile Filters Modal Drawer */}
      {isMobileFilterOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="shop-mobile-filter-drawer">
            <div className="mobile-drawer-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--orange)' }} /> Filter Catalog
              </h3>
              <button 
                className="mobile-drawer-close" 
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* Category */}
              <div className="filter-section">
                <h4 className="filter-title">Category</h4>
                <div className="filter-category-list">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`filter-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat}</span>
                      <span className="category-count">
                        {categoryCounts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="filter-section" style={{ marginTop: '20px' }}>
                <h4 className="filter-title">Price Range</h4>
                <div className="price-presets-list">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-500', label: 'Under R500' },
                    { id: '500-1000', label: 'R500 – R1,000' },
                    { id: '1000-2000', label: 'R1,000 – R2,000' },
                    { id: 'over-2000', label: 'Over R2,000' },
                  ].map(preset => (
                    <label key={preset.id} className="price-preset-radio">
                      <input 
                        type="radio" 
                        name="mobile-price-preset" 
                        checked={pricePreset === preset.id}
                        onChange={() => handlePricePresetChange(preset.id)}
                      />
                      <span>{preset.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-drawer-footer" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleClearFilters}
                className="btn btn-outline" 
                style={{ flex: 1, color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                Reset
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn btn-primary" 
                style={{ flex: 2 }}
              >
                View {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p>Loading shop catalog...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
