import React from 'react';
import { Link } from 'react-router-dom';
import { TIERS } from '../data/products';
import { Shield, Eye, Sparkles, CheckSquare, RefreshCw } from 'lucide-react';

export default function ConditionGuide() {
  const tierExamples = [
    {
      ...TIERS[0],
      photo: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
      description: "Barely worn or tried on indoors once. Pristine upper with no scuffs or heel drag. Clean insoles and sharp sole tread.",
      typicalPrice: "45–60% of original retail"
    },
    {
      ...TIERS[1],
      photo: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
      description: "Light gentle wear with plenty of life left. Minor natural creasing, cleanly maintained uppers, 85%+ sole tread depth remaining.",
      typicalPrice: "30–45% of original retail"
    },
    {
      ...TIERS[2],
      photo: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80",
      description: "Clearly worn with genuine character but structurally rock solid. Good sole traction, slight surface marks, completely sanitized.",
      typicalPrice: "25–35% of original retail"
    },
    {
      ...TIERS[3],
      photo: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      description: "Honest wear at an unbeatable price point. Every visible flaw is photographed and listed transparently. Ideal for daily beaters.",
      typicalPrice: "15–25% of original retail"
    }
  ];

  const checkItems = [
    { title: "1. Upper Materials", desc: "Leather grain, suede nap, mesh integrity, stitch tightness, and scuff assessment." },
    { title: "2. Midsole & Cushioning", desc: "Foam compression, Air/Boost/GEL unit firmness, and flex durability." },
    { title: "3. Outsole & Tread Depth", desc: "Grip measurement, star/pivot pattern retention, and heel drag evaluation." },
    { title: "4. Inside & Hygiene", desc: "Deep cleaning, sanitized insole pads, lining intactness, and heel collar softness." },
    { title: "5. Structural Rigidity", desc: "Heel counter stability, shank support, eyelet strength, and torsion resistance." },
    { title: "6. Brand Authenticity", desc: "Production tags, style SKU verification, font accuracy, and genuine hardware." }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px 70px' }}>
      {/* Editorial Header */}
      <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '10px' }}>
          Transparency & Standards
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: 'var(--color-ink)'
        }}>
          How we grade condition.
        </h1>
        <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: 'var(--color-body)', marginTop: '14px' }}>
          At Gitsole, we treat condition grading as rigorous data, not vague marketing. Every shoe is individually inspected by hand, scored out of 10, assigned a tier, and photographed with every visible flaw highlighted.
        </p>
      </div>

      {/* 4 Tier Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        {tierExamples.map((tier, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ aspectRatio: '16 / 10', maxHeight: '190px', backgroundColor: 'var(--color-image-bg)', position: 'relative', overflow: 'hidden' }}>
              <img src={tier.photo} alt={tier.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 8px' }}>
                Score: {tier.range}
              </div>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', flex: 1 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)', marginBottom: '6px' }}>
                  {tier.name}
                </h3>
                <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--color-body)' }}>
                  {tier.description}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '10px', marginTop: 'auto' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-faint)' }}>Typical Price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-oxblood)' }}>{tier.typicalPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6 Inspection Checklist Points */}
      <div style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        padding: '40px clamp(20px, 4vw, 48px)',
        marginBottom: '64px'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--color-ink)', marginBottom: '8px' }}>
          What we check before listing any pair
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--color-muted)', marginBottom: '32px' }}>
          Every single pair passes through our 6-point physical verification workbench.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {checkItems.map((item, idx) => (
            <div key={idx} style={{ borderLeft: '2px solid var(--color-oxblood)', paddingLeft: '16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--color-ink)' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--color-body)', marginTop: '4px', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Returns & Guarantee Panel (Spec #10) */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '48px clamp(20px, 4vw, 56px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-rose)' }}>
          The Gitsole Promise
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', letterSpacing: '-0.02em', maxWidth: '680px', lineHeight: 1.1 }}>
          Not as described? We take it back without argument.
        </h2>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-on-ink)', maxWidth: '640px' }}>
          If the shoes you receive do not match the photos or condition grade stated on the listing, message us on WhatsApp within 48 hours of delivery and we will arrange a return and full refund.
        </p>
        <div>
          <Link to="/shop" className="btn btn-oxblood" style={{ padding: '14px 28px', marginTop: '8px' }}>
            Browse Graded Shoes Now
          </Link>
        </div>
      </div>
    </div>
  );
}
