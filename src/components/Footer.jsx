import React from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_DISPLAY, buildWhatsAppUrl, INSTAGRAM_HANDLE, INSTAGRAM_URL, TIKTOK_HANDLE, TIKTOK_URL } from '../data/products';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-paper)', borderTop: '1px solid var(--color-line)' }}>
      {/* Dark Value Statement Band */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '56px 20px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', lineHeight: 1.05, letterSpacing: '-0.035em' }}>
              Quantity se zyada quality.
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-on-ink)', marginTop: '16px', maxWidth: '440px' }}>
              We would rather list forty pairs we genuinely believe in than four hundred we don't. Every pair is hand-checked for condition, cleanliness, wearability, and fair value.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
            <div style={{ borderTop: '1px solid var(--color-on-ink-line)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>Condition</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-ink)', marginTop: '4px' }}>Graded and photographed, flaws included.</div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-on-ink-line)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>Cleanliness</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-ink)', marginTop: '4px' }}>Sanitized and prepared before dispatch.</div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-on-ink-line)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>Wearability</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-ink)', marginTop: '4px' }}>Sole, upper, and comfort checked by hand.</div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-on-ink-line)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>Value</div>
              <div style={{ fontSize: '13px', color: 'var(--color-on-ink)', marginTop: '4px' }}>Priced against brand, model, and retail.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '52px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '36px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
            GITSOLE
          </div>
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--color-muted)', marginTop: '10px', maxWidth: '280px' }}>
            Curated branded thrift footwear. Free home delivery all over Pakistan. Cash on delivery.
          </p>
          <a
            href={buildWhatsAppUrl("Hello Gitsole team, I'd like to ask a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '18px', padding: '10px 18px', fontSize: '13.5px' }}
          >
            Order on WhatsApp
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--color-body)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '4px' }}>
            Shop
          </div>
          <Link to="/shop">All Shoes</Link>
          <Link to="/shop?sort=newest">This Week's Drop</Link>
          <Link to="/shop?maxPrice=8000">Under PKR 8,000</Link>
          <Link to="/shop?brand=Nike">Nike Collection</Link>
          <Link to="/shop?brand=Jordan">Jordan Retro</Link>
          <Link to="/shop?brand=Adidas">Adidas Samba & OG</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--color-body)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '4px' }}>
            Customer Care
          </div>
          <Link to="/condition-guide">Condition Grading Guide</Link>
          <Link to="/track">Track Your Order</Link>
          <Link to="/returns">Returns & Guarantee</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/contact">Delivery & COD Info</Link>
          <Link to="/about">About Gitsole</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--color-body)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '4px' }}>
            Connect
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram ({INSTAGRAM_HANDLE})</a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer">TikTok ({TIKTOK_HANDLE})</a>
          <a href={buildWhatsAppUrl("Hello")} target="_blank" rel="noopener noreferrer">WhatsApp ({WHATSAPP_DISPLAY})</a>
          <span style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px' }}>
            Support Hours: 10:00 AM – 10:00 PM (PKT)
          </span>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid var(--color-line)',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1280px',
        margin: '0 auto',
        fontSize: '12px',
        color: 'var(--color-faint)',
        fontFamily: 'var(--font-mono)'
      }}>
        <div>
          © {new Date().getFullYear()} GITSOLE PAKISTAN. SINGLE-PIECE THRIFT FOOTWEAR. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
