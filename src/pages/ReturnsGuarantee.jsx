import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../data/products';
import { ShieldCheck, RefreshCw, AlertCircle, MessageSquare, CheckCircle2, Truck, Clock } from 'lucide-react';

export default function ReturnsGuarantee() {
  const steps = [
    {
      step: "01",
      title: "Message us on WhatsApp within 48 hours",
      desc: `Send a message to ${WHATSAPP_DISPLAY} with your Order ID (e.g. GS-89102) and a quick photo/video highlighting why the shoe does not match the listing.`
    },
    {
      step: "02",
      title: "Courier Reverse Pickup / Drop-off",
      desc: "Our team will arrange a reverse pickup with Trax/TCS or share an easy drop-off slip. Pack the shoes back in the original Gitsole box."
    },
    {
      step: "03",
      title: "Instant 100% Refund",
      desc: "Once the return parcel reaches our inspection hub, your full refund is transferred via Easypaisa, JazzCash, or Bank Account within 24 hours."
    }
  ];

  const guarantees = [
    {
      title: "100% Description Accuracy",
      desc: "Every scuff, crease, and sole wear mark is photographed under studio lighting. If there is an unlisted defect, you are fully covered."
    },
    {
      title: "Sanitized & Hygiene Inspected",
      desc: "All thrift shoes undergo deep upper cleaning, sole sanitization, and antibacterial insole deodorization before dispatch."
    },
    {
      title: "No Insole Fit Surprises",
      desc: "We measure insole length in centimeters (cm) by hand so you know the exact interior fit before buying."
    },
    {
      title: "Zero Hidden Return Fees",
      desc: "If the item was not as described, return shipping is completely free of charge. We take full responsibility."
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 80px' }}>
      {/* Hero Header */}
      <div style={{ maxWidth: '780px', marginBottom: '48px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '10px' }}>
          Buyer Protection & Returns
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 56px)',
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: 'var(--color-ink)'
        }}>
          Not as described?<br />We take it back.
        </h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--color-body)', marginTop: '16px' }}>
          Buying pre-owned footwear online requires trust. At Gitsole, we eliminate the gamble: every shoe is condition-graded, flaw-photographed, and backed by our hassle-free 48-hour return guarantee.
        </p>
      </div>

      {/* Dark Guarantee Statement Banner */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '36px clamp(20px, 4vw, 44px)',
        marginBottom: '56px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-rose)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
          <ShieldCheck size={18} color="var(--color-rose)" />
          <span>The Gitsole Transparency Guarantee</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 32px)', lineHeight: 1.15 }}>
          "If the shoes you receive do not match the photos or condition score on our storefront, we issue a 100% full refund without argument."
        </h2>
      </div>

      {/* 4 Core Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '64px'
      }}>
        {guarantees.map((g, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--color-ink)' }}>
              {g.title}
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--color-body)' }}>
              {g.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 3-Step Return Process */}
      <div style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        padding: '40px clamp(20px, 4vw, 48px)',
        marginBottom: '64px'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '8px' }}>
          Step-by-Step
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--color-ink)', marginBottom: '32px' }}>
          How to initiate a return or exchange
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {steps.map(s => (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--color-oxblood)', paddingLeft: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-oxblood)' }}>
                Step {s.step}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--color-ink)' }}>
                {s.title}
              </div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--color-body)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Return Eligibility Rules & Guidelines */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        marginBottom: '64px',
        borderTop: '1px solid var(--color-line)',
        paddingTop: '48px'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)', marginBottom: '14px' }}>
            What is eligible for return:
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--color-body)' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} color="var(--color-oxblood)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Visible unphotographed defects or severe sole degradation.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} color="var(--color-oxblood)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Wrong item or incorrect size delivered.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} color="var(--color-oxblood)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Reported within 48 hours of courier delivery timestamp.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} color="var(--color-oxblood)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Returned in the same condition with Gitsole shoe box.</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)', marginBottom: '14px' }}>
            What is NOT eligible:
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--color-muted)' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--color-faint)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Flaws that were explicitly photographed and listed in the condition notes.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--color-faint)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Shoes that have been worn outdoors after receiving the parcel.</span>
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--color-faint)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Return requests submitted after the 48-hour window has lapsed.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Direct WhatsApp Action Card */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '36px clamp(20px, 4vw, 44px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px' }}>
          Need to request a return or size exchange?
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--color-on-ink)', maxWidth: '560px' }}>
          Message our support representative directly on WhatsApp with your Order ID and photos.
        </p>
        <a
          href={buildWhatsAppUrl("Hello Gitsole! I would like to inquire about a return / exchange for my order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-oxblood"
          style={{ marginTop: '6px', padding: '14px 28px', fontSize: '15px' }}
        >
          <MessageSquare size={18} />
          <span>Contact WhatsApp Returns Team ({WHATSAPP_DISPLAY})</span>
        </a>
      </div>
    </div>
  );
}
