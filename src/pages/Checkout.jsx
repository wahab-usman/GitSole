import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { formatPrice, buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../data/products';
import { ShieldCheck, MessageSquare, Lock, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    landmark: '',
    city: 'Lahore',
    province: 'Punjab',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'bank_transfer'
  const [conditionAcknowledged, setConditionAcknowledged] = useState(false);
  const [advanceAcknowledged, setAdvanceAcknowledged] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px' }}>Your cart is empty</h2>
        <p style={{ marginTop: '10px', color: 'var(--color-muted)' }}>Please add a pair of shoes to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Shop Available Pairs</Link>
      </div>
    );
  }

  const finalTotal = paymentMethod === 'bank_transfer' ? Math.round(subtotal * 0.97) : subtotal;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate Pakistani mobile number: 03XX XXXXXXX
    const cleanPhone = formData.whatsapp.replace(/[\s-]/g, '');
    const pakPhoneRegex = /^03[0-9]{9}$/;
    if (!pakPhoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 11-digit Pakistani mobile number (e.g. 0300 1234567).');
      return;
    }

    if (!conditionAcknowledged) {
      setErrorMessage('Please check the box confirming you have reviewed the pre-owned condition notes.');
      return;
    }

    if (paymentMethod === 'cod' && !advanceAcknowledged) {
      setErrorMessage('Please confirm that you agree to pay the PKR 300 advance to proceed with your COD order.');
      return;
    }

    // Place order
    const newOrder = placeOrder({
      customer: {
        ...formData,
        address: `${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}`
      },
      paymentMethod,
      items: cart,
      subtotal
    });

    // Build WhatsApp message with full order details
    const itemLines = cart.map(item =>
      `• ${item.model} (UK ${item.sizeUK}) — ${formatPrice(item.price)} [${item.score}/10 ${item.tier}]`
    ).join('\n');

    const whatsAppMsg = paymentMethod === 'cod'
      ? `🛒 *New Gitsole Order #${newOrder.id}*\n\n` +
        `👤 *Customer:* ${formData.name}\n` +
        `📱 *WhatsApp:* ${formData.whatsapp}\n` +
        `📍 *Address:* ${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}, ${formData.city}, ${formData.province}\n\n` +
        `👟 *Items:*\n${itemLines}\n\n` +
        `💰 *Total:* ${formatPrice(finalTotal)}\n` +
        `💳 *Payment:* Cash on Delivery\n` +
        `🔒 *Advance Required:* PKR 300\n` +
        `📦 *Remaining COD:* ${formatPrice(finalTotal - 300)}\n\n` +
        `Please send me the payment details for the PKR 300 advance (JazzCash / EasyPaisa / Bank Transfer) so I can confirm my order. ✅`
      : `🛒 *New Gitsole Order #${newOrder.id}*\n\n` +
        `👤 *Customer:* ${formData.name}\n` +
        `📱 *WhatsApp:* ${formData.whatsapp}\n` +
        `📍 *Address:* ${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ''}, ${formData.city}, ${formData.province}\n\n` +
        `👟 *Items:*\n${itemLines}\n\n` +
        `💰 *Total:* ${formatPrice(finalTotal)} (3% discount applied)\n` +
        `💳 *Payment:* Bank Transfer / EasyPaisa / JazzCash (Full Prepaid)\n\n` +
        `Please send me the payment details so I can transfer the full amount. ✅`;

    // Auto-open WhatsApp with the order message
    window.open(buildWhatsAppUrl(whatsAppMsg), '_blank');

    clearCart();
    navigate(`/order/${newOrder.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)' }}>
      {/* Stripped Checkout Focus Header (Spec #7) */}
      <div style={{
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-line)',
        padding: '16px clamp(20px, 4vw, 40px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-ink)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
          <span style={{ color: 'var(--color-line)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em' }}>
            GITSOLE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={13} color="var(--color-oxblood)" />
            <span>Secure Checkout</span>
          </div>
          <a
            href={buildWhatsAppUrl("Hello Gitsole team, I need assistance during checkout.")}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-oxblood)', textDecoration: 'underline' }}
          >
            WhatsApp Help
          </a>
        </div>
      </div>

      {/* Main Checkout Form Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <form onSubmit={handleSubmit} className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '44px' }}>
          {/* Form Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Step 1: Customer Details */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '16px', borderBottom: '1px solid var(--color-line)', paddingBottom: '8px' }}>
                1. Delivery & Contact Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hamza Tariq"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                    WhatsApp Mobile Number (03XX XXXXXXX) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0321 1123474"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginTop: '4px', display: 'block' }}>
                    Our team will send a verification message on WhatsApp before courier dispatch.
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                    Complete Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Apartment #, Street #, Sector / Phase / Block"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                    Nearest Landmark * (Crucial for Courier)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Near Lalik Jan Chowk / Main Market"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '6px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lahore / Karachi / Islamabad..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-line-strong)', fontSize: '14px', backgroundColor: '#FFF' }}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-ink)', marginBottom: '16px', borderBottom: '1px solid var(--color-line)', paddingBottom: '8px' }}>
                2. Payment Method
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Cash on delivery */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  backgroundColor: paymentMethod === 'cod' ? 'var(--color-card)' : '#FFF',
                  border: paymentMethod === 'cod' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ accentColor: 'var(--color-oxblood)', marginTop: '3px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: '15px' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginTop: '2px' }}>Pay remaining amount to the courier upon receiving parcel at your doorstep.</div>
                    {paymentMethod === 'cod' && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        backgroundColor: '#FFF8F0',
                        border: '1px solid #E8D5BF',
                        borderRadius: '4px',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'var(--color-ink)'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-oxblood)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ⚠️ PKR 300 Advance Payment Required
                        </div>
                        <p style={{ margin: 0 }}>
                          To confirm your order, a <strong>non-refundable advance of PKR 300</strong> is required via <strong>JazzCash, EasyPaisa, or Bank Transfer</strong>. 
                          Payment details will be sent to your <strong>WhatsApp</strong> after placing the order.
                        </p>
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--color-muted)' }}>
                          The remaining balance of <strong>{formatPrice(finalTotal - 300)}</strong> will be collected as Cash on Delivery.
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {/* Bank Transfer / Easypaisa (3% discount) */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  backgroundColor: paymentMethod === 'bank_transfer' ? 'var(--color-card)' : '#FFF',
                  border: paymentMethod === 'bank_transfer' ? '1.5px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    style={{ accentColor: 'var(--color-oxblood)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: '15px' }}>Bank Transfer / Easypaisa / JazzCash</span>
                      <span style={{ backgroundColor: 'var(--color-oxblood)', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 6px' }}>SAVE 3%</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginTop: '2px' }}>Full payment upfront. Transfer details provided on order placement. Instant dispatch prioritization.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Condition Acknowledgement (Spec #7) */}
            <div style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-line-strong)',
              padding: '18px'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  checked={conditionAcknowledged}
                  onChange={(e) => setConditionAcknowledged(e.target.checked)}
                  style={{ accentColor: 'var(--color-oxblood)', marginTop: '3px', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-body)' }}>
                  I acknowledge that Gitsole sells <strong>hand-picked, condition-graded pre-owned footwear</strong> and that I have reviewed the specific photos, flaw close-ups, and condition score ({cart.map(c => `${c.score}/10`).join(', ')}) for this 1-of-1 order.
                </span>
              </label>
            </div>

            {/* Step 4: Advance Payment Acknowledgement for COD */}
            {paymentMethod === 'cod' && (
              <div style={{
                backgroundColor: '#FFF8F0',
                border: '1px solid #E8D5BF',
                padding: '18px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    required
                    checked={advanceAcknowledged}
                    onChange={(e) => setAdvanceAcknowledged(e.target.checked)}
                    style={{ accentColor: 'var(--color-oxblood)', marginTop: '3px', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-body)' }}>
                    I agree to pay <strong>PKR 300 advance</strong> via JazzCash / EasyPaisa / Bank Transfer. I understand that payment details will be sent to my WhatsApp and my order will only be dispatched after the advance is confirmed.
                  </span>
                </label>
              </div>
            )}

            {errorMessage && (
              <div style={{ backgroundColor: '#FFECEB', border: '1px solid var(--color-oxblood)', color: 'var(--color-oxblood)', padding: '12px 16px', fontSize: '13.5px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-oxblood"
              style={{ padding: '18px', fontSize: '16px', fontWeight: 600 }}
            >
              {paymentMethod === 'cod'
                ? `Place Order · PKR 300 Advance + ${formatPrice(finalTotal - 300)} COD`
                : `Place Order (${formatPrice(finalTotal)}) · Free Delivery`
              }
            </button>
          </div>

          {/* Right Summary Column */}
          <div style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            padding: '24px',
            height: 'fit-content'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--color-line)', paddingBottom: '8px' }}>
              Order Review ({cart.length} items)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.code} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.photos[0]} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', backgroundColor: 'var(--color-image-bg)' }} />
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <div style={{ fontWeight: 600 }}>{item.model}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
                      UK {item.sizeUK} · {item.score}/10 {item.tier}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                    {formatPrice(item.price)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>Nationwide Home Delivery</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)', fontWeight: 600 }}>FREE</span>
              </div>
              {paymentMethod === 'bank_transfer' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-oxblood)' }}>
                  <span>Online Payment Discount (3%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>-{formatPrice(subtotal * 0.03)}</span>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-oxblood)', fontWeight: 600 }}>Advance (via WhatsApp)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)', fontWeight: 600 }}>PKR 300</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-muted)' }}>Due at Doorstep (COD)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(finalTotal - 300)}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-line)', paddingTop: '10px', marginTop: '6px', fontSize: '16px' }}>
                <span style={{ fontWeight: 700 }}>Total Due</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-body)' }}>
              <ShieldCheck size={16} color="var(--color-oxblood)" />
              <span>Free returns if parcel condition does not match listing description.</span>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
