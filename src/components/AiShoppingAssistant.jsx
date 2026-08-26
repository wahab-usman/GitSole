import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { sendChatMessageToAI } from '../services/aiAssistantService';
import { Sparkles, X, Send, RotateCcw, ExternalLink, ShoppingBag, ArrowRight, MessageSquare, Check, ShieldCheck } from 'lucide-react';

export default function AiShoppingAssistant() {
  const { products } = useProducts();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: 'Hello! I am your GitSole AI Shopping Assistant. Tell me what kind of shoes, size, or budget you are looking for!',
      products: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextFilters, setContextFilters] = useState({});

  const chatContainerRef = useRef(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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

    // Send payload to AI Service
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
        text: 'Conversation reset! What shoes, size, or budget are you looking for now?',
        products: []
      }
    ]);
  };

  const starterChips = [
    { label: '👟 Shoes under Rs. 5,000', query: 'Show me shoes under 5000' },
    { label: '🔥 Nike Sneakers', query: 'Show me Nike sneakers' },
    { label: '🖤 Black Sneakers', query: 'Show me black sneakers' },
    { label: '📏 Size UK 9', query: 'Show me shoes size 9' },
    { label: '💰 Best Budget Deals', query: 'Show me best deals under 7000' }
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
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-paper)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            padding: '12px 20px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '13.5px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            transition: 'transform 0.25s ease, background-color 0.25s ease'
          }}
          className="gitsole-ai-trigger-btn"
        >
          <span style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} color="#FFD700" />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '7px',
              height: '7px',
              backgroundColor: '#66BB6A',
              borderRadius: '50%'
            }} />
          </span>
          <span>GitSole AI</span>
        </button>
      )}

      {/* CHAT MODAL / POPOVER WINDOW */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2050,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '16px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '440px',
              height: '85vh',
              maxHeight: '660px',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid var(--color-ink)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
            className="gitsole-ai-modal-panel"
          >
            {/* CHAT HEADER */}
            <div style={{
              backgroundColor: 'var(--color-ink)',
              color: 'var(--color-paper)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#FFD700" />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>
                    GitSole AI Assistant
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#81C784', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#66BB6A', borderRadius: '50%' }} />
                  Live Inventory Connected · 0% Hallucinations
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES STREAM */}
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: 'var(--color-paper)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* STARTER CHIPS */}
              {messages.length <= 2 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Suggested Prompts:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {starterChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.query)}
                        style={{
                          backgroundColor: '#FFF',
                          border: '1px solid var(--color-line-strong)',
                          padding: '6px 11px',
                          fontSize: '12px',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 500,
                          color: 'var(--color-ink)',
                          cursor: 'pointer',
                          borderRadius: '999px',
                          textAlign: 'left',
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
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '12px 15px',
                      backgroundColor: msg.sender === 'user' ? 'var(--color-oxblood)' : '#FFFFFF',
                      color: msg.sender === 'user' ? '#FFFFFF' : 'var(--color-ink)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--color-line-strong)',
                      borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '13.5px',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    {msg.sender === 'ai' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)', fontWeight: 700, marginBottom: '4px' }}>
                        <Sparkles size={12} /> GitSole AI
                      </div>
                    )}
                    {msg.text}
                  </div>

                  {/* EMBEDDED REAL PRODUCT CARDS */}
                  {Array.isArray(msg.products) && msg.products.length > 0 && (
                    <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
                        Matching Real Inventory ({msg.products.length}):
                      </div>
                      {msg.products.map((p) => {
                        const inCart = isInCart(p.code);
                        return (
                          <div
                            key={p.code}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid var(--color-line-strong)',
                              padding: '10px 12px',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                              borderRadius: '4px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                          >
                            {/* Shoe Image */}
                            <img
                              src={p.photo}
                              alt={p.model}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                backgroundColor: 'var(--color-image-bg)',
                                border: '1px solid var(--color-line)',
                                flexShrink: 0
                              }}
                            />

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 700 }}>
                                {p.brand}
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-ink)' }}>
                                {p.model}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: 'var(--color-ink)' }}>
                                  {formatPrice(p.price)}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', backgroundColor: '#F4F1EA', padding: '1px 6px', fontWeight: 600 }}>
                                  UK {p.sizeUK}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                              <Link
                                to={`/product/${p.code}`}
                                onClick={() => setIsOpen(false)}
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', fontSize: '11px', minHeight: '26px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                View <ExternalLink size={10} />
                              </Link>
                              <button
                                onClick={() => addToCart({ code: p.code, brand: p.brand, model: p.model, price: p.price, sizeUK: p.sizeUK, photos: [p.photo] })}
                                className="btn btn-oxblood"
                                style={{ padding: '4px 10px', fontSize: '11px', minHeight: '26px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                {inCart ? <Check size={10} /> : <ShoppingBag size={10} />} {inCart ? 'Added' : 'Cart'}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FFF', border: '1px solid var(--color-line-strong)', width: 'fit-content', borderRadius: '14px 14px 14px 2px' }}>
                  <Sparkles size={14} className="animate-spin" color="var(--color-oxblood)" />
                  <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>Searching GitSole inventory...</span>
                </div>
              )}
            </div>

            {/* CHAT INPUT BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid var(--color-line-strong)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <input
                type="text"
                placeholder="Ask e.g. 'Shoes under 5k size 9'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--color-line-strong)',
                  borderRadius: '2px',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="btn btn-oxblood"
                style={{
                  padding: '10px 16px',
                  minHeight: '40px',
                  opacity: !inputText.trim() || isLoading ? 0.6 : 1
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
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
