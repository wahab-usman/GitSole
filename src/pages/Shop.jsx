import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import MobileFilterSheet from '../components/MobileFilterSheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const { registerSizeAlert } = useOrder();

  const isNewInMode = searchParams.get('filter') === 'newin' || searchParams.get('sort') === 'newest_drop';

  // State initialized from URL query params
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const b = searchParams.get('brand');
    return b ? [b] : [];
  });
  const [selectedSizes, setSelectedSizes] = useState(() => {
    const s = searchParams.get('size');
    return s ? [s] : [];
  });
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [priceRange, setPriceRange] = useState(() => {
    const p = searchParams.get('maxPrice');
    return p ? Number(p) : 100000;
  });
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get('sort') || 'newest';
  });

  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  // Sync state when URL searchParams change
  useEffect(() => {
    const b = searchParams.get('brand');
    setSelectedBrands(b ? [b] : []);
    const s = searchParams.get('size');
    setSelectedSizes(s ? [s] : []);
    const p = searchParams.get('maxPrice');
    setPriceRange(p ? Number(p) : 20000);
    const srt = searchParams.get('sort');
    if (srt) setSortBy(srt);
  }, [searchParams]);

  const toggleBrand = (b) => {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const toggleSize = (s) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleTier = (t) => {
    setSelectedTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedTiers([]);
    setPriceRange(100000);
    if (isNewInMode) {
      setSearchParams({ filter: 'newin' });
    } else {
      setSearchParams({});
    }
  };

  // Filtered & Sorted inventory
  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      // If New In mode, show featured or recently listed items
      if (isNewInMode && !item.featured && item.listedAt && !item.listedAt.includes('Just') && !item.listedAt.includes('1 day') && !item.listedAt.includes('2 days') && !item.listedAt.includes('3 days')) {
        return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) return false;
      if (selectedSizes.length > 0 && !selectedSizes.includes(item.sizeUK)) return false;
      if (selectedTiers.length > 0 && !selectedTiers.includes(item.tier)) return false;
      if (item.price > priceRange) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'condition') return b.score - a.score;
      return 0; // default newest
    });
  }, [products, isNewInMode, selectedBrands, selectedSizes, selectedTiers, priceRange, sortBy]);

  const activeFilterCount = selectedBrands.length + selectedSizes.length + selectedTiers.length + (priceRange < 100000 ? 1 : 0) + (isNewInMode ? 1 : 0);

  const handleSizeAlertSubmit = (e) => {
    e.preventDefault();
    if (alertPhone.trim()) {
      registerSizeAlert({
        phone: alertPhone,
        brand: selectedBrands.join(', ') || 'Any',
        size: selectedSizes.join(', ') || 'Any'
      });
      setAlertSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      {/* Shop Header Bar */}
      <div style={{
        padding: '24px clamp(16px, 3vw, 40px) 18px',
        borderBottom: '1px solid var(--color-line)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--color-paper)'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: isNewInMode ? 'var(--color-oxblood)' : 'var(--color-muted)' }}>
            {isNewInMode ? 'Home / This Week\'s Drop (New In)' : 'Home / Shop All'}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 44px)',
            letterSpacing: '-0.035em',
            color: 'var(--color-ink)',
            marginTop: '4px'
          }}>
            {isNewInMode ? "New In · This Week's Drop" : "All Footwear Collection"}{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 400, color: 'var(--color-faint)', letterSpacing: 0 }}>
              {filteredProducts.length} pairs
            </span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px', maxWidth: '580px' }}>
            {isNewInMode
              ? "Freshly graded & listed pairs from this week's drop. Hand-inspected, cleaned and ready to dispatch."
              : "Browse our complete catalog of single-piece graded thrift footwear across Nike, Adidas, Jordan, New Balance & more."
            }
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile Filter Sheet Trigger Button */}
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="mobile-filter-btn btn btn-outline"
            style={{ padding: '8px 14px', minHeight: '40px', fontSize: '13px', gap: '6px' }}
          >
            <SlidersHorizontal size={14} />
            <span>Filter {activeFilterCount > 0 ? `· ${activeFilterCount}` : ''}</span>
          </button>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              border: '1px solid var(--color-line-strong)',
              backgroundColor: 'transparent',
              padding: '8px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px !important',
              color: 'var(--color-ink)',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '40px'
            }}
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="condition">Condition Score</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div style={{
          padding: '10px clamp(16px, 3vw, 40px)',
          borderBottom: '1px solid var(--color-line)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--color-paper)'
        }}>
          {isNewInMode && (
            <Link
              to="/shop"
              title="Click to view all shoes"
              style={{
                backgroundColor: 'var(--color-oxblood)',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              <span>NEW IN DROP ONLY</span>
              <X size={11} />
            </Link>
          )}
          {selectedBrands.map(b => (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <span>{b}</span>
              <X size={11} />
            </button>
          ))}
          {selectedSizes.map(s => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <span>UK {s}</span>
              <X size={11} />
            </button>
          ))}
          {selectedTiers.map(t => (
            <button
              key={t}
              onClick={() => toggleTier(t)}
              style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <span>{t}</span>
              <X size={11} />
            </button>
          ))}
          {priceRange < 20000 && (
            <button
              onClick={() => setPriceRange(20000)}
              style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <span>&lt; {priceRange}</span>
              <X size={11} />
            </button>
          )}
          <button
            onClick={resetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-oxblood)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', flex: 1 }} className="shop-layout">
        {/* Desktop Sidebar Rail */}
        <div className="desktop-sidebar-container">
          <FilterSidebar
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            selectedTiers={selectedTiers}
            toggleTier={toggleTier}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            resetFilters={resetFilters}
            totalCount={filteredProducts.length}
          />
        </div>

        {/* Product Grid Area */}
        <div style={{ padding: '20px clamp(16px, 3vw, 40px) 64px' }}>
          {filteredProducts.length > 0 ? (
            <div className="shop-grid-responsive">
              {filteredProducts.map(product => (
                <ProductCard key={product.code} product={product} />
              ))}
            </div>
          ) : (
            /* Zero-State Filter Screen */
            <div style={{
              maxWidth: '480px',
              margin: '32px auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              padding: '0 16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                border: '1.5px solid var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '24px',
                color: 'var(--color-ink)'
              }}>
                0
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)' }}>
                Nothing in stock for this combination
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Enter your WhatsApp number to get an instant notification when matching shoes arrive.
              </p>

              {/* Size Alert Capture Box */}
              {!alertSubmitted ? (
                <form onSubmit={handleSizeAlertSubmit} style={{ width: '100%', display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid var(--color-line-strong)',
                      fontSize: '14px'
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px', fontSize: '13.5px' }}>
                    Alert Me
                  </button>
                </form>
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', fontFamily: 'var(--font-mono)', fontSize: '12px', width: '100%' }}>
                  ✓ Alert registered for {alertPhone}!
                </div>
              )}

              <button
                onClick={resetFilters}
                className="btn btn-outline"
                style={{ marginTop: '8px', padding: '10px 20px', fontSize: '13.5px' }}
              >
                Clear Filters & Browse All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <MobileFilterSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        selectedBrands={selectedBrands}
        toggleBrand={toggleBrand}
        selectedSizes={selectedSizes}
        toggleSize={toggleSize}
        selectedTiers={selectedTiers}
        toggleTier={toggleTier}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        resetFilters={resetFilters}
        totalCount={filteredProducts.length}
      />

      <style>{`
        @media (max-width: 900px) {
          .desktop-sidebar-container { display: none !important; }
          .shop-layout { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 901px) {
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
