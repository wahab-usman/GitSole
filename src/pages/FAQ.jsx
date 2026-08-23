import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../data/products';
import { ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIdx, setOpenIdx] = useState(0);

  const categories = ['All', 'Ordering & Delivery', 'Condition & Sizing', 'Payments & COD', 'Returns & Guarantee'];

  const allFaqs = [
    {
      category: "Ordering & Delivery",
      q: "How does Free Home Delivery across Pakistan work?",
      a: "Gitsole provides 100% free home delivery across Pakistan on every single order with zero hidden fees or minimum cart thresholds. We dispatch via premium express couriers (Trax / TCS Express). Deliveries to major cities like Karachi, Lahore, Islamabad, and Rawalpindi take 2–3 business days, while other cities and towns take 3–4 business days."
    },
    {
      category: "Ordering & Delivery",
      q: "Can I order directly on WhatsApp instead of the website?",
      a: "Yes! WhatsApp is our official parallel ordering channel. On any shoe listing or cart page, click 'Order on WhatsApp' or 'Send Cart to WhatsApp'. A pre-formatted message with the exact item code, UK size, condition score, and price will open in WhatsApp so our representative can instantly confirm your order."
    },
    {
      category: "Ordering & Delivery",
      q: "Why is every pair listed as single-piece (1 of 1)?",
      a: "Because Gitsole curates genuine pre-owned / thrift branded sneakers, each piece is individual and unique. We do not mass-produce or stock multiples of the same vintage or thrift pair. When a pair is ordered, it is permanently marked as SOLD."
    },
    {
      category: "Condition & Sizing",
      q: "How do you score and grade product condition?",
      a: "Every pair is inspected across 6 checkpoints (Upper, Midsole, Outsole, Inside/Insole, Structure, Authenticity) and given a score from 6.5 to 10 along with a tier (Like new, Excellent, Great, Good). In addition, every listing includes a dedicated close-up photo with an oxblood border showing any visible flaws so there are never surprises."
    },
    {
      category: "Condition & Sizing",
      q: "How do I ensure the shoe will fit my foot accurately?",
      a: "Along with standard UK and US sizes, we physically measure the interior insole length in centimeters (cm) for each shoe. We strongly suggest pulling out the insole of your best-fitting sneaker, measuring it with a tape or ruler, and comparing it to the listing's cm measurement."
    },
    {
      category: "Condition & Sizing",
      q: "Are the shoes cleaned and sanitized before shipping?",
      a: "Yes! Every single pair undergoes professional cleaning, sole scrubbing, sanitization, and antibacterial deodorization before entering our packaging boxes. They arrive ready to wear right out of the box."
    },
    {
      category: "Payments & COD",
      q: "How does Cash on Delivery (COD) work?",
      a: "With Cash on Delivery, you don't pay anything upfront online. When the courier rider arrives at your doorstep, you hand over the exact cash amount for your order. We recommend having exact change ready when the rider arrives."
    },
    {
      category: "Payments & COD",
      q: "How do I save 3% with Bank Transfer or Easypaisa?",
      a: "If you choose 'Bank Transfer / Easypaisa' during checkout, an instant 3% discount is automatically deducted from your total. After placing the order, you will receive our verified account details on WhatsApp to transfer payment."
    },
    {
      category: "Returns & Guarantee",
      q: "What is your return policy if the shoe does not match description?",
      a: "We offer a 48-hour return window from the time of courier delivery. If the received pair has unphotographed defects or condition discrepancies not mentioned in the listing, message us on WhatsApp with photos and we will arrange a reverse courier pickup and full refund."
    },
    {
      category: "Returns & Guarantee",
      q: "How long does a refund take to process?",
      a: "Once the return parcel is received and verified at our hub, refunds are sent within 24 hours via Easypaisa, JazzCash, or online bank transfer to your provided account."
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px' }}>
      {/* Header */}
      <div style={{ maxWidth: '750px', marginBottom: '40px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '8px' }}>
          Help Center
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 48px)',
          letterSpacing: '-0.035em',
          color: 'var(--color-ink)'
        }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-body)', marginTop: '10px', lineHeight: 1.6 }}>
          Everything you need to know about Gitsole's 1-of-1 thrift footwear, condition grading, cash on delivery, and nationwide free shipping.
        </p>

        {/* Instant Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1.5px solid var(--color-ink)',
          padding: '12px 16px',
          backgroundColor: '#FFF',
          marginTop: '24px'
        }}>
          <Search size={18} color="var(--color-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. delivery time, returns, COD, sizing)..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '15px !important'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-faint)' }}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--color-line)', paddingBottom: '16px' }}>
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                border: isActive ? '1px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                backgroundColor: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Accordion FAQ List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '64px' }}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-line)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-oxblood)', letterSpacing: '0.1em' }}>
                      {faq.category}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--color-ink)' }}>
                      {faq.q}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={20} color="var(--color-ink)" style={{ flexShrink: 0 }} /> : <ChevronDown size={20} color="var(--color-muted)" style={{ flexShrink: 0 }} />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 20px 20px',
                    fontSize: '14.5px',
                    lineHeight: 1.65,
                    color: 'var(--color-body)',
                    borderTop: '1px solid rgba(22, 19, 15, 0.08)',
                    paddingTop: '14px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-line)' }}>
            <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>
              No questions found matching "{searchQuery}".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="btn btn-outline"
              style={{ marginTop: '14px', padding: '10px 20px', fontSize: '13px' }}
            >
              Reset Search & Show All FAQs
            </button>
          </div>
        )}
      </div>

      {/* Still have questions WhatsApp Callout */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '36px clamp(20px, 4vw, 44px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>
            Still have a question?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-on-ink)', marginTop: '4px' }}>
            Our team responds directly on WhatsApp within 15–30 minutes.
          </p>
        </div>

        <a
          href={buildWhatsAppUrl("Hello Gitsole team, I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-oxblood"
          style={{ padding: '12px 24px', fontSize: '14.5px' }}
        >
          <MessageSquare size={17} />
          <span>Ask on WhatsApp ({WHATSAPP_DISPLAY})</span>
        </a>
      </div>
    </div>
  );
}
