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

const STORAGE_CACHE_KEY = 'gitsole_products_cache_v2';

export function ProductProvider({ children }) {
  // Start with cached products if available, or default catalog
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [lastProductSync, setLastProductSync] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Cache to localStorage for fast initial paint
  useEffect(() => {
    try {
      if (Array.isArray(products) && products.length > 0) {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(products));
      }
    } catch (e) {}
  }, [products]);

  // Sync products from Cloud DB (Supabase / Backend API)
  const syncProductsFromCloud = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const result = await fetchCloudProducts();
      if (result && result.success && Array.isArray(result.products) && result.products.length > 0) {
        setProducts(result.products);
        setIsCloudSynced(true);
        setLastProductSync(new Date());
        setSyncError(null);
      } else {
        // If DB returned nothing or error, keep existing products but record status
        setIsCloudSynced(false);
      }
    } catch (err) {
      console.warn('[ProductContext] Sync warning:', err.message);
      setSyncError(err.message);
      setIsCloudSynced(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync on mount + background periodic sync + tab focus sync
  useEffect(() => {
    syncProductsFromCloud(false);

    // Background interval: poll every 10 seconds for real-time freshness across all devices
    const interval = setInterval(() => {
      syncProductsFromCloud(true);
    }, 10000);

    // Sync immediately when user switches back to browser tab (e.g. switching between mobile and laptop)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncProductsFromCloud(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [syncProductsFromCloud]);

  // Auto-migrate legacy products from previous session into Supabase Cloud Database
  useEffect(() => {
    try {
      const oldStorage = localStorage.getItem('gitsole_products_v1');
      if (oldStorage) {
        const oldProducts = JSON.parse(oldStorage);
        if (Array.isArray(oldProducts) && oldProducts.length > 0) {
          const defaultCodes = ['GS-0428', 'GS-0429', 'GS-0430', 'GS-0431', 'GS-0432', 'GS-0433', 'GS-0434', 'GS-0435', 'GS-0436', 'GS-0437', 'GS-0438', 'GS-0439', 'GS-0440', 'GS-0441', 'GS-0442'];
          const customAdded = oldProducts.filter((op) => !defaultCodes.includes(op.code));
          if (customAdded.length > 0) {
            console.log(`[Auto-Migration] Syncing ${customAdded.length} previously added products to Supabase...`);
            Promise.all(customAdded.map((p) => insertCloudProduct(p))).then(() => {
              syncProductsFromCloud(true);
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Auto-Migration] Notice:', e);
    }
  }, [syncProductsFromCloud]);

  /**
   * Add a new product to Centralized Database
   */
  const addProduct = async (newProduct) => {
    // 1. Optimistic UI update
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.code !== newProduct.code)]);

    // 2. Cloud DB Insert
    try {
      const result = await insertCloudProduct(newProduct);
      if (result.success) {
        setIsCloudSynced(true);
        setLastProductSync(new Date());
        // Re-sync with authoritative database record
        syncProductsFromCloud(true);
        return { success: true, product: result.product || newProduct };
      } else {
        // If failed, log and inform caller
        console.error('[ProductContext] Cloud DB addProduct error:', result.error);
        return { success: false, error: result.error || 'Failed to save product to cloud database' };
      }
    } catch (err) {
      console.error('[ProductContext] Add product exception:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update an existing product in Centralized Database
   */
  const updateProduct = async (code, updatedData) => {
    // 1. Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, ...updatedData } : p))
    );

    // 2. Cloud DB Update
    try {
      const result = await updateCloudProductDb(code, updatedData);
      if (result.success) {
        setIsCloudSynced(true);
        setLastProductSync(new Date());
        syncProductsFromCloud(true);
        return { success: true, product: result.product };
      } else {
        console.error('[ProductContext] Cloud DB updateProduct error:', result.error);
        return { success: false, error: result.error || 'Failed to update product in cloud database' };
      }
    } catch (err) {
      console.error('[ProductContext] Update product exception:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete a product from Centralized Database
   */
  const deleteProduct = async (code) => {
    // 1. Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.code !== code));

    // 2. Cloud DB Delete
    try {
      const result = await deleteCloudProductDb(code);
      if (result.success) {
        setIsCloudSynced(true);
        setLastProductSync(new Date());
        syncProductsFromCloud(true);
        return { success: true };
      } else {
        console.error('[ProductContext] Cloud DB deleteProduct error:', result.error);
        return { success: false, error: result.error || 'Failed to delete product from cloud database' };
      }
    } catch (err) {
      console.error('[ProductContext] Delete product exception:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Toggle Sold Status
   */
  const toggleSoldStatus = async (code) => {
    let nextStatus = 'sold';
    let listedAt = 'Just Sold';

    const currentProduct = products.find((p) => p.code === code);
    if (currentProduct) {
      nextStatus = currentProduct.status === 'sold' ? 'available' : 'sold';
      listedAt = nextStatus === 'sold' ? 'Just Sold' : 'Available now';
    }

    // 1. Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.code === code) {
          return { ...p, status: nextStatus, listedAt };
        }
        return p;
      })
    );

    // 2. Cloud DB toggle
    try {
      await toggleCloudProductSold(code, nextStatus, listedAt);
      syncProductsFromCloud(true);
    } catch (err) {
      console.error('[ProductContext] Toggle sold exception:', err);
    }
  };

  /**
   * Reset local catalog cache and refresh from cloud
   */
  const resetToDefault = async () => {
    try {
      localStorage.removeItem(STORAGE_CACHE_KEY);
      await syncProductsFromCloud(false);
    } catch (e) {}
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        isCloudSynced,
        lastProductSync,
        syncError,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleSoldStatus,
        resetToDefault,
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
