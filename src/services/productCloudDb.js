// Product Cloud Database Service: Supabase integration with automatic fallback
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { PRODUCTS as DEFAULT_PRODUCTS, getEuFromUk } from '../data/products.js';

const FALLBACK_CONTAINER_ID = 'ff8081819ff5b11001a03ca2ee9c2319';
const FALLBACK_DB_URL = `https://api.restful-api.dev/objects/${FALLBACK_CONTAINER_ID}`;

/**
 * Fetch all products from Cloud Database (Supabase with secondary Cloud fallback)
 */
export async function fetchCloudProducts() {
  // 1. Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(formatDbProductToApp);
      }

      // If Supabase table is empty, auto-seed with default products
      if (!error && Array.isArray(data) && data.length === 0) {
        await seedSupabaseProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
    } catch (err) {
      console.warn('[Supabase] Failed to fetch products, trying fallback:', err.message);
    }
  }

  // 2. Secondary Cloud REST container fallback for immediate multi-device sync
  try {
    const res = await fetch(FALLBACK_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.products) && json.data.products.length > 0) {
        return json.data.products;
      }
    }
  } catch (fallbackErr) {
    console.warn('[Cloud DB Fallback] Fetch error:', fallbackErr.message);
  }

  return null;
}

/**
 * Save / Insert a new product into Cloud DB
 */
export async function insertCloudProduct(product) {
  if (!product || !product.code) return false;

  let success = false;

  // 1. Supabase insert/upsert
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbRecord = formatAppProductToDb(product);
      const { error } = await supabase
        .from('products')
        .upsert(dbRecord, { onConflict: 'code' });

      if (!error) success = true;
    } catch (err) {
      console.warn('[Supabase] Insert product error:', err.message);
    }
  }

  // 2. Secondary Cloud REST sync
  try {
    const current = await fetchFallbackProducts();
    const updated = [product, ...current.filter(p => p.code !== product.code)];
    await saveFallbackProducts(updated);
    success = true;
  } catch (err) {
    console.warn('[Cloud DB Fallback] Save product error:', err.message);
  }

  return success;
}

/**
 * Update an existing product in Cloud DB
 */
export async function updateCloudProduct(code, updatedData) {
  if (!code) return false;

  let success = false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const dbRecord = formatAppProductToDb({ code, ...updatedData });
      const { error } = await supabase
        .from('products')
        .update(dbRecord)
        .eq('code', code);

      if (!error) success = true;
    } catch (err) {
      console.warn('[Supabase] Update product error:', err.message);
    }
  }

  try {
    const current = await fetchFallbackProducts();
    const updated = current.map(p => (p.code === code ? { ...p, ...updatedData } : p));
    await saveFallbackProducts(updated);
    success = true;
  } catch (err) {
    console.warn('[Cloud DB Fallback] Update product error:', err.message);
  }

  return success;
}

/**
 * Delete a product from Cloud DB
 */
export async function deleteCloudProduct(code) {
  if (!code) return false;

  let success = false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('code', code);

      if (!error) success = true;
    } catch (err) {
      console.warn('[Supabase] Delete product error:', err.message);
    }
  }

  try {
    const current = await fetchFallbackProducts();
    const updated = current.filter(p => p.code !== code);
    await saveFallbackProducts(updated);
    success = true;
  } catch (err) {
    console.warn('[Cloud DB Fallback] Delete product error:', err.message);
  }

  return success;
}

/**
 * Toggle product sold / available status in Cloud DB
 */
export async function toggleCloudProductSold(code, nextStatus, listedAt) {
  return await updateCloudProduct(code, { status: nextStatus, listedAt });
}

/**
 * Helper to auto-seed initial products to Supabase
 */
async function seedSupabaseProducts(products) {
  if (!isSupabaseConfigured() || !supabase || !Array.isArray(products)) return;
  try {
    const records = products.map(formatAppProductToDb);
    await supabase.from('products').upsert(records, { onConflict: 'code' });
  } catch (e) {
    console.warn('[Supabase] Seeding error:', e.message);
  }
}

/**
 * Transform DB row to App format
 */
function formatDbProductToApp(row) {
  return {
    code: row.code,
    brand: row.brand,
    model: row.model,
    colourway: row.colourway,
    sizeEU: row.size_eu || row.sizeEU || getEuFromUk(row.size_uk || row.sizeUK) || '44',
    sizeUK: row.size_uk || row.sizeUK,
    sizeUS: row.size_us || row.sizeUS,
    insoleCm: row.insole_cm ? Number(row.insole_cm) : (row.insoleCm ? Number(row.insoleCm) : 28.0),
    score: row.score ? Number(row.score) : 9.0,
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
    featured: Boolean(row.featured ?? false)
  };
}

/**
 * Transform App format to DB row
 */
function formatAppProductToDb(appProduct) {
  return {
    code: appProduct.code,
    brand: appProduct.brand,
    model: appProduct.model,
    colourway: appProduct.colourway || '',
    size_uk: String(appProduct.sizeUK || ''),
    size_us: String(appProduct.sizeUS || ''),
    insole_cm: Number(appProduct.insoleCm) || null,
    score: Number(appProduct.score) || 9.0,
    tier: appProduct.tier || 'Excellent',
    condition_notes: appProduct.conditionNotes || '',
    flaws: Array.isArray(appProduct.flaws) ? appProduct.flaws : [],
    price: Number(appProduct.price) || 0,
    retail_price: Number(appProduct.retailPrice) || 0,
    discount_percent: Number(appProduct.discountPercent) || 0,
    photos: Array.isArray(appProduct.photos) ? appProduct.photos : [],
    box_included: Boolean(appProduct.boxIncluded),
    listed_at: appProduct.listedAt || 'Recently listed',
    status: appProduct.status || 'available',
    featured: Boolean(appProduct.featured)
  };
}

/**
 * Fallback helpers
 */
async function fetchFallbackProducts() {
  try {
    const res = await fetch(FALLBACK_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.products)) {
        return json.data.products;
      }
    }
  } catch {}
  return DEFAULT_PRODUCTS;
}

async function saveFallbackProducts(productsArray) {
  try {
    // Also sync with master container
    const res = await fetch(FALLBACK_DB_URL);
    let existingData = {};
    if (res.ok) {
      const json = await res.json();
      existingData = json.data || {};
    }

    await fetch(FALLBACK_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'gitsole_master_orders_store_v1',
        data: {
          ...existingData,
          products: productsArray,
          productsLastUpdated: new Date().toISOString()
        }
      })
    });
  } catch {}
}
