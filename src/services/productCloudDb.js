// Product Cloud Database Service for GitSole
// Communicates with Centralized Supabase Database & /api/products Backend

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { PRODUCTS as DEFAULT_PRODUCTS, getEuFromUk } from '../data/products.js';
import { getAdminAuthHeaders } from '../context/AdminAuthContext.jsx';

let isSeedingInProgress = false;

/**
 * Format DB row to App format
 */
export function formatDbProductToApp(row) {
  if (!row) return null;
  return {
    code: String(row.code || '').trim().toUpperCase(),
    brand: row.brand || '',
    model: row.model || '',
    colourway: row.colourway || '',
    sizeEU: String(row.size_eu || row.sizeEU || getEuFromUk(row.size_uk || row.sizeUK) || '44'),
    sizeUK: String(row.size_uk || row.sizeUK || '9'),
    sizeUS: String(row.size_us || row.sizeUS || '10'),
    insoleCm: row.insole_cm ? Number(row.insole_cm) : (row.insoleCm ? Number(row.insoleCm) : 28.0),
    score: row.score !== undefined ? Number(row.score) : 9.0,
    tier: row.tier || 'Excellent',
    conditionNotes: row.condition_notes || row.conditionNotes || '',
    flaws: Array.isArray(row.flaws) ? row.flaws : [],
    price: Number(row.price) || 0,
    retailPrice: Number(row.retail_price || row.retailPrice) || 0,
    discountPercent: Number(row.discount_percent || row.discountPercent) || 0,
    photos: Array.isArray(row.photos) ? row.photos : (row.photo ? [row.photo] : []),
    boxIncluded: Boolean(row.box_included ?? row.boxIncluded ?? false),
    listedAt: row.listed_at || row.listedAt || 'Recently listed',
    status: row.status || 'available',
    featured: Boolean(row.featured ?? false),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

/**
 * Format App format to DB row
 */
export function formatAppProductToDb(appProduct) {
  return {
    code: String(appProduct.code || '').trim().toUpperCase(),
    brand: String(appProduct.brand || '').trim(),
    model: String(appProduct.model || '').trim(),
    colourway: String(appProduct.colourway || '').trim(),
    size_eu: String(appProduct.sizeEU || getEuFromUk(appProduct.sizeUK) || '44'),
    size_uk: String(appProduct.sizeUK || '9'),
    size_us: String(appProduct.sizeUS || '10'),
    insole_cm: Number(appProduct.insoleCm) || 28.0,
    score: Number(appProduct.score) || 9.0,
    tier: String(appProduct.tier || 'Excellent'),
    condition_notes: String(appProduct.conditionNotes || ''),
    flaws: Array.isArray(appProduct.flaws) ? appProduct.flaws : [],
    price: Number(appProduct.price) || 0,
    retail_price: Number(appProduct.retailPrice) || 0,
    discount_percent: Number(appProduct.discountPercent) || 0,
    photos: Array.isArray(appProduct.photos) ? appProduct.photos : [],
    box_included: Boolean(appProduct.boxIncluded),
    listed_at: String(appProduct.listedAt || 'Recently listed'),
    status: String(appProduct.status || 'available'),
    featured: Boolean(appProduct.featured),
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetch all products from Centralized Cloud Database
 * Public Read Access
 */
export async function fetchCloudProducts() {
  // 1. Direct Supabase Query (Fastest on frontend)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          return { success: true, source: 'supabase', products: data.map(formatDbProductToApp) };
        } else if (data.length === 0 && !isSeedingInProgress) {
          return { success: true, source: 'empty', products: DEFAULT_PRODUCTS };
        }
      }
    } catch (err) {
      console.warn('[Cloud DB] Supabase direct query notice:', err.message);
    }
  }

  // 2. Fetch via Backend API endpoint /api/products
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.products) && json.products.length > 0) {
        return { success: true, source: 'api', products: json.products.map(formatDbProductToApp) };
      }
    }
  } catch (apiErr) {
    console.warn('[Cloud DB] /api/products fetch notice:', apiErr.message);
  }

  return { success: false, source: 'default', products: null };
}

/**
 * Insert or create a new product in the Centralized Database (Admin Only)
 */
export async function insertCloudProduct(product) {
  if (!product || !product.code) {
    return { success: false, error: 'Invalid product payload: missing code.' };
  }

  const cleanCode = String(product.code).trim().toUpperCase();
  const dbRecord = formatAppProductToDb({ ...product, code: cleanCode });
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(dbRecord)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, product: json.product || product, source: 'api' };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    console.warn('[Cloud DB] /api/products POST error:', apiErr.message);
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to insert product' };
}

/**
 * Update an existing product in Centralized Database (Admin Only)
 */
export async function updateCloudProduct(code, updatedData) {
  if (!code) return { success: false, error: 'Product code is required' };

  const cleanCode = String(code).trim().toUpperCase();
  const dbRecord = formatAppProductToDb({ code: cleanCode, ...updatedData });
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/products?code=${encodeURIComponent(cleanCode)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(dbRecord)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, product: json.product, source: 'api' };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to update product' };
}

/**
 * Delete a product from Centralized Database (Admin Only)
 */
export async function deleteCloudProduct(code) {
  if (!code) return { success: false, error: 'Product code is required' };

  const cleanCode = String(code).trim().toUpperCase();
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/products?code=${encodeURIComponent(cleanCode)}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders
      }
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, source: 'api' };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to delete product' };
}

/**
 * Toggle product sold/available status
 */
export async function toggleCloudProductSold(code, nextStatus, listedAt) {
  return await updateCloudProduct(code, { status: nextStatus, listedAt });
}
