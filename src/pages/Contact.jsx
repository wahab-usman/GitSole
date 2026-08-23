import React, { useState } from 'react';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../data/products';
import { MessageSquare, Mail, ChevronDown, ChevronUp, CheckCircle, Camera } from 'lucide-react';

export default function Contact() {
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', message: '' });

  const faqs = [
    {
      q: "How does Free Home Delivery across Pakistan work?",
      a: "Gitsole provides 100% free home delivery across Pakistan on every order with no minimum spend or hidden fees. We ship via premium express courier services (Trax / TCS) with delivery within 2–4 business days."
    },
    {
      q: "How does Cash on Delivery (COD) work?",
      a: "You do not need to pay anything online. When the courier rider arrives at your doorstep, you hand over the exact cash amount for your order. If you prefer paying in advance via Bank Transfer or Easypaisa/JazzCash, we offer an additional 3% instant discount."
    },
    {
      q: "Why is every shoe 1-of-1 with only one size?",
      a: "Because Gitsole deals in authentic, hand-picked thrift footwear, we stock single pairs sourced from global pre-owned lots. There are no restocks of the exact same pair. Once an item is ordered, it is marked sold."
    },
    {
      q: "How do I know the shoe will fit my foot?",
      a: "In addition to standard UK and US sizing, we measure the physical insole length in centimeters (cm) for every single listing. We recommend measuring the insole of your best-fitting current sneaker to guarantee a perfect fit."
    },
    {
      q: "What is your return policy if the shoe doesn't match description?",
      a: "We maintain 100% transparent condition grading. If your delivered shoes differ from the photographs, flaw close-ups, or condition score, contact our WhatsApp support within 48 hours and we will arrange a hassle-free return and full refund."
    },
    {
      q: "Can I order directly on WhatsApp instead of the website?",
      a: "Yes! WhatsApp is our primary parallel sales channel. You can click 'Order on WhatsApp' on any product page, and a pre-formatted message with the shoe's name, item code, size, and price will be sent to our team for quick manual confirmation."
    }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 20px 80px' }}>
      {/* Title Header */}
      <div style={{ maxWidth: '700px', marginBottom: '44px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '8px' }}>
          Customer Support
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 48px)',
          letterSpacing: '-0.035em',
          color: 'var(--color-ink)'
        }}>
          Contact & FAQ
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-body)', marginTop: '10px', lineHeight: 1.6 }}>
          Have a question about sizing, condition grading, or courier delivery? We are available 7 days a week.
        </p>
      </div>

      {/* 3 Contact Cards (Spec #12) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '56px' }}>
        {/* WhatsApp Card (Primary in Ink) */}
        <div style={{
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-paper)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-rose)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
              <MessageSquare size={16} />
              <span>Primary Channel · Instant Reply</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', marginTop: '10px' }}>
              WhatsApp Hotline
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--color-on-ink)', marginTop: '4px' }}>
              Fastest response for order status, extra pictures, or direct purchases.
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#FFF', fontWeight: 600, marginTop: '12px' }}>
              {WHATSAPP_DISPLAY}
            </div>
          </div>
          <a
            href={buildWhatsAppUrl("Hello Gitsole team, I have a quick question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-oxblood"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Instagram Card */}
        <div style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
              <Camera size={16} />
              <span>Drop Previews & Stories</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginTop: '10px' }}>
              @gitsole.pk
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
              Follow for weekly drop announcements and detailed video walk-arounds.
            </div>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            Visit Instagram
          </a>
        </div>

        {/* Email / Official Inquiry */}
        <div style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-faint)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
              <Mail size={16} />
              <span>Business & Partnerships</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginTop: '10px' }}>
              support@gitsole.pk
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
              General questions, supplier sourcing proposals, and business queries.
            </div>
          </div>
          <a
            href="mailto:support@gitsole.pk"
            className="btn btn-outline"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            Send an Email
          </a>
        </div>
      </div>

      {/* 2-Column: Inquiry Form & FAQ Accordion */}
      <div className="contact-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '48px' }}>
        {/* Message Form */}
        <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-line)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            Send us a message
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginBottom: '24px' }}>
            Fill in the details below and we will respond via WhatsApp or email.
          </p>

          {!formSent ? (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                  Your Message or Shoe Inquiry *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="What pair or sizing questions do you have?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>
                Submit Inquiry
              </button>
            </form>
          ) : (
            <div style={{ padding: '24px', backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', textAlign: 'center' }}>
              <CheckCircle size={32} color="var(--color-rose)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}>Message Received!</div>
              <p style={{ fontSize: '13.5px', color: 'var(--color-on-ink)', marginTop: '6px' }}>
                Our team will reach out to your WhatsApp at {formData.phone} shortly.
              </p>
            </div>
          )}
        </div>

        {/* FAQ Accordion (Spec #12) */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-line)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--color-ink)' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="var(--color-ink)" /> : <ChevronDown size={18} color="var(--color-muted)" />}
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: '0 20px 18px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-body)',
                      borderTop: '1px solid rgba(22, 19, 15, 0.08)',
                      paddingTop: '12px'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .contact-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
