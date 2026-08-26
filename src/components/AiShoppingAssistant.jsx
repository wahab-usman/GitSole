import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { sendChatMessageToAI } from '../services/aiAssistantService';
import {
  Sparkles, X, Send, RotateCcw, ExternalLink, ShoppingBag, Check,
  Bot, User, MessageCircle, Truck, HelpCircle, Flame, Tag, SlidersHorizontal, RefreshCw
} from 'lucide-react';

export default function AiShoppingAssistant() {
  const { products } = useProducts();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: '👋 Welcome to GitSole! I am your AI Personal Shopper. Tell me your budget, size, or favourite brand and I will instantly find available pairs from our live store inventory!',
      products: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextFilters, setContextFilters] = useState({});
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quick_filters'

  const chatContainerRef = useRef(null);

  // Lock body scroll when assistant modal is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen, activeTab]);

  // Handle sending a message instantly
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

    // Instant execution via client search service with serverless AI enrichment
    const aiResult = await sendChatMessageToAI(
      queryText,
      newHistory,
      contextFilters,
      products
    );

    setIsLoading(false);

    if (aiResult.success) {
      setContextFilters(aiResult.appliedFilters || contextFilters);
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
          text: aiResult.reply || "Sorry, I'm having trouble finding shoes right now. Please try again.",
          products: []
        }
      ]);
    }
  };

  const handleResetChat = () => {
    setContextFilters({});
    setMessages([
      {
        id: 'welcome_msg_' + Date.now(),
        sender: 'ai',
        text: '🔄 Session reset! What shoes, size, or budget are you looking for now?',
        products: []
      }
    ]);
  };

  const starterChips = [
    { label: '⚡ Shoes under Rs 5,000', query: 'Show me shoes under 5000' },
    { label: '🔥 Nike Sneakers', query: 'Show me Nike sneakers' },
    { label: '🖤 Black Sneakers', query: 'Show me black sneakers' },
    { label: '📏 Size UK 9 / 43', query: 'Show me shoes size 9' },
    { label: '💎 Best Budget Deals', query: 'Show me best deals under 7000' }
  ];

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open GitSole AI Shopping Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1050,
            background: 'linear-gradient(135deg, #1C1917 0%, #0F0E0D 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 215, 0, 0.35)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.15)',
            padding: '12px 20px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="gitsole-ai-trigger-btn hover:scale-105"
        >
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={17} color="#FFD700" />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#4CAF50',
              borderRadius: '50%',
              boxShadow: '0 0 8px #4CAF50'
            }} />
          </span>
          <span style={{ color: '#F4F1EA' }}>GitSole AI Concierge</span>
        </button>
      )}

      {/* CHAT MODAL / POPOVER WINDOW */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2050,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '16px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '450px',
              height: '88vh',
              maxHeight: '680px',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(22, 19, 15, 0.2)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
              borderRadius: '16px',
              overflow: 'hidden',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="gitsole-ai-modal-panel"
          >
            {/* ULTRA-MODERN CONCIERGE HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #0F0E0D 100%)',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
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
                  position: 'relative'
                }}>
                  <Bot size={20} color="#FFD700" />
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
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#F4F1EA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    GitSole Concierge <span style={{ fontSize: '9px', backgroundColor: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>AI 2.0</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>● Online</span> · <span>Live Store Database</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CONCIERGE QUICK ACTIONS BAR */}
            <div style={{
              backgroundColor: '#F8F6F0',
              borderBottom: '1px solid rgba(22, 19, 15, 0.08)',
              padding: '8px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}>
              <button
                onClick={() => {
                  navigate('/track');
                  setIsOpen(false);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(22, 19, 15, 0.12)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Truck size={12} color="var(--color-oxblood)" /> Track Order
              </button>

              <button
                onClick={() => {
                  window.open('https://wa.me/923094376043', '_blank');
                }}
                style={{
                  backgroundColor: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: '#2E7D32',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <MessageCircle size={12} /> WhatsApp Human Support
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
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HelpCircle size={12} /> Grading Guide
              </button>
            </div>

            {/* CHAT STREAM AREA */}
            <div
              ref={chatContainerRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                padding: '16px',
                backgroundColor: '#FAF8F5',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* STARTER CHIPS */}
              {messages.length <= 2 && (
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Recommended Queries:
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
                        className="hover:border-black"
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
                      {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} color="#FFD700" />}
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
                        boxShadow: '0 3px 10px rgba(0,0,0,0.04)'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* EMBEDDED REAL PRODUCT CARDS CAROUSEL / LIST */}
                  {Array.isArray(msg.products) && msg.products.length > 0 && (
                    <div style={{ width: '100%', marginTop: '12px', paddingLeft: '34px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Matching Real Inventory ({msg.products.length} pairs):
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {msg.products.map((p) => {
                          const inCart = isInCart(p.code);
                          return (
                            <div
                              key={p.code}
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid rgba(22, 19, 15, 0.12)',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
                              }}
                            >
                              {/* Shoe Image */}
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img
                                  src={p.photo}
                                  alt={p.model}
                                  style={{
                                    width: '68px',
                                    height: '68px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--color-image-bg)',
                                    border: '1px solid var(--color-line)'
                                  }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  right: '2px',
                                  backgroundColor: '#1C1917',
                                  color: '#FFF',
                                  fontSize: '9px',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '1px 4px',
                                  borderRadius: '3px',
                                  fontWeight: 700
                                }}>
                                  {p.score || '9.0'}★
                                </span>
                              </div>

                              {/* Product Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 700, letterSpacing: '0.05em' }}>
                                  {p.brand}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-ink)' }}>
                                  {p.model}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14.5px', color: 'var(--color-ink)' }}>
                                    {formatPrice(p.price)}
                                  </span>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', backgroundColor: '#F4F1EA', padding: '1px 7px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(0,0,0,0.06)' }}>
                                    UK {p.sizeUK}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                                <Link
                                  to={`/product/${p.code}`}
                                  onClick={() => setIsOpen(false)}
                                  style={{
                                    backgroundColor: '#F4F1EA',
                                    color: 'var(--color-ink)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    borderRadius: '5px',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  View <ExternalLink size={10} />
                                </Link>
                                <button
                                  onClick={() => addToCart({ code: p.code, brand: p.brand, model: p.model, price: p.price, sizeUK: p.sizeUK, photos: [p.photo] })}
                                  style={{
                                    backgroundColor: 'var(--color-oxblood)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  {inCart ? <Check size={10} /> : <ShoppingBag size={10} />} {inCart ? 'Added' : 'Cart'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* LOADING INDICATOR */}
              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FFF', border: '1px solid rgba(22, 19, 15, 0.1)', width: 'fit-content', borderRadius: '16px 16px 16px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <Sparkles size={14} className="animate-spin" color="var(--color-oxblood)" />
                  <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>Searching GitSole live inventory...</span>
                </div>
              )}
            </div>

            {/* INPUT FOOTER */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid rgba(22, 19, 15, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <input
                type="text"
                placeholder="Ask Concierge e.g. 'Adidas sneakers under 6k size 9'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  border: '1px solid rgba(22, 19, 15, 0.15)',
                  borderRadius: '999px',
                  fontSize: '13.5px',
                  outline: 'none',
                  backgroundColor: '#FAF8F5',
                  color: 'var(--color-ink)'
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-oxblood)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !inputText.trim() || isLoading ? 'default' : 'pointer',
                  opacity: !inputText.trim() || isLoading ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 600px) {
          .gitsole-ai-modal-panel {
            maxWidth: 100% !important;
            height: 100vh !important;
            maxHeight: 100vh !important;
            borderRadius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
