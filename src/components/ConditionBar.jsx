import React, { useEffect, useState, useRef } from 'react';

export default function ConditionBar({ score, tier, notes }) {
  const [fillWidth, setFillWidth] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    // Spec: IntersectionObserver on the track (threshold: 0.5),
    // animating child fill width: 0 -> score*10% over 900ms after 180ms delay
    const targetWidth = Math.min(100, Math.max(0, (score / 10) * 100));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setFillWidth(targetWidth);
          }, 180);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    return () => observer.disconnect();
  }, [score]);

  return (
    <div style={{
      backgroundColor: 'var(--color-ink)',
      color: 'var(--color-paper)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
          Condition {score} / 10 · {tier}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-rose)', textTransform: 'uppercase' }}>
          Single Piece Verified
        </div>
      </div>

      {/* Progress Track */}
      <div
        ref={trackRef}
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(241, 237, 228, 0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${fillWidth}%`,
            backgroundColor: 'var(--color-oxblood)',
            transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        />
      </div>

      {notes && (
        <div style={{
          fontSize: '13.5px',
          lineHeight: 1.6,
          color: 'var(--color-on-ink)',
          borderTop: '1px solid var(--color-on-ink-line)',
          paddingTop: '14px'
        }}>
          {notes}
        </div>
      )}
    </div>
  );
}
