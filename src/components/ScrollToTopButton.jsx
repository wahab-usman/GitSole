import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from './SmoothScroll';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top of page"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 990,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
      }}
      className="scroll-to-top-btn"
    >
      <ArrowUp size={20} strokeWidth={2.2} />
      <style>{`
        .scroll-to-top-btn:hover {
          transform: translateY(-4px) scale(1.05);
          background-color: var(--color-oxblood) !important;
          box-shadow: 0 12px 30px rgba(114, 24, 24, 0.35) !important;
        }
        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.95);
        }
        @media (max-width: 640px) {
          .scroll-to-top-btn {
            bottom: 18px;
            right: 18px;
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </button>
  );
}
