import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, buildWhatsAppUrl } from '../data/products';
import { Trash2, MessageSquare, ArrowRight, ShieldAlert, Clock } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, clearCart, subtotal, formatTimer } = useCart();
  const navigate = useNavigate();

  const whatsAppCartText = `Hello Gitsole! I would like to checkout my cart:\n\n${cart.map(item => `• ${item.brand} ${item.model} (UK ${item.sizeUK}, Code: ${item.code}) — ${formatPrice(item.price)}`).join('\n')}\n\nTotal: ${formatPrice(subtotal)}\nDelivery: Free Home Delivery (Pakistan)\nPayment: Cash on Delivery (COD)\n\nPlease confirm availability!`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>
      {/* Title & Reservation Banner */}
      <div style={{ borderBottom: '1px solid var(--color-line)', paddingBottom: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-0.035em', color: 'var(--color-ink)' }}>
            Your Cart ({cart.length} {cart.length === 1 ? 'pair' : 'pairs'})
          </h1>
          {cart.length > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-oxblood)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-oxblood)',
              fontWeight: 500
            }}>
              <Clock size={15} />
              <span>Reserved for: <strong>{formatTimer()}</strong></span>
            </div>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px' }}>
          Single-piece stock policy: Each pair is 1-of-1. Your selection is held for 30 minutes during active browsing.
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          {/* Cart Item Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map(item => (
              <div
                key={item.code}
                style={{
                  display: 'flex',
                  gap: '20px',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-line)',
                  padding: '20px',
                  position: 'relative',
                  flexWrap: 'wrap'
                }}
              >
                {/* 150px Thumbnail */}
                <div style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: 'var(--color-image-bg)',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  <img
                    src={item.photos[0]}
                    alt={item.model}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    backgroundColor: 'var(--color-ink)',
                    color: 'var(--color-paper)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    padding: '2px 6px'
                  }}>
                    {item.score} · {item.tier}
                  </div>
                </div>

                {/* Item Details */}
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 600 }}>
                    {item.brand} · Code {item.code}
                  </div>
                  <Link to={`/product/${item.code}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--color-ink)' }}>
                    {item.model}
                  </Link>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>
                    Size: UK {item.sizeUK} ({item.insoleCm} cm) · Condition {item.score}/10
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-faint)',
                    marginTop: 'auto',
                    backgroundColor: 'rgba(22, 19, 15, 0.04)',
                    padding: '4px 8px',
                    width: 'fit-content'
                  }}>
                    <ShieldAlert size={13} />
                    <span>Single pair — cannot increase quantity</span>
                  </div>
                </div>

                {/* Price & Remove Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: '100px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)' }}>
                    {formatPrice(item.price)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.code)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-faint)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-oxblood)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-faint)'}
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: 'var(--color-muted)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Clear entire cart
            </button>
          </div>

          {/* Ink Summary Panel (Spec #6) */}
          <div style={{
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-paper)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>
              Order Summary
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: '1px solid var(--color-on-ink-line)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-on-ink)' }}>Subtotal ({cart.length} items)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-on-ink)' }}>Delivery (Nationwide)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-rose)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-on-ink)' }}>Cash on Delivery fee</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-rose)' }}>None</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px' }}>{formatPrice(subtotal)}</span>
            </div>

            {/* Checkout & WhatsApp Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-oxblood"
                style={{ padding: '16px', fontSize: '15px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} />
              </button>

              <a
                href={buildWhatsAppUrl(whatsAppCartText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-ink"
                style={{ padding: '14px', fontSize: '14px' }}
              >
                <MessageSquare size={16} />
                <span>Send this Cart to WhatsApp</span>
              </a>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-on-ink)', textAlign: 'center', lineHeight: 1.4 }}>
              * Cash on Delivery available across all cities in Pakistan. Pay rider when parcel arrives.
            </p>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--color-ink)', marginBottom: '12px' }}>
            Your cart is empty
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Looking for something specific? Check this week's drop of hand-picked curated thrift pairs.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '16px 32px' }}>
            Browse Available Shoes
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
