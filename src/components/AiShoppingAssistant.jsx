import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { sendChatMessageToAI } from '../services/aiAssistantService';
import {
  Sparkles, X, Send, RotateCcw, ExternalLink, ShoppingBag, Check,
  Bot, User, MessageCircle, Truck, HelpCircle, Minimize2
} from 'lucide-react';

const STORAGE_KEY = 'gitsole_ai_launcher_pos';

export default function AiShoppingAssistant() {
  const { products } = useProducts();
  const { cart, addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: "Hey 👋 How can I help?",
      products: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextFilters, setContextFilters] = useState({});
  const [displayedProductsMap, setDisplayedProductsMap] = useState({});

  const chatContainerRef = useRef(null);
  const launcherButtonRef = useRef(null);

  // Helper to compute button dimensions
  const getButtonDimensions = () => {
    const btn = launcherButtonRef.current;
    const btnWidth = btn ? btn.offsetWidth : 76;
    const btnHeight = btn ? btn.offsetHeight : 44;
    return { btnWidth, btnHeight };
  };

  // Helper to compute magnetically snapped position (Snaps to nearest Left or Right edge)
  const getSnappedPosition = (rawX, rawY) => {
    if (typeof window === 'undefined') return { x: rawX, y: rawY, side: 'right' };
    const { btnWidth, btnHeight } = getButtonDimensions();
    const margin = 16;

    const minX = margin;
    const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
    const minY = margin + 8;
    const maxY = Math.max(minY, window.innerHeight - btnHeight - margin - 8);

    // Keep vertical position preserved & clamped
    const clampedY = Math.min(Math.max(rawY, minY), maxY);

    // Magnetic horizontal snap: determine if closer to Left or Right side
    const centerX = rawX + btnWidth / 2;
    const viewportMidX = window.innerWidth / 2;

    const isLeft = centerX < viewportMidX;
    const snappedX = isLeft ? minX : maxX;

    return {
      x: snappedX,
      y: clampedY,
      side: isLeft ? 'left' : 'right'
    };
  };

  // 1. Draggable & Magnetically Snapped Launcher Position State
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 280, y: 500, side: 'right' };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return getSnappedPosition(parsed.x, parsed.y);
        }
      }
    } catch (e) { }

    const isMobile = window.innerWidth <= 768;
    return getSnappedPosition(
      window.innerWidth - (isMobile ? 88 : 96),
      window.innerHeight - (isMobile ? 110 : 84)
    );
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    isDragging: false,
    pointerId: null
  });

  // Clamp helper for free dragging within screen bounds
  const clampPos = (x, y) => {
    if (typeof window === 'undefined') return { x, y };
    const { btnWidth, btnHeight } = getButtonDimensions();
    const margin = 12;

    const minX = margin;
    const maxX = Math.max(minX, window.innerWidth - btnWidth - margin);
    const minY = margin + 8;
    const maxY = Math.max(minY, window.innerHeight - btnHeight - margin - 8);

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    };
  };

  // Re-snap position when window resizes or device rotates
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const snapped = getSnappedPosition(prev.side === 'left' ? 16 : window.innerWidth - 80, prev.y);
        return snapped;
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag event handlers (Supports mouse, touch & pen)
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      isDragging: false,
      pointerId: e.pointerId
    };

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) { }
    }
  };

  const handlePointerMove = (e) => {
    if (dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const distance = Math.hypot(dx, dy);

    if (distance > 6) {
      dragRef.current.isDragging = true;
      setIsDragging(true);
      setIsSnapping(false);
      const newPos = clampPos(dragRef.current.startPosX + dx, dragRef.current.startPosY + dy);
      setPosition(newPos);
    }
  };

  const handlePointerUp = (e) => {
    if (dragRef.current.pointerId !== e.pointerId) return;

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) { }
    }

    const wasDragging = dragRef.current.isDragging;
    dragRef.current.pointerId = null;
    dragRef.current.isDragging = false;
    setIsDragging(false);

    if (wasDragging) {
      // Magnetic Edge Snap to Left or Right!
      const currentX = position.x;
      const currentY = position.y;
      const snapped = getSnappedPosition(currentX, currentY);

      setIsSnapping(true);
      setPosition(snapped);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
      } catch (_) { }

      setTimeout(() => {
        setIsSnapping(false);
      }, 320);
    } else {
      // Pure Tap / Click -> Open AI Concierge!
      setIsOpen(true);
    }
  };

  const handlePointerCancel = () => {
    dragRef.current.pointerId = null;
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  // Lock body scroll on MOBILE ONLY when open (keeps desktop completely interactive)
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-scroll to bottom of messages area when new message arrives
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      const scrollElement = chatContainerRef.current;
      const scrollToBottom = () => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      };

      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen]);

  // Handle sending a message
  const handleSendMessage = async (textToSend = null) => {
    const queryText = (textToSend || inputText).trim();
    if (!queryText || isLoading) return;

    if (!textToSend) setInputText('');

    const userMsgId = 'usr_' + Date.now();
    const newHistory = [
      ...messages,
      { id: userMsgId, sender: 'user', text: queryText }
    ];

    setMessages(newHistory);
    setIsLoading(true);

    const aiResult = await sendChatMessageToAI(
      queryText,
      newHistory,
      contextFilters,
      products,
      cart,
      displayedProductsMap
    );

    setIsLoading(false);

    if (aiResult.success) {
      setContextFilters(aiResult.appliedFilters || contextFilters);

      // Execute AI cart actions (e.g. user said "add the first one to cart")
      if (aiResult.action?.type === 'ADD_TO_CART' && aiResult.action.product) {
        addToCart(aiResult.action.product);
      }

      // Update conversational reference map
      if (Array.isArray(aiResult.products) && aiResult.products.length > 0) {
        const newMap = {};
        aiResult.products.forEach((p, idx) => {
          newMap[idx + 1] = { code: p.code, brand: p.brand, model: p.model, sizeUK: p.sizeUK, price: p.price };
        });
        setDisplayedProductsMap(newMap);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiResult.reply,
          products: aiResult.products || []
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiResult.reply || "I'm having trouble checking the live inventory right now. Please try again in a moment.",
          products: []
        }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setContextFilters({});
    setDisplayedProductsMap({});
    setMessages([
      {
        id: 'welcome_msg_' + Date.now(),
        sender: 'ai',
        text: "Hey 👋 How can I help?",
        products: []
      }
    ]);
  };

  const starterChips = [
    { label: 'Find Shoes', query: 'Find shoes' },
    { label: 'Budget Picks', query: 'Show me budget picks' },
    { label: 'Best Deals', query: 'Show me best deals' }
  ];

  return (
    <>
      {/* 1. FLOATING MAGNETIC DRAGGABLE LAUNCHER (ONLY DISPLAYS "AI") */}
      {!isOpen && (
        <button
          ref={launcherButtonRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          title="Tap to open GitSole Concierge or drag to reposition"
          aria-label="Open GitSole AI Assistant"
          aria-expanded={false}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1050,
            background: 'linear-gradient(135deg, #1C1917 0%, #0F0E0D 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 215, 0, 0.45)',
            boxShadow: isDragging
              ? '0 20px 40px rgba(0, 0, 0, 0.55), 0 0 20px rgba(255, 215, 0, 0.35)'
              : '0 10px 28px rgba(0, 0, 0, 0.38), 0 0 14px rgba(255, 215, 0, 0.15)',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
            transform: isDragging ? 'scale(1.06)' : 'scale(1)',
            transition: isSnapping
              ? 'left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.15), top 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.15), transform 0.2s ease, box-shadow 0.2s ease'
              : (isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'),
            outline: 'none',
            borderRadius: '999px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="gitsole-ai-draggable-launcher"
        >
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="#FFD700" aria-hidden="true" />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '6.5px',
              height: '6.5px',
              backgroundColor: '#4CAF50',
              borderRadius: '50%',
              boxShadow: '0 0 8px #4CAF50'
            }} />
          </span>
          <span style={{ color: '#F4F1EA', fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            AI
          </span>
        </button>
      )}

      {/* 2. CHAT PANEL & MOBILE BACKDROP */}
      {isOpen && (
        <>
          {/* Mobile-only blurred backdrop (Hidden on desktop) */}
          <div
            className="gitsole-ai-mobile-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Chat Panel (Right-side card on Desktop, Centered with Margins on Mobile) */}
          <div
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="gitsole-ai-chat-panel"
            style={{
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '22px',
              overflow: 'hidden',
              border: '1px solid rgba(22, 19, 15, 0.16)'
            }}
          >
            {/* FIXED HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #0F0E0D 100%)',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4A0E17 0%, #2D080E 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <Bot size={20} color="#FFD700" aria-hidden="true" />
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    border: '1.5px solid #0F0E0D'
                  }} />
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#F4F1EA' }}>
                    GitSole Concierge
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>AI Shopping Assistant</span> · <span style={{ color: '#4CAF50', fontWeight: 600 }}>● Online</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  aria-label="Minimize AI Assistant"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minimize2 size={16} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* FIXED QUICK ACTIONS BAR */}
            <div
              className="gitsole-ai-quick-actions"
              style={{
                backgroundColor: '#F8F6F0',
                borderBottom: '1px solid rgba(22, 19, 15, 0.08)',
                padding: '8px 12px',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                flexShrink: 0
              }}
            >
              <button
                onClick={() => {
                  navigate('/track');
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(22, 19, 15, 0.12)',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Truck size={12} color="var(--color-oxblood)" aria-hidden="true" /> Track Order
              </button>

              <button
                onClick={() => {
                  window.open('https://wa.me/923211123474', '_blank');
                }}
                style={{
                  backgroundColor: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: '#2E7D32',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <MessageCircle size={12} aria-hidden="true" /> WhatsApp Human Support
              </button>

              <button
                onClick={() => {
                  navigate('/condition-guide');
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(22, 19, 15, 0.12)',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <HelpCircle size={12} aria-hidden="true" /> Grading Guide
              </button>
            </div>

            {/* ONLY MESSAGES STREAM SCROLLS (Clean Slim Scrollbar, Zero Outer Scrollbar) */}
            <div
              ref={chatContainerRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="gitsole-ai-chat-messages-container"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                padding: '16px',
                backgroundColor: '#FAF8F5',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* INITIAL EMPTY STATE WITH SHORT QUICK PICKS */}
              {messages.length <= 1 && (
                <div style={{ marginTop: '2px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Quick Suggestions:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {starterChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.query)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid rgba(22, 19, 15, 0.12)',
                          padding: '7px 12px',
                          fontSize: '12px',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          color: 'var(--color-ink)',
                          cursor: 'pointer',
                          borderRadius: '999px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MESSAGES LIST */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '92%', alignItems: 'flex-start', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                    {/* Avatar Icon */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: msg.sender === 'user' ? 'var(--color-oxblood)' : '#1C1917',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {msg.sender === 'user' ? <User size={13} aria-hidden="true" /> : <Bot size={13} color="#FFD700" aria-hidden="true" />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: msg.sender === 'user' ? 'var(--color-oxblood)' : '#FFFFFF',
                        color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-ink)',
                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(22, 19, 15, 0.1)',
                        borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.04)'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* PRODUCT CARDS IN CHAT (UNCLIPPED, RESPONSIVE & CRISP) */}
                  {Array.isArray(msg.products) && msg.products.length > 0 && (
                    <div style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.products.map((p) => {
                        const inCart = isInCart(p.code);
                        return (
                          <div
                            key={p.code}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid rgba(22, 19, 15, 0.1)',
                              borderRadius: '12px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                              width: '100%'
                            }}
                          >
                            {/* Shoe Thumbnail */}
                            <div style={{ position: 'relative', width: '54px', height: '54px', minWidth: '54px', flexShrink: 0 }}>
                              <img
                                src={p.photo}
                                alt={p.model}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--color-image-bg)',
                                  border: '1px solid var(--color-line)'
                                }}
                              />
                              <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(28, 25, 23, 0.92)',
                                color: '#FFF',
                                fontSize: '8.5px',
                                fontFamily: 'var(--font-mono)',
                                padding: '1px 3px',
                                borderRadius: '3px',
                                fontWeight: 700
                              }}>
                                {p.score || '9.0'}★
                              </span>
                            </div>

                            {/* Product Details */}
                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 700, letterSpacing: '0.04em' }}>
                                {p.brand}
                              </div>
                              <div style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: 'var(--color-ink)',
                                lineHeight: 1.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: '1px'
                              }}>
                                {p.model}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                UK {p.sizeUK} · <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{formatPrice(p.price)}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                              <Link
                                to={`/product/${p.code}`}
                                onClick={() => setIsOpen(false)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#FAF8F5',
                                  border: '1px solid rgba(22, 19, 15, 0.12)',
                                  borderRadius: '6px',
                                  fontSize: '10.5px',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  color: 'var(--color-ink)',
                                  textAlign: 'center',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px'
                                }}
                              >
                                View <ExternalLink size={10} aria-hidden="true" />
                              </Link>

                              <button
                                onClick={() => addToCart(p)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: inCart ? 'var(--color-oxblood)' : '#1C1917',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '10.5px',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px'
                                }}
                              >
                                {inCart ? <Check size={10} aria-hidden="true" /> : <ShoppingBag size={10} aria-hidden="true" />}
                                {inCart ? 'Added' : 'Bag'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* LOADING INDICATOR */}
              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FFF', border: '1px solid rgba(22, 19, 15, 0.1)', width: 'fit-content', borderRadius: '16px 16px 16px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <Sparkles size={14} className="animate-spin" color="var(--color-oxblood)" aria-hidden="true" />
                  <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>Searching GitSole store...</span>
                </div>
              )}
            </div>

            {/* FIXED BOTTOM INPUT BOX */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="gitsole-ai-chat-input-bar"
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid rgba(22, 19, 15, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                minHeight: '62px'
              }}
            >
              <input
                type="text"
                placeholder="Ask Concierge e.g. 'Nike sneakers under 6k'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 16px',
                  border: '1.5px solid rgba(22, 19, 15, 0.12)',
                  borderRadius: '999px',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FAF8F5',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="gitsole-ai-chat-input-field"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                aria-label="Send message to AI Concierge"
                style={{
                  width: '38px',
                  height: '38px',
                  minWidth: '38px',
                  borderRadius: '50%',
                  backgroundColor: !inputText.trim() || isLoading ? 'rgba(114, 24, 24, 0.4)' : 'var(--color-oxblood)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !inputText.trim() || isLoading ? 'default' : 'pointer',
                  boxShadow: '0 3px 10px rgba(114, 24, 24, 0.25)',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={15} aria-hidden="true" />
              </button>
            </form>
          </div>
        </>
      )}

      <style>{`
        /* DESKTOP STYLES (min-width: 769px) - Right Floating Side Card, NO Backdrop, NO Blur */
        @media (min-width: 769px) {
          .gitsole-ai-mobile-backdrop {
            display: none !important;
          }

          .gitsole-ai-chat-panel {
            position: fixed !important;
            right: 24px !important;
            bottom: 24px !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            width: 410px !important;
            max-width: calc(100vw - 48px) !important;
            height: 640px !important;
            max-height: calc(100vh - 48px) !important;
            z-index: 2001 !important;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25), 0 2px 10px rgba(0, 0, 0, 0.12) !important;
            animation: desktopPanelSlideIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
        }

        /* MOBILE STYLES (max-width: 768px) - Soft Backdrop Blur + Floating Rounded Panel with Edge Margins */
        @media (max-width: 768px) {
          .gitsole-ai-mobile-backdrop {
            position: fixed !important;
            inset: 0 !important;
            z-index: 2000 !important;
            background-color: rgba(15, 14, 13, 0.45) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            display: block !important;
            animation: backdropFadeIn 0.22s ease-out forwards !important;
          }

          .gitsole-ai-chat-panel {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            right: auto !important;
            bottom: auto !important;
            width: min(calc(100vw - 24px), 430px) !important;
            height: min(calc(100dvh - 64px), calc(100vh - 64px), 680px) !important;
            max-height: min(calc(100dvh - 48px), 700px) !important;
            z-index: 2001 !important;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42), 0 4px 16px rgba(0, 0, 0, 0.18) !important;
            animation: mobilePanelPopIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }

          .gitsole-ai-chat-input-bar {
            padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
          }
        }

        /* Input Focus Styling */
        .gitsole-ai-chat-input-field:focus {
          border-color: var(--color-oxblood) !important;
          box-shadow: 0 0 0 3px rgba(114, 24, 24, 0.12) !important;
          background-color: #FFFFFF !important;
        }

        /* Messages Area Custom Clean Scrollbar */
        .gitsole-ai-chat-messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(22, 19, 15, 0.2) transparent;
        }
        .gitsole-ai-chat-messages-container::-webkit-scrollbar {
          width: 5px;
        }
        .gitsole-ai-chat-messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .gitsole-ai-chat-messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(22, 19, 15, 0.2);
          border-radius: 999px;
        }

        /* Animations */
        @keyframes desktopPanelSlideIn {
          from {
            opacity: 0;
            transform: translateX(28px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes mobilePanelPopIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 14px)) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
