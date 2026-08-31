'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, X, 
  Store, RotateCcw, ChevronDown, Tag
} from 'lucide-react';
import { Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

interface ShopClientProps {
  initialProducts: Product[];
}

export function ShopClient({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Products from Server Component
  const products = initialProducts;

  // Collapsible Accordion Sections State
  const [openSections, setOpenSections] = useState<{
    categories: boolean;
    tags: boolean;
    price: boolean;
  }>({
    categories: true,
    tags: true,
    price: true,
  });

  const toggleSection = (section: 'categories' | 'tags' | 'price') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedTag, setSelectedTag] = useState<string>('');
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

  // Prevent background page from scrolling when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

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

  // Derive dynamic list of categories
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>(['All']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Derive popular tags
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    products.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        });
      }
    });
    return Object.keys(tagCount).slice(0, 10);
  }, [products]);

  // Filter & Sort Logic (Instant 0ms in-memory calculation)
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        if (product.status === 'draft') return false;

        // Category Filter
        const matchesCategory = 
          selectedCategory === 'All' || 
          product.category?.toLowerCase() === selectedCategory.toLowerCase();

        // Tag Filter
        const matchesTag = 
          !selectedTag || 
          (Array.isArray(product.tags) && product.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));

        // Search Query Filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !query || 
          product.title?.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.vendor?.toLowerCase().includes(query) ||
          (Array.isArray(product.tags) && product.tags.some(t => t.toLowerCase().includes(query))) ||
          product.sku?.toLowerCase().includes(query);

        // Price Filter
        const price = Number(product.price);
        const matchesPrice = price >= minPrice && price <= maxPrice;

        return matchesCategory && matchesTag && matchesSearch && matchesPrice;
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
        return 0; // 'featured'
      });
  }, [products, selectedCategory, selectedTag, searchQuery, minPrice, maxPrice, sortBy]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTag('');
    setPricePreset('all');
    setMinPrice(0);
    setMaxPrice(3000);
    setSortBy('featured');
    router.replace('/shop');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    selectedTag !== '' ||
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
    <>
      {/* Top Control Bar */}
      <div className="shop-control-bar">
        {/* Mobile Filter Toggle */}
        <button 
          className="btn btn-outline shop-filter-mobile-btn" 
          onClick={() => setIsMobileFilterOpen(true)}
          aria-label="Open Filters"
        >
          <SlidersHorizontal size={16} /> Filters {hasActiveFilters && <span className="filter-dot" />}
        </button>

        {/* Search bar inside shop */}
        <div className="shop-search-wrapper">
          <Search size={16} className="search-icon-left" />
          <input
            type="text"
            placeholder="Search by name, brand, tags, or specs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sdark)' }}
              aria-label="Clear search input"
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
              aria-label="Sort products"
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
              <button onClick={() => setSelectedCategory('All')} aria-label="Remove category filter"><X size={12} /></button>
            </span>
          )}

          {selectedTag && (
            <span className="filter-chip">
              Tag: #{selectedTag}
              <button onClick={() => setSelectedTag('')} aria-label="Remove tag filter"><X size={12} /></button>
            </span>
          )}

          {searchQuery && (
            <span className="filter-chip">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} aria-label="Remove search query filter"><X size={12} /></button>
            </span>
          )}

          {pricePreset !== 'all' && (
            <span className="filter-chip">
              Price: R{minPrice} - R{maxPrice}
              <button onClick={() => handlePricePresetChange('all')} aria-label="Reset price filter"><X size={12} /></button>
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
              <button 
                type="button" 
                className="filter-section-header"
                onClick={() => toggleSection('categories')}
                aria-expanded={openSections.categories}
              >
                <div className="filter-title-wrap">
                  <h3 className="filter-title">Categories</h3>
                  {selectedCategory !== 'All' && !openSections.categories && (
                    <span className="filter-active-indicator">{selectedCategory}</span>
                  )}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`filter-chevron ${openSections.categories ? 'open' : ''}`} 
                />
              </button>

              {openSections.categories && (
                <div className="filter-section-body">
                  <div className="filter-category-list">
                    {dynamicCategories.map(cat => (
                      <button
                        key={cat}
                        className={`filter-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedTag('');
                        }}
                      >
                        <span>{cat}</span>
                        <span className="category-count">
                          {categoryCounts[cat] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tag Filters */}
            {popularTags.length > 0 && (
              <div className="filter-section">
                <button 
                  type="button" 
                  className="filter-section-header"
                  onClick={() => toggleSection('tags')}
                  aria-expanded={openSections.tags}
                >
                  <div className="filter-title-wrap">
                    <h3 className="filter-title">Popular Tags</h3>
                    {selectedTag && !openSections.tags && (
                      <span className="filter-active-indicator">#{selectedTag}</span>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`filter-chevron ${openSections.tags ? 'open' : ''}`} 
                  />
                </button>

                {openSections.tags && (
                  <div className="filter-section-body">
                    <div className="filter-tags-list">
                      {popularTags.map(tag => {
                        const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                        return (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(isSelected ? '' : tag)}
                            className={`filter-tag-pill ${isSelected ? 'active' : ''}`}
                          >
                            <Tag size={10} /> {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Filter */}
            <div className="filter-section">
              <button 
                type="button" 
                className="filter-section-header"
                onClick={() => toggleSection('price')}
                aria-expanded={openSections.price}
              >
                <div className="filter-title-wrap">
                  <h3 className="filter-title">Filter by Price</h3>
                  {(pricePreset !== 'all' || minPrice > 0 || maxPrice < 3000) && !openSections.price && (
                    <span className="filter-active-indicator">
                      {pricePreset !== 'all' && pricePreset !== 'custom' 
                        ? (pricePreset === 'under-500' ? '< R500' : pricePreset === '500-1000' ? 'R500-1k' : pricePreset === '1000-2000' ? 'R1k-2k' : '> R2k')
                        : `R${minPrice} - R${maxPrice}`}
                    </span>
                  )}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`filter-chevron ${openSections.price ? 'open' : ''}`} 
                />
              </button>

              {openSections.price && (
                <div className="filter-section-body">
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
              )}
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

          {filteredProducts.length === 0 ? (
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
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* Category */}
              <div className="filter-section">
                <button 
                  type="button" 
                  className="filter-section-header"
                  onClick={() => toggleSection('categories')}
                  aria-expanded={openSections.categories}
                >
                  <div className="filter-title-wrap">
                    <h4 className="filter-title">Categories</h4>
                    {selectedCategory !== 'All' && !openSections.categories && (
                      <span className="filter-active-indicator">{selectedCategory}</span>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`filter-chevron ${openSections.categories ? 'open' : ''}`} 
                  />
                </button>

                {openSections.categories && (
                  <div className="filter-section-body">
                    <div className="filter-category-list">
                      {dynamicCategories.map(cat => (
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
                )}
              </div>

              {/* Popular Tags */}
              {popularTags.length > 0 && (
                <div className="filter-section" style={{ marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="filter-section-header"
                    onClick={() => toggleSection('tags')}
                    aria-expanded={openSections.tags}
                  >
                    <div className="filter-title-wrap">
                      <h4 className="filter-title">Popular Tags</h4>
                      {selectedTag && !openSections.tags && (
                        <span className="filter-active-indicator">#{selectedTag}</span>
                      )}
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`filter-chevron ${openSections.tags ? 'open' : ''}`} 
                    />
                  </button>

                  {openSections.tags && (
                    <div className="filter-section-body">
                      <div className="filter-tags-list">
                        {popularTags.map(tag => {
                          const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                          return (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(isSelected ? '' : tag)}
                              className={`filter-tag-pill ${isSelected ? 'active' : ''}`}
                            >
                              <Tag size={10} /> {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="filter-section" style={{ marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="filter-section-header"
                  onClick={() => toggleSection('price')}
                  aria-expanded={openSections.price}
                >
                  <div className="filter-title-wrap">
                    <h4 className="filter-title">Filter by Price</h4>
                    {(pricePreset !== 'all' || minPrice > 0 || maxPrice < 3000) && !openSections.price && (
                      <span className="filter-active-indicator">
                        {pricePreset !== 'all' && pricePreset !== 'custom' 
                          ? (pricePreset === 'under-500' ? '< R500' : pricePreset === '500-1000' ? 'R500-1k' : pricePreset === '1000-2000' ? 'R1k-2k' : '> R2k')
                          : `R${minPrice} - R${maxPrice}`}
                      </span>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`filter-chevron ${openSections.price ? 'open' : ''}`} 
                  />
                </button>

                {openSections.price && (
                  <div className="filter-section-body">
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
                )}
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
    </>
  );
}
