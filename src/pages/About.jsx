import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../data/products';

export default function About() {
  const pillars = [
    { num: "01", title: "Hand-Picked Only", desc: "No automated bulk importing. Every sneaker is chosen individually based on aesthetic appeal and remaining lifespan." },
    { num: "02", title: "Transparent Flaws", desc: "We never hide wear. Every scuff, mark, and crease is photographed under high-intensity lighting and described." },
    { num: "03", title: "Sanitized & Cleaned", desc: "Before entering inventory, every shoe undergoes sanitization, insole deodorization, and thorough upper cleaning." },
    { num: "04", title: "Single-Piece Integrity", desc: "One pair, one size, one price. When a customer orders, that pair is reserved instantly and never oversold." },
    { num: "05", title: "Fair Value Pricing", desc: "Prices reflect true condition and retail comparisons, making high-end sneaker silhouettes accessible to all Pakistanis." },
    { num: "06", title: "Nationwide Free Delivery", desc: "Free home delivery to Karachi, Lahore, Islamabad, Quetta, Peshawar, and every town across Pakistan with COD." }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 20px 80px' }}>
      {/* Statement Headline */}
      <div style={{ maxWidth: '880px', marginBottom: '48px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '12px' }}>
          Our Story & Philosophy
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          lineHeight: 0.98,
          letterSpacing: '-0.04em',
          color: 'var(--color-ink)'
        }}>
          We don't sell everything.<br />We select what is worth buying.
        </h1>
        <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'var(--color-body)', marginTop: '20px', maxWidth: '620px' }}>
          Gitsole was born out of frustration with chaotic thrift markets and overpriced replicas in Pakistan. We set out to make thrift footwear feel elevated, honest, and reliable.
        </p>
      </div>

      {/* Wide Photo Band */}
      <div style={{
        aspectRatio: '21 / 9',
        minHeight: '300px',
        backgroundColor: 'var(--color-image-bg)',
        overflow: 'hidden',
        marginBottom: '64px'
      }}>
        <img
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=80"
          alt="Gitsole workshop and shoe collection"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Problem vs Solution 2-Up (Spec #11) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        marginBottom: '64px',
        borderTop: '1px solid var(--color-line)',
        borderBottom: '1px solid var(--color-line)',
        padding: '48px 0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)' }}>
            The Common Problem
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--color-ink)' }}>
            The Landabazaar Gamble
          </h2>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-body)' }}>
            Buying thrift shoes traditionally meant sifting through thousands of unwashed, beaten-down pairs, haggling without price transparency, or getting burned by fake sellers online with stock photos.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)' }}>
            The Gitsole Standard
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--color-ink)' }}>
            "Quantity se zyada quality."
          </h2>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-body)' }}>
            We would rather drop 40 pairs that we are genuinely proud of than 400 random shoes. Every pair on Gitsole has been verified for authenticity, deep-cleaned, photographed with zero filter tricks, and priced with complete honesty.
          </p>
        </div>
      </div>

      {/* Dark Values Grid (6 Pillars) */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '56px clamp(20px, 4vw, 56px)',
        marginBottom: '64px'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-rose)', marginBottom: '12px' }}>
          Our Six Commitments
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', marginBottom: '36px' }}>
          Built for sneaker lovers across Pakistan
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {pillars.map(p => (
            <div key={p.num} style={{ borderTop: '1px solid var(--color-on-ink-line)', paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-rose)', marginBottom: '4px' }}>
                {p.num}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#FFF' }}>
                {p.title}
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--color-on-ink)', marginTop: '8px' }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closing Statement & CTAs */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', color: 'var(--color-ink)', marginBottom: '14px' }}>
          Find your next pair today.
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
          Remember: every pair is 1-of-1. Once it's bought, it's gone for good.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '16px 32px' }}>
            Shop Available Pairs
          </Link>
          <a
            href={buildWhatsAppUrl("Hello Gitsole! I'd like to ask about upcoming drops.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ padding: '16px 32px' }}
          >
            Chat on WhatsApp ({WHATSAPP_DISPLAY})
          </a>
        </div>
      </div>
    </div>
  );
}
