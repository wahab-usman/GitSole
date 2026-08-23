import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const inCart = isInCart(product.code);
  const isSold = product.status === 'sold';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSold && !inCart) {
      addToCart(product);
    }
  };

  const primaryPhoto = product.photos && product.photos[0] ? product.photos[0] : '';
  const secondaryPhoto = product.photos && product.photos[1] ? product.photos[1] : primaryPhoto;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-card)',
        border: `1px solid ${isHovered ? 'rgba(22, 19, 15, 0.4)' : 'rgba(22, 19, 15, 0.12)'}`,
        position: 'relative',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
        transform: isHovered && !isSold ? 'translateY(-3px)' : 'none',
        height: '100%',
        color: 'inherit',
        userSelect: 'none'
      }}
    >
      <Link to={`/product/${product.code}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit' }}>
        {/* Photo Container */}
        <div style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          backgroundColor: 'var(--color-image-bg)',
          overflow: 'hidden'
        }}>
          {/* Primary Photo */}
          <img
            src={primaryPhoto}
            alt={`${product.brand} ${product.model}`}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isSold ? 'grayscale(90%) contrast(90%) opacity(0.7)' : 'none',
              transition: 'transform 0.4s ease'
            }}
          />

          {/* Secondary Hover Photo & Quick Add Button (Desktop only) */}
          {!isSold && (
            <div className="desktop-card-hover" style={{
              position: 'absolute',
              inset: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.35s ease',
              pointerEvents: isHovered ? 'auto' : 'none'
            }}>
              <img
                src={secondaryPhoto}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <button
                onClick={handleQuickAdd}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: inCart ? 'var(--color-oxblood)' : 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  padding: '13px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {inCart ? 'In Your Cart' : 'Add to cart'}
              </button>
            </div>
          )}

          {/* Condition Chip */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-paper)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 6px',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            <span className="mobile-score-only">{product.score}</span>
            <span className="desktop-score-tier">{product.score} · {product.tier}</span>
          </div>

          {/* Sold Plate */}
          {isSold && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(22, 19, 15, 0.45)',
              zIndex: 3
            }}>
              <span style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '0.08em',
                padding: '6px 14px'
              }}>
                SOLD
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-oxblood)',
            fontWeight: 500,
            marginBottom: '2px'
          }}>
            {product.brand}
          </div>
          <div className="product-card-title" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            lineHeight: 1.25,
            color: isSold ? 'var(--color-faint)' : 'var(--color-ink)'
          }}>
            {product.model}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            color: 'var(--color-muted)',
            marginTop: '3px'
          }}>
            UK {product.sizeUK} <span className="hide-on-mobile">· 1 of 1 · {product.listedAt}</span>
          </div>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', paddingTop: '6px' }}>
            <div className="product-card-price" style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: isSold ? 'var(--color-faint)' : 'var(--color-ink)'
            }}>
              {formatPrice(product.price)}
            </div>
            {product.retailPrice && (
              <div className="hide-on-mobile" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-faint)',
                textDecoration: 'line-through'
              }}>
                {formatPrice(product.retailPrice)}
              </div>
            )}
          </div>
        </div>
      </Link>

      <style>{`
        .product-card-container {
          padding: 10px;
        }
        .product-card-body {
          padding-top: 8px;
        }
        .product-card-title {
          font-size: 13.5px;
        }
        .product-card-price {
          font-size: 15px;
        }
        .mobile-score-only { display: inline; }
        .desktop-score-tier { display: none; }
        .hide-on-mobile { display: none; }

        @media (min-width: 768px) {
          .product-card-container {
            padding: 14px;
          }
          .product-card-body {
            padding-top: 12px;
          }
          .product-card-title {
            font-size: 16px;
          }
          .product-card-price {
            font-size: 18px;
          }
          .mobile-score-only { display: none; }
          .desktop-score-tier { display: inline; }
          .hide-on-mobile { display: inline; }
        }
      `}</style>
    </div>
  );
}
