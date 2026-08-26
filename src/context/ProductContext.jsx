import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import {
  fetchCloudProducts,
  insertCloudProduct,
  updateCloudProduct as updateCloudProductDb,
  deleteCloudProduct as deleteCloudProductDb,
  toggleCloudProductSold
} from '../services/productCloudDb';

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

  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [lastProductSync, setLastProductSync] = useState(null);

  // Sync to local storage for offline / quick reload caching
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Sync products from Cloud DB (Supabase / Cloud Container)
  const syncProductsFromCloud = useCallback(async () => {
    try {
      const cloudData = await fetchCloudProducts();
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        setProducts((prev) => {
          // Merge preserving any immediate unsaved changes
          const map = new Map();
          // Seed defaults
          INITIAL_PRODUCTS.forEach(p => map.set(p.code, p));
          // Overwrite with cloud data (source of truth across devices)
          cloudData.forEach(p => map.set(p.code, p));
          return Array.from(map.values());
        });
        setIsCloudSynced(true);
        setLastProductSync(new Date());
      }
    } catch (err) {
      console.warn('[ProductContext] Cloud sync warning:', err.message);
    }
  }, []);

  // Sync on mount and background poll every 8 seconds for real-time multi-device freshness
  useEffect(() => {
    syncProductsFromCloud();
    const interval = setInterval(syncProductsFromCloud, 8000);
    return () => clearInterval(interval);
  }, [syncProductsFromCloud]);

  const addProduct = (newProduct) => {
    // 1. Optimistic UI update
    setProducts((prev) => [newProduct, ...prev.filter(p => p.code !== newProduct.code)]);
    // 2. Cloud DB push
    insertCloudProduct(newProduct);
  };

  const updateProduct = (code, updatedData) => {
    // 1. Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, ...updatedData } : p))
    );
    // 2. Cloud DB push
    updateCloudProductDb(code, updatedData);
  };

  const deleteProduct = (code) => {
    // 1. Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.code !== code));
    // 2. Cloud DB push
    deleteCloudProductDb(code);
  };

  const toggleSoldStatus = (code) => {
    let nextStatus = 'sold';
    let listedAt = 'Just Sold';

    setProducts((prev) =>
      prev.map((p) => {
        if (p.code === code) {
          nextStatus = p.status === 'sold' ? 'available' : 'sold';
          listedAt = nextStatus === 'sold' ? 'Just Sold' : 'Available now';
          return { ...p, status: nextStatus, listedAt };
        }
        return p;
      })
    );

    toggleCloudProductSold(code, nextStatus, listedAt);
  };

  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY);
    syncProductsFromCloud();
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
        isCloudSynced,
        lastProductSync,
        syncProductsFromCloud
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
