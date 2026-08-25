import React from 'react';
import { BRANDS, SIZES_UK, TIERS, formatPrice } from '../data/products';

export default function FilterSidebar({
  selectedBrands,
  toggleBrand,
  selectedSizes,
  toggleSize,
  selectedTiers,
  toggleTier,
  priceRange,
  setPriceRange,
  resetFilters,
  totalCount
}) {
  return (
    <aside style={{
      width: '270px',
      borderRight: '1px solid var(--color-line)',
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      backgroundColor: 'transparent'
    }}>
      {/* Brand Section */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
          marginBottom: '12px'
        }}>
          Brand
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          {BRANDS.slice(0, 7).map(b => {
            const isChecked = selectedBrands.includes(b);
            return (
              <label
                key={b}
                onClick={() => toggleBrand(b)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: isChecked ? 'var(--color-ink)' : 'var(--color-body)'
                }}
              >
                <div style={{
                  width: '15px',
                  height: '15px',
                  border: isChecked ? '1px solid var(--color-ink)' : '1px solid rgba(22, 19, 15, 0.35)',
                  backgroundColor: isChecked ? 'var(--color-ink)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}>
                  {isChecked && <span style={{ color: 'var(--color-paper)', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                </div>
                <span>{b}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Size (UK) Section */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
          marginBottom: '12px'
        }}>
          Size (UK)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {SIZES_UK.map(s => {
            const isSelected = selectedSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                style={{
                  border: isSelected ? '1px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                  backgroundColor: isSelected ? 'var(--color-ink)' : 'transparent',
                  color: isSelected ? 'var(--color-paper)' : 'var(--color-ink)',
                  padding: '8px 0',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Tier Section */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
          marginBottom: '12px'
        }}>
          Condition Tier
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13.5px' }}>
          {TIERS.map(t => {
            const isChecked = selectedTiers.includes(t.name);
            return (
              <label
                key={t.name}
                onClick={() => toggleTier(t.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '15px',
                  height: '15px',
                  border: isChecked ? '1px solid var(--color-ink)' : '1px solid rgba(22, 19, 15, 0.35)',
                  backgroundColor: isChecked ? 'var(--color-ink)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isChecked && <span style={{ color: 'var(--color-paper)', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                </div>
                <span>{t.name} <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>({t.range})</span></span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-faint)',
          marginBottom: '12px'
        }}>
          <span>Max Price</span>
          <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{formatPrice(priceRange)}</span>
        </div>
        <input
          type="range"
          min="3000"
          max="100000"
          step="1000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--color-oxblood)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>
          <span>PKR 3,000</span>
          <span>PKR 100,000</span>
        </div>
      </div>

      {/* Reset Filter Button */}
      {(selectedBrands.length > 0 || selectedSizes.length > 0 || selectedTiers.length > 0 || priceRange < 20000) && (
        <button
          onClick={resetFilters}
          style={{
            background: 'none',
            border: '1px dashed var(--color-oxblood)',
            color: 'var(--color-oxblood)',
            padding: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
