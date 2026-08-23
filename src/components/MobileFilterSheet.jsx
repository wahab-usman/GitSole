import React from 'react';
import { BRANDS, SIZES_UK, TIERS, formatPrice } from '../data/products';
import { X } from 'lucide-react';

export default function MobileFilterSheet({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(22, 19, 15, 0.45)',
      animation: 'fadeInBackdrop 450ms ease forwards'
    }}>
      {/* Backdrop Click Dismiss */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Sheet Content Container */}
      <div style={{
        backgroundColor: 'var(--color-paper)',
        borderRadius: '22px 22px 0 0',
        padding: '24px 20px 36px',
        maxHeight: '85vh',
        overflowY: 'auto',
        animation: 'slideUpSheet 600ms cubic-bezier(0.22, 1.15, 0.36, 1) forwards',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--color-line)', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)' }}>
              Filter Inventory
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-faint)' }}>
              {totalCount} pairs matching
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="var(--color-ink)" />
          </button>
        </div>

        {/* Brands */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '10px' }}>
            Brands
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {BRANDS.map(b => {
              const isChecked = selectedBrands.includes(b);
              return (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  style={{
                    padding: '8px 14px',
                    border: isChecked ? '1px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                    backgroundColor: isChecked ? 'var(--color-ink)' : 'transparent',
                    color: isChecked ? 'var(--color-paper)' : 'var(--color-ink)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* UK Sizes */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '10px' }}>
            Size (UK)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {SIZES_UK.map(s => {
              const isChecked = selectedSizes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    border: isChecked ? '1px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                    backgroundColor: isChecked ? 'var(--color-ink)' : 'transparent',
                    color: isChecked ? 'var(--color-paper)' : 'var(--color-ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Tiers */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '10px' }}>
            Condition Tier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TIERS.map(t => {
              const isChecked = selectedTiers.includes(t.name);
              return (
                <label
                  key={t.name}
                  onClick={() => toggleTier(t.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: isChecked ? '1px solid var(--color-ink)' : '1px solid rgba(22, 19, 15, 0.35)',
                    backgroundColor: isChecked ? 'var(--color-ink)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isChecked && <span style={{ color: 'var(--color-paper)', fontSize: '11px' }}>✓</span>}
                  </div>
                  <span>{t.name} ({t.range})</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Max Price */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '8px' }}>
            <span>Max Price</span>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{formatPrice(priceRange)}</span>
          </div>
          <input
            type="range"
            min="3000"
            max="20000"
            step="500"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-oxblood)' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={resetFilters}
            className="btn btn-outline"
            style={{ flex: 1, padding: '14px' }}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: 2, padding: '14px' }}
          >
            Show {totalCount} Pairs
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { background-color: rgba(22, 19, 15, 0); }
          to { background-color: rgba(22, 19, 15, 0.45); }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
