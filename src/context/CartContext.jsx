import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const RESERVATION_INITIAL_SECONDS = 30 * 60; // 30 minutes

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gitsole_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const savedTime = localStorage.getItem('gitsole_cart_timer');
      return savedTime ? Number(savedTime) : RESERVATION_INITIAL_SECONDS;
    } catch {
      return RESERVATION_INITIAL_SECONDS;
    }
  });

  const [badgeAnimated, setBadgeAnimated] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('gitsole_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Reservation countdown timer
  useEffect(() => {
    if (cart.length === 0) {
      setTimeLeft(RESERVATION_INITIAL_SECONDS);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Soft reservation expired
          return RESERVATION_INITIAL_SECONDS;
        }
        const next = prev - 1;
        try {
          localStorage.setItem('gitsole_cart_timer', String(next));
        } catch {}
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cart.length]);

  const addToCart = (product) => {
    if (!product || product.status === 'sold') return false;

    setCart(prev => {
      // Single-piece stock: ensure product can only be added once
      const exists = prev.some(item => item.code === product.code);
      if (exists) return prev;
      return [...prev, product];
    });

    setTimeLeft(RESERVATION_INITIAL_SECONDS);
    setLastAddedItem(product);

    // Trigger badge pop animation
    setBadgeAnimated(true);
    setTimeout(() => setBadgeAnimated(false), 500);

    return true;
  };

  const removeFromCart = (code) => {
    setCart(prev => prev.filter(item => item.code !== code));
  };

  const clearCart = () => {
    setCart([]);
    setTimeLeft(RESERVATION_INITIAL_SECONDS);
  };

  const isInCart = (code) => {
    return cart.some(item => item.code === code);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  const formatTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      subtotal,
      timeLeft,
      formatTimer,
      badgeAnimated,
      lastAddedItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
