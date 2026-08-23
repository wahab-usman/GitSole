import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { WHATSAPP_DISPLAY, buildWhatsAppUrl } from '../data/products';

export default function Header() {
  const { cart, badgeAnimated } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const marqueeText = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '36px', paddingRight: '36px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--color-paper)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      <span>Free home delivery · all over pakistan</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span>Cash on delivery</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span>Every pair inspected by hand</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span>One pair, one size, one price</span>
      <span style={{ opacity: 0.35 }}>/</span>
      <span>Not as described? We take it back</span>
      <span style={{ opacity: 0.35 }}>/</span>
    </div>
  );

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Banner */}
      <div style={{ width: '100%', backgroundColor: 'var(--color-ink)', overflow: 'hidden' }}>
        <div className="mobile-only-topbar" style={{ padding: '7px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.14em', color: 'var(--color-paper)', textTransform: 'uppercase' }}>
          Free home delivery · all over pakistan
        </div>
        <div className="desktop-only-marquee" style={{ padding: '8px 0', overflow: 'hidden' }}>
          <div className="animate-marquee">
            {marqueeText}
            {marqueeText}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-line)',
        padding: '12px clamp(16px, 3vw, 40px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Left Side: Mobile Menu Button & Desktop Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink)',
              padding: '6px',
              minWidth: '40px',
              minHeight: '40px'
            }}
            className="mobile-only-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Logo */}
          <Link to="/" className="desktop-logo" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '26px',
            letterSpacing: '-0.035em',
            color: 'var(--color-ink)',
            textDecoration: 'none'
          }}>
            GITSOLE
          </Link>
        </div>

        {/* Mobile Centered Logo */}
        <Link to="/" className="mobile-centered-logo" style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '21px',
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
          textDecoration: 'none',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          GITSOLE
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 1.8vw, 28px)' }} className="desktop-nav-links">
          <Link to="/shop" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>Shop All</Link>
          <Link to="/shop?filter=newin" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>New In</Link>
          <Link to="/condition-guide" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>Condition Guide</Link>
          <Link to="/about" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>About</Link>
          <Link to="/track" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>Track Order</Link>
          <Link to="/contact" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>Contact</Link>
        </nav>

        {/* Right Side: Search & Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Desktop Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="desktop-search-form" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              border: '1px solid rgba(22, 19, 15, 0.22)',
              borderRadius: '999px',
              backgroundColor: 'transparent',
              width: 'clamp(140px, 14vw, 220px)'
            }}>
              <Search size={14} color="var(--color-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand or size..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-ink)',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </form>

          {/* Mobile Search Icon Link */}
          <Link
            to="/search"
            className="mobile-search-icon"
            style={{
              color: 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px'
            }}
            aria-label="Search"
          >
            <Search size={20} />
          </Link>

          {/* Cart Icon & Counter Badge */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink)',
              minWidth: '40px',
              minHeight: '40px'
            }}
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={21} strokeWidth={1.8} />
            {cart.length > 0 && (
              <span
                className={badgeAnimated ? 'badge-pop' : ''}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-oxblood)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  lineHeight: 1
                }}
              >
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--color-paper)',
          borderBottom: '1.5px solid var(--color-ink)',
          padding: '20px 18px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }} className="mobile-nav-drawer">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Nike, UK 9, Sambas..."
              style={{
                flex: 1,
                padding: '12px 14px',
                border: '1px solid var(--color-line-strong)',
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                backgroundColor: '#FFF'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px' }}>
              Search
            </button>
          </form>

          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>Shop All Shoes</Link>
          <Link to="/shop?filter=newin" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>This Week's Drop (New In)</Link>
          <Link to="/condition-guide" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>Condition Grading Guide</Link>
          <Link to="/returns" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>Returns & Guarantee</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>FAQs</Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>Track Your Order</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>About Gitsole</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-line)', paddingBottom: '10px' }}>Contact</Link>

          <div style={{ marginTop: '8px' }}>
            <a
              href={buildWhatsAppUrl("Hello Gitsole team, I would like to inquire about available shoes.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Order on WhatsApp ({WHATSAPP_DISPLAY})
            </a>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav-links a {
          white-space: nowrap;
        }

        @media (max-width: 1080px) {
          .desktop-logo { display: none !important; }
          .desktop-nav-links { display: none !important; }
          .desktop-search-form { display: none !important; }
          .desktop-only-marquee { display: none !important; }
          .mobile-only-topbar { display: block !important; }
          .mobile-only-btn { display: flex !important; }
          .mobile-centered-logo { display: block !important; }
          .mobile-search-icon { display: flex !important; }
        }
        @media (min-width: 1081px) {
          .mobile-only-topbar { display: none !important; }
          .mobile-only-btn { display: none !important; }
          .mobile-centered-logo { display: none !important; }
          .mobile-search-icon { display: none !important; }
          .mobile-nav-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
}
