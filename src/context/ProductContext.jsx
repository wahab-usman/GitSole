import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const ProductContext = createContext();

const STORAGE_KEY = 'gitsole_products_v1';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  const addProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (code, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProduct = (code) => {
    setProducts((prev) => prev.filter((p) => p.code !== code));
  };

  const toggleSoldStatus = (code) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.code === code) {
          const nextStatus = p.status === 'sold' ? 'available' : 'sold';
          const listedAt = nextStatus === 'sold' ? 'Just Sold' : 'Available now';
          return { ...p, status: nextStatus, listedAt };
        }
        return p;
      })
    );
  };

  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleSoldStatus,
        resetToDefault,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
