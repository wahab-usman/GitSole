import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDS } from '../data/products';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.featured || p.status === 'available').slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      {/* Hero Section */}
      <section className="hero-section" style={{ borderBottom: '1px solid var(--color-line)' }}>
        {/* Copy Column */}
        <div className="hero-copy-box" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--color-line)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-oxblood)',
              border: '1px solid var(--color-oxblood)',
              padding: '5px 10px',
              borderRadius: '999px'
            }}>
              Quality over quantity
            </div>
            <h1 className="hero-title" style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--color-ink)'
            }}>
              Branded<br />thrift shoes,<br />honestly<br />priced.
            </h1>
            <p className="hero-subhead" style={{
              lineHeight: 1.6,
              color: 'var(--color-body)'
            }}>
              Every pair on Gitsole is hand-picked, inspected and graded before it is listed. One pair, one size, one price. When it's gone, it's gone.
            </p>
          </div>

          <div className="hero-cta-group" style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <Link to="/shop" className="btn btn-primary hero-btn">
              Shop this week's drop
            </Link>
            <Link to="/condition-guide" className="btn btn-outline hero-btn">
              How we grade condition
            </Link>
          </div>
        </div>

        {/* Hero Photo Column */}
        <div className="hero-photo-box" style={{
          position: 'relative',
          backgroundColor: 'var(--color-image-bg)',
          overflow: 'hidden'
        }}>
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85"
            alt="Gitsole hand-picked thrift sneaker"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </section>

      {/* 4-Up / 2x2 Value Strip (Spec #1) */}
      <section className="value-strip-grid" style={{
        borderBottom: '1px solid var(--color-line)',
        backgroundColor: 'var(--color-paper)'
      }}>
        <div className="value-strip-item" style={{ borderRight: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--color-ink)' }}>
            Free home delivery
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px' }}>
            All over Pakistan. No extra charge.
          </div>
        </div>
        <div className="value-strip-item" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--color-ink)' }}>
            Cash on delivery
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px' }}>
            Pay at your door upon delivery.
          </div>
        </div>
        <div className="value-strip-item" style={{ borderRight: '1px solid var(--color-line)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--color-ink)' }}>
            Graded condition
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px' }}>
            Score out of 10 & real flaw photos.
          </div>
        </div>
        <div className="value-strip-item">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--color-ink)' }}>
            One pair only
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px' }}>
            Single-piece stock. No restock.
          </div>
        </div>
      </section>

      {/* Featured Selection Section */}
      <section style={{ padding: 'clamp(24px, 4vw, 56px) clamp(16px, 3vw, 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
              Just landed
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-0.03em', color: 'var(--color-ink)', marginTop: '4px' }}>
              This week's selection
            </h2>
          </div>
          <Link to="/shop" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-oxblood)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {/* 2-Column Mobile / 4-Column Desktop Grid */}
        <div className="product-grid-responsive">
          {featuredProducts.map(product => (
            <ProductCard key={product.code} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Chips Section */}
      <section style={{
        padding: 'clamp(28px, 4vw, 48px) clamp(16px, 3vw, 40px)',
        borderBottom: '1px solid var(--color-line)'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '14px' }}>
          Shop by brand
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {BRANDS.map(brand => (
            <Link
              key={brand}
              to={`/shop?brand=${encodeURIComponent(brand)}`}
              style={{
                border: '1px solid var(--color-line-strong)',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-ink)',
                backgroundColor: 'transparent'
              }}
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        /* Mobile Layout Specs */
        .hero-section {
          display: flex;
          flex-direction: column;
        }
        .hero-copy-box {
          padding: 26px 18px 24px;
          border-right: none;
        }
        .hero-title {
          font-size: clamp(34px, 8vw, 42px);
          line-height: 0.95;
        }
        .hero-subhead {
          font-size: 14.5px;
          max-width: 100%;
        }
        .hero-cta-group {
          flex-direction: column;
        }
        .hero-btn {
          width: 100%;
          padding: 15px;
          font-size: 15px;
        }
        .hero-photo-box {
          height: 230px;
          width: 100%;
        }
        .value-strip-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .value-strip-item {
          padding: 16px 18px;
        }

        /* Desktop Breakpoint Overrides */
        @media (min-width: 768px) {
          .hero-section {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
            min-height: 520px;
          }
          .hero-copy-box {
            padding: clamp(32px, 4vw, 56px) clamp(24px, 3vw, 40px);
            border-right: 1px solid var(--color-line);
          }
          .hero-title {
            font-size: clamp(38px, 4.2vw, 60px);
          }
          .hero-subhead {
            font-size: 16px;
            max-width: 440px;
          }
          .hero-cta-group {
            flex-direction: row;
          }
          .hero-btn {
            width: auto;
            padding: 16px 28px;
          }
          .hero-photo-box {
            height: 100%;
            min-height: 520px;
          }
          .value-strip-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .value-strip-item {
            padding: 26px 28px;
            border-bottom: none !important;
          }
          .value-strip-item:not(:last-child) {
            border-right: 1px solid var(--color-line) !important;
          }
        }

        @media (min-width: 1280px) {
          .hero-copy-box {
            padding: 76px 56px 56px;
          }
          .hero-title {
            font-size: clamp(60px, 5.5vw, 84px);
          }
          .hero-subhead {
            font-size: 17px;
          }
        }
      `}</style>
    </div>
  );
}
