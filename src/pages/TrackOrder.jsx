import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../data/products';
import { Search, Package, Check, Clock, Truck } from 'lucide-react';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'GS-89102';
  const [searchId, setSearchId] = useState(initialId);
  const { getOrderById, fetchLiveOrder } = useOrder();
  const [activeOrder, setActiveOrder] = useState(() => getOrderById(initialId));
  const [isSearching, setIsSearching] = useState(false);

  // Fetch live order from database on searchId change + auto poll every 5 seconds for live status changes
  useEffect(() => {
    const targetId = searchParams.get('id') || searchId;
    if (targetId && targetId.trim()) {
      const clean = targetId.trim();
      // 1. Instant state update from memory if present
      const cached = getOrderById(clean);
      if (cached) setActiveOrder(cached);

      // 2. Fetch live data from Supabase API
      const loadLive = async () => {
        const live = await fetchLiveOrder(clean);
        if (live) {
          setActiveOrder(live);
        }
      };

      loadLive();
      const pollInterval = setInterval(loadLive, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [searchParams, searchId, fetchLiveOrder, getOrderById]);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setIsSearching(true);
      const clean = searchId.trim();
      const live = await fetchLiveOrder(clean);
      if (live) {
        setActiveOrder(live);
      } else {
        setActiveOrder(getOrderById(clean));
      }
      setIsSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>
      {/* Title & Search Header */}
      <div style={{ borderBottom: '1px solid var(--color-line)', paddingBottom: '24px', marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-0.035em', color: 'var(--color-ink)' }}>
          Track Your Delivery
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginTop: '8px', maxWidth: '580px' }}>
          Enter your Gitsole Order ID (e.g. <strong>GS-89102</strong>) or Courier Tracking Number to view live dispatch milestones.
        </p>

        {/* Tracking Lookup Form */}
        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '500px', marginTop: '20px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1.5px solid var(--color-ink)',
            backgroundColor: '#FFFFFF',
            padding: '12px 16px'
          }}>
            <Search size={18} color="var(--color-muted)" />
            <input
              type="text"
              placeholder="e.g. GS-89102 or TRX-994821-PK"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Track
          </button>
        </form>
      </div>

      {activeOrder ? (
        <div className="tracking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '44px', alignItems: 'start' }}>
          {/* Left: Vertical Timeline (Spec #9) */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)', marginBottom: '24px' }}>
              Live Delivery Milestones
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '8px' }}>
              {activeOrder.timeline.map((step, idx) => {
                const isLast = idx === activeOrder.timeline.length - 1;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: isLast ? '0' : '36px' }}>
                    {/* Connecting Line */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        bottom: '0',
                        width: '2px',
                        backgroundColor: step.done ? 'var(--color-oxblood)' : '#DAD5CB'
                      }} />
                    )}

                    {/* Timeline Node Dot */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: step.done ? 'var(--color-oxblood)' : '#DAD5CB',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      flexShrink: 0
                    }}>
                      {step.done ? <Check size={13} strokeWidth={3} /> : <Clock size={12} />}
                    </div>

                    {/* Step Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '16px',
                          color: step.done ? 'var(--color-ink)' : 'var(--color-faint)'
                        }}>
                          {step.step}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--color-muted)' }}>
                          {step.time}
                        </span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: 'var(--color-body)', marginTop: '4px', lineHeight: 1.5 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Dark Courier Side Panel (Spec #9) */}
          <div style={{
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-paper)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-rose)' }}>
              Shipment Information
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--color-on-ink-line)', paddingBottom: '18px', fontSize: '13.5px' }}>
              <div>
                <div style={{ color: 'var(--color-on-ink)', fontSize: '11px', textTransform: 'uppercase' }}>Courier Partner</div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '2px' }}>{activeOrder.courier}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-ink)', fontSize: '11px', textTransform: 'uppercase' }}>Tracking Number</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: 'var(--color-rose)', marginTop: '2px' }}>{activeOrder.trackingNumber}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-ink)', fontSize: '11px', textTransform: 'uppercase' }}>Cash to Keep Ready for Rider</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: '#FFF', marginTop: '2px' }}>
                  {formatPrice(activeOrder.total)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-ink)', fontSize: '11px', textTransform: 'uppercase' }}>Destination Address</div>
                <div style={{ marginTop: '2px', color: '#FFF' }}>{activeOrder.customer?.address}, {activeOrder.customer?.city}</div>
              </div>
            </div>

            {/* Item Thumbnail */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div>
                <div style={{ color: 'var(--color-on-ink)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Parcel Contents ({activeOrder.items.length} 1-of-1 pair)
                </div>
                {activeOrder.items.map(item => (
                  <div key={item.code} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={item.photo || item.photos?.[0]} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    <div style={{ fontSize: '12.5px' }}>
                      <div style={{ fontWeight: 600 }}>{item.model}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-on-ink)' }}>UK {item.sizeUK} · {item.tier}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-line)' }}>
          <p style={{ fontSize: '16px', color: 'var(--color-ink)', fontWeight: 600 }}>
            No active order found matching "{searchId}".
          </p>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '6px' }}>
            Please check the Order ID in your confirmation message or try searching <strong>GS-89102</strong>.
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 800px) {
          .tracking-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
