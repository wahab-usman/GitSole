import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice, buildWhatsAppUrl, WHATSAPP_DISPLAY, getEuFromUk } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import ConditionBar from '../components/ConditionBar';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, Banknote, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

export default function ProductDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, isInCart } = useCart();
  const { registerSizeAlert } = useOrder();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const mobileGalleryRef = useRef(null);

  const product = products.find(p => p.code.toLowerCase() === (code || '').toLowerCase()) || products[0];
  const isSold = product.status === 'sold';
  const inCart = isInCart(product.code);

  const relatedProducts = products.filter(p => p.code !== product.code).slice(0, 4);

  const handleAddToCart = () => {
    if (!isSold) {
      addToCart(product);
      navigate('/cart');
    }
  };

  const handleMobileScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newIdx = Math.round(scrollLeft / width);
    setActivePhotoIdx(newIdx);
  };

  const scrollToPhoto = (idx) => {
    setActivePhotoIdx(idx);
    if (mobileGalleryRef.current) {
      mobileGalleryRef.current.scrollTo({
        left: idx * mobileGalleryRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleSizeAlertSubmit = (e) => {
    e.preventDefault();
    if (alertPhone.trim()) {
      registerSizeAlert({
        phone: alertPhone,
        productCode: product.code,
        brand: product.brand,
        size: product.sizeUK
      });
      setAlertSuccess(true);
    }
  };

  const whatsAppOrderText = `Hello Gitsole! I want to order: ${product.brand} ${product.model} (Code: ${product.code}, Size UK ${product.sizeUK}, Price: ${formatPrice(product.price)}). Is this pair available?`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)', paddingBottom: '90px' }}>
      {/* Breadcrumb Bar */}
      <div style={{
        padding: '12px clamp(16px, 3vw, 40px)',
        borderBottom: '1px solid var(--color-line)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10.5px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-muted)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?brand=${product.brand}`}>{product.brand}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-ink)' }}>{product.code}</span>
      </div>

      {/* Main PDP Grid Layout */}
      <div className="pdp-container" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 520px',
        alignItems: 'start',
        borderBottom: '1px solid var(--color-line)'
      }}>
        {/* Left Column: Mobile Swipeable / Desktop Multi-Photo Gallery */}
        <div style={{
          padding: 'clamp(16px, 3vw, 40px)',
          borderRight: '1px solid var(--color-line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Mobile Swipeable Carousel (Spec #4: 300px with dots) */}
          <div className="mobile-gallery-wrapper">
            <div
              ref={mobileGalleryRef}
              onScroll={handleMobileScroll}
              className="no-scrollbar"
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                height: '320px',
                width: '100%',
                backgroundColor: 'var(--color-image-bg)',
                position: 'relative'
              }}
            >
              {product.photos.map((photo, idx) => (
                <div
                  key={idx}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '100%',
                    scrollSnapAlign: 'start',
                    position: 'relative'
                  }}
                >
                  <img
                    src={photo}
                    alt={`${product.brand} angle ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isSold ? 'grayscale(90%)' : 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Carousel Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
              {product.photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPhoto(idx)}
                  style={{
                    width: activePhotoIdx === idx ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: activePhotoIdx === idx ? 'var(--color-ink)' : 'var(--color-line-strong)',
                    border: 'none',
                    padding: 0,
                    transition: 'all 0.25s ease'
                  }}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Main Photo (4:3 aspect) */}
          <div className="desktop-gallery-main" style={{
            position: 'relative',
            aspectRatio: '4 / 3',
            backgroundColor: 'var(--color-image-bg)',
            overflow: 'hidden'
          }}>
            <img
              src={product.photos[activePhotoIdx] || product.photos[0]}
              alt={`${product.brand} ${product.model}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isSold ? 'grayscale(90%)' : 'none'
              }}
            />
            {isSold && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(22, 19, 15, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  backgroundColor: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '24px',
                  padding: '12px 28px',
                  letterSpacing: '0.12em'
                }}>
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Desktop Photo Grid Thumbnails */}
          <div className="desktop-gallery-thumbs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {product.photos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                style={{
                  aspectRatio: '1 / 1',
                  backgroundColor: 'var(--color-image-bg)',
                  cursor: 'pointer',
                  border: activePhotoIdx === idx ? '2px solid var(--color-ink)' : '1px solid var(--color-line)',
                  overflow: 'hidden'
                }}
              >
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* Flaw Close-Up Disclosure Section (Spec #4: 16:7 with oxblood border) */}
          {product.flaws && product.flaws.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-oxblood)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} />
                <span>Flaw Close-Up & Condition Transparency</span>
              </div>
              <div className="flaw-photo-frame" style={{
                aspectRatio: '16 / 7',
                backgroundColor: 'var(--color-image-bg)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img
                  src={product.flaws[0].photo}
                  alt="Flaw inspection close up"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: 'var(--color-body)',
                marginTop: '8px',
                lineHeight: 1.5,
                backgroundColor: 'var(--color-card)',
                padding: '10px 12px',
                border: '1px solid var(--color-line)'
              }}>
                <strong>Inspection Note:</strong> {product.flaws[0].caption}
              </p>
            </div>
          )}
        </div>

        {/* Right Buy Column */}
        <div className="pdp-buy-col" style={{
          padding: 'clamp(20px, 3vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--color-paper)'
        }}>
          {/* Brand & Code */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 600 }}>
              {product.brand}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-muted)' }}>
              Item Code: {product.code}
            </span>
          </div>

          {/* Product Name */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(26px, 3.5vw, 42px)',
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: isSold ? 'var(--color-faint)' : 'var(--color-ink)'
          }}>
            {product.model}
          </h1>

          {/* Pricing & Discount */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(26px, 3vw, 32px)',
              color: isSold ? 'var(--color-faint)' : 'var(--color-ink)'
            }}>
              {formatPrice(product.price)}
            </div>
            {product.retailPrice && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--color-faint)',
                textDecoration: 'line-through'
              }}>
                Retail {formatPrice(product.retailPrice)}
              </div>
            )}
            {product.discountPercent && !isSold && (
              <div style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-oxblood)',
                color: 'var(--color-oxblood)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '999px'
              }}>
                {product.discountPercent}% below retail
              </div>
            )}
          </div>

          {/* Condition Grading Panel */}
          <ConditionBar
            score={product.score}
            tier={product.tier}
            notes={product.conditionNotes}
          />

          {/* Size Section (1 of 1 single pair) */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              <span style={{ color: 'var(--color-faint)' }}>Available Size (Single Piece)</span>
              <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Insole: {product.insoleCm} cm</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                padding: '10px 18px',
                backgroundColor: isSold ? 'var(--color-disabled)' : 'var(--color-ink)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>EU {product.sizeEU || getEuFromUk(product.sizeUK) || '44'} · UK {product.sizeUK} · US {product.sizeUS || ''}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>(1 of 1)</span>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-muted)', marginTop: '6px' }}>
              * Stock is strictly one pair. No other sizes available.
            </p>
          </div>

          {/* Desktop Buy Buttons */}
          {!isSold ? (
            <div className="desktop-buy-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleAddToCart}
                className="btn btn-oxblood"
                style={{ padding: '16px', fontSize: '15px', fontWeight: 600 }}
              >
                {inCart ? 'View in Cart (Reserved)' : 'Add to Cart — Reserve for 30 Min'}
              </button>

              <a
                href={buildWhatsAppUrl(whatsAppOrderText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '15px', fontSize: '14px' }}
              >
                <MessageSquare size={17} />
                Order on WhatsApp ({WHATSAPP_DISPLAY})
              </a>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--color-card)',
              border: '1.5px solid var(--color-ink)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--color-ink)' }}>
                This 1-of-1 pair is sold out.
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Enter your WhatsApp number to get notified when something close in UK {product.sizeUK} arrives:
              </p>

              {!alertSuccess ? (
                <form onSubmit={handleSizeAlertSubmit} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    required
                    style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
                    Alert Me
                  </button>
                </form>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--color-oxblood)', fontWeight: 600 }}>
                  ✓ Alert set for {alertPhone}!
                </div>
              )}
            </div>
          )}

          {/* Trust Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            borderTop: '1px solid var(--color-line)',
            borderBottom: '1px solid var(--color-line)',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <Truck size={16} color="var(--color-oxblood)" />
              <span>Free Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <Banknote size={16} color="var(--color-oxblood)" />
              <span>Cash on Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <ShieldCheck size={16} color="var(--color-oxblood)" />
              <span>100% Inspected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
              <RefreshCw size={16} color="var(--color-oxblood)" />
              <span>Hassle-free Returns</span>
            </div>
          </div>

          {/* Specs Table */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '8px' }}>
              Specifications
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '7px 0', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>Colourway</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 500 }}>{product.colourway}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '7px 0', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>Insole Length</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 500 }}>{product.insoleCm} cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={{ padding: '7px 0', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>Packaging</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 500 }}>{product.boxIncluded ? 'Original Box' : 'Gitsole Box'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related Shoes Section */}
      <section style={{ padding: '36px clamp(16px, 3vw, 40px)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '16px' }}>
          More curated pairs
        </h2>
        <div className="product-grid-responsive">
          {relatedProducts.map(p => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </section>

      {/* Mobile Fixed Bottom Bar (Spec #4: Add to Cart + 56x52 WhatsApp icon button) */}
      <div className="mobile-fixed-bottom-bar" style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-paper)',
        borderTop: '1px solid var(--color-line-strong)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 500,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        {!isSold ? (
          <>
            <button
              onClick={handleAddToCart}
              className="btn btn-oxblood"
              style={{ flex: 1, minHeight: '50px', padding: '12px', fontSize: '14.5px', fontWeight: 600 }}
            >
              {inCart ? 'View Cart' : `Add to cart · ${formatPrice(product.price)}`}
            </button>
            <a
              href={buildWhatsAppUrl(whatsAppOrderText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '56px', height: '50px', minHeight: '50px', padding: 0, flexShrink: 0 }}
              aria-label="Order on WhatsApp"
            >
              <MessageSquare size={22} />
            </a>
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-faint)', padding: '14px 0' }}>
            SOLD OUT · Single-piece stock
          </div>
        )}
      </div>

      <style>{`
        /* Mobile vs Desktop Display Rules */
        .mobile-gallery-wrapper { display: block; }
        .desktop-gallery-main { display: none; }
        .desktop-gallery-thumbs { display: none; }
        .desktop-buy-actions { display: none; }
        .mobile-fixed-bottom-bar { display: flex; }

        @media (min-width: 1024px) {
          .pdp-buy-col {
            position: sticky;
            top: 90px;
          }
          .mobile-gallery-wrapper { display: none !important; }
          .desktop-gallery-main { display: block !important; }
          .desktop-gallery-thumbs { display: grid !important; }
          .desktop-buy-actions { display: flex !important; }
          .mobile-fixed-bottom-bar { display: none !important; }
          div[style*="paddingBottom: '90px'"] { padding-bottom: 0 !important; }
        }

        @media (max-width: 1023px) {
          .pdp-container {
            grid-template-columns: 1fr !important;
          }
          .pdp-container > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--color-line);
          }
        }
      `}</style>
    </div>
  );
}
