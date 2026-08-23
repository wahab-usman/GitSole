import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { Search as SearchIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Search() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const suggestions = ["Nike UK 9", "Jordan", "Like new", "Adidas Samba", "Salomon", "Under 8000"];

  const results = products.filter(p => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.tier.toLowerCase().includes(q) ||
      `uk ${p.sizeUK}`.toLowerCase().includes(q) ||
      `size ${p.sizeUK}`.toLowerCase().includes(q) ||
      p.colourway.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>
      {/* Search Input Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1.5px solid var(--color-ink)',
          padding: '16px 20px',
          backgroundColor: '#FFFFFF'
        }}>
          <SearchIcon size={22} color="var(--color-ink)" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by brand, model, UK size, or item code..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '18px',
              color: 'var(--color-ink)'
            }}
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-faint)' }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-faint)', textTransform: 'uppercase' }}>
            Try searching:
          </span>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              style={{
                border: '1px solid var(--color-line-strong)',
                backgroundColor: 'transparent',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: 'var(--color-body)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results Headline */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--color-line)', paddingBottom: '12px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--color-ink)' }}>
          {query.trim() ? `Search results for "${query}"` : 'All Available Single-Piece Pairs'}
        </h1>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>
          {results.length} matches found
        </span>
      </div>

      {/* Horizontal Cards Result List (Spec #3) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map(product => {
          const inCart = isInCart(product.code);
          const isSold = product.status === 'sold';

          return (
            <div
              key={product.code}
              style={{
                display: 'flex',
                gap: '20px',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-line)',
                padding: '16px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* 120px Thumbnail */}
              <Link to={`/product/${product.code}`} style={{ display: 'block' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: 'var(--color-image-bg)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img
                    src={product.photos[0]}
                    alt={product.model}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isSold ? 'grayscale(90%)' : 'none'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    backgroundColor: 'var(--color-ink)',
                    color: 'var(--color-paper)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    padding: '2px 5px'
                  }}>
                    {product.score}
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 500 }}>
                  {product.brand} · Code {product.code}
                </div>
                <Link to={`/product/${product.code}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--color-ink)' }}>
                  {product.model}
                </Link>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>
                  UK {product.sizeUK} ({product.insoleCm} cm) · {product.tier} condition · 1 of 1
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)' }}>
                  {formatPrice(product.price)}
                </div>
                {product.retailPrice && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-faint)', textDecoration: 'line-through' }}>
                    Retail {formatPrice(product.retailPrice)}
                  </div>
                )}
                {!isSold ? (
                  <button
                    onClick={() => addToCart(product)}
                    className={inCart ? "btn btn-oxblood" : "btn btn-primary"}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-faint)', textTransform: 'uppercase', border: '1px solid var(--color-faint)', padding: '4px 8px' }}>
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
