import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { formatPrice, buildWhatsAppUrl } from '../data/products';
import { CheckCircle2, MessageSquare, Package, Truck, ArrowRight } from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { getOrderById } = useOrder();

  const order = getOrderById(id) || {
    id: id || "GS-89102",
    date: new Date().toISOString(),
    customer: {
      name: "Valued Customer",
      whatsapp: "0300 1234567",
      address: "Phase 5, DHA, near Lalik Jan Chowk",
      city: "Lahore"
    },
    paymentMethod: "cod",
    items: [],
    total: 8900,
    trackingNumber: "TRX-994821-PK"
  };

  const isCOD = order.paymentMethod === 'cod';
  const whatsAppConfirmationText = isCOD
    ? `Hello Gitsole! I placed order ${order.id}. My name is ${order.customer?.name}. Please send me the payment details for the PKR 300 advance so I can confirm my order!`
    : `Hello Gitsole! I placed order ${order.id}. My name is ${order.customer?.name}. Please send me the payment details so I can transfer the full amount!`;

  return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--color-paper)' }}>
      {/* Full-width Ink Header Band (Spec #8) */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '56px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            letterSpacing: '0.14em',
            color: 'var(--color-rose)',
            textTransform: 'uppercase'
          }}>
            <CheckCircle2 size={18} color="var(--color-rose)" />
            <span>Order #{order.id} Confirmed</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 48px)',
            letterSpacing: '-0.035em',
            lineHeight: 1.05
          }}>
            {isCOD ? 'Order placed! Send PKR 300 advance to confirm.' : 'Order placed! Send payment to confirm.'}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-on-ink)', maxWidth: '580px', lineHeight: 1.6 }}>
            {isCOD
              ? <>Your 1-of-1 shoes are reserved. A WhatsApp chat has been opened with your order details. Please send the <strong>PKR 300 advance</strong> via JazzCash/EasyPaisa/Bank Transfer to confirm dispatch.</>
              : <>Your 1-of-1 shoes are reserved. A WhatsApp chat has been opened with your order details. Please complete the full payment to confirm dispatch.</>
            }
          </p>

          <a
            href={buildWhatsAppUrl(whatsAppConfirmationText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-oxblood"
            style={{ marginTop: '12px', padding: '14px 28px', fontSize: '14.5px' }}
          >
            <MessageSquare size={17} />
            <span>{isCOD ? 'Send PKR 300 Advance via WhatsApp' : 'Complete Payment via WhatsApp'}</span>
          </a>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '56px 20px 80px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '44px' }} className="confirmation-grid">
        {/* Step-by-Step What Happens Next (Spec #8) */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '24px' }}>
            What happens next:
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--color-oxblood)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)' }}>{isCOD ? 'Pay PKR 300 Advance & Verify' : 'Complete Payment & Verify'}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                  {isCOD
                    ? 'Send PKR 300 advance via JazzCash/EasyPaisa/Bank Transfer. We verify your address and confirm the order on WhatsApp.'
                    : 'Transfer the full amount. We verify your payment and confirm the order on WhatsApp.'
                  }
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--color-ink)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)' }}>Sanitized & Inspected (Day 1)</div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                  Your pair is final-checked against condition scores, sanitized, and packed in secure Gitsole packaging.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--color-ink)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)' }}>Courier Handover & Tracking (Day 1–2)</div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                  Handed over to Trax / TCS. You receive an SMS and tracking code to trace your parcel.
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--color-ink)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0
              }}>
                4
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-ink)' }}>{isCOD ? 'Doorstep Delivery & Remaining Payment (Day 2–4)' : 'Doorstep Delivery (Day 2–4)'}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                  {isCOD
                    ? <>Rider delivers to your door. Keep exact cash of <strong>{formatPrice(order.total - 300)}</strong> ready (PKR 300 already paid as advance).</>
                    : <>Rider delivers to your door. No payment needed — you've already paid in full!</>
                  }
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to={`/track?id=${order.id}`} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '14px' }}>
              Track this Order Online
            </Link>
            <Link to="/shop" className="btn btn-outline" style={{ padding: '12px 20px', fontSize: '14px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Summary Box */}
        <div style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          padding: '24px',
          height: 'fit-content'
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '12px' }}>
            Order Summary
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', borderBottom: '1px solid var(--color-line)', paddingBottom: '14px' }}>
            <div><strong>Customer:</strong> {order.customer?.name}</div>
            <div><strong>WhatsApp:</strong> {order.customer?.whatsapp}</div>
            <div><strong>Address:</strong> {order.customer?.address}, {order.customer?.city}</div>
            <div><strong>Payment:</strong> {isCOD ? 'Cash on Delivery (COD)' : 'Bank Transfer / Easypaisa (3% Saved)'}</div>
            <div><strong>Tracking Code:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)' }}>{order.trackingNumber}</span></div>
          </div>

          {isCOD && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-line)', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-oxblood)', fontWeight: 600 }}>Advance (JazzCash/EasyPaisa/Bank)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)', fontWeight: 600 }}>PKR 300</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Due at Doorstep (COD)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(order.total - 300)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', paddingTop: isCOD ? '0' : '14px', borderTop: isCOD ? 'none' : '1px solid var(--color-line)' }}>
            <span style={{ fontWeight: 600 }}>Total Amount</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .confirmation-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
