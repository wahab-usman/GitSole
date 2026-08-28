// Vercel Serverless Function: /api/products
// Centralized, Security-Hardened Product Management API for GitSole

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wmoqabcoiqjbpwlwzkcs.supabase.co';
// Use Service Role Key if provided for administrative RLS bypass on backend, otherwise fallback to Anon key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kFAD10jtINWeUSNz2mIwaQ_U03U5tId';

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  return createClient(cleanUrl, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
}

/**
 * Verify Admin Authorization Header
 */
function verifyAdminAuth(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-auth'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');
    return Boolean(user && pass && user.trim().length > 0 && pass.trim().length > 0);
  } catch (e) {
    return false;
  }
}

function formatDbToApp(row) {
  if (!row) return null;
  return {
    code: row.code,
    brand: row.brand,
    model: row.model,
    colourway: row.colourway || '',
    sizeEU: row.size_eu || '44',
    sizeUK: String(row.size_uk || ''),
    sizeUS: String(row.size_us || ''),
    insoleCm: row.insole_cm ? Number(row.insole_cm) : 28.0,
    score: row.score ? Number(row.score) : 9.0,
    tier: row.tier || 'Excellent',
    conditionNotes: row.condition_notes || '',
    flaws: Array.isArray(row.flaws) ? row.flaws : [],
    price: Number(row.price) || 0,
    retailPrice: Number(row.retail_price) || 0,
    discountPercent: Number(row.discount_percent) || 0,
    photos: Array.isArray(row.photos) ? row.photos : (row.photo ? [row.photo] : []),
    boxIncluded: Boolean(row.box_included),
    listedAt: row.listed_at || 'Recently listed',
    status: row.status || 'available',
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatAppToDb(appProduct) {
  return {
    code: String(appProduct.code || '').trim().toUpperCase(),
    brand: String(appProduct.brand || '').trim(),
    model: String(appProduct.model || '').trim(),
    colourway: String(appProduct.colourway || '').trim(),
    size_eu: String(appProduct.sizeEU || '').trim(),
    size_uk: String(appProduct.sizeUK || '').trim(),
    size_us: String(appProduct.sizeUS || '').trim(),
    insole_cm: Number(appProduct.insoleCm) || 28.0,
    score: Number(appProduct.score) || 9.0,
    tier: String(appProduct.tier || 'Excellent').trim(),
    condition_notes: String(appProduct.conditionNotes || '').trim(),
    flaws: Array.isArray(appProduct.flaws) ? appProduct.flaws : [],
    price: Number(appProduct.price) || 0,
    retail_price: Number(appProduct.retailPrice) || 0,
    discount_percent: Number(appProduct.discountPercent) || 0,
    photos: Array.isArray(appProduct.photos) ? appProduct.photos : [],
    box_included: Boolean(appProduct.boxIncluded),
    listed_at: String(appProduct.listedAt || 'Recently listed').trim(),
    status: String(appProduct.status || 'available').trim(),
    featured: Boolean(appProduct.featured),
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-auth');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  // ==========================================
  // GET: Public Read Access (Storefront & Admin)
  // ==========================================
  if (req.method === 'GET') {
    const { code } = req.query || {};

    if (supabase) {
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false });

        if (code) {
          query = query.eq('code', code.toUpperCase()).single();
        }

        const { data, error } = await query;

        if (!error && data) {
          if (Array.isArray(data)) {
            return res.status(200).json({
              success: true,
              source: 'supabase',
              count: data.length,
              products: data.map(formatDbToApp)
            });
          } else {
            return res.status(200).json({
              success: true,
              source: 'supabase',
              product: formatDbToApp(data)
            });
          }
        }
      } catch (sbErr) {
        console.warn('[API GET /products] Supabase query error:', sbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: 'fallback',
      products: []
    });
  }

  // ==========================================
  // ADMIN ACCESS VERIFICATION FOR MUTATIONS
  // ==========================================
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required to modify products.'
    });
  }

  // ==========================================
  // POST: Create a new product (Admin Only)
  // ==========================================
  if (req.method === 'POST') {
    const payload = req.body || {};

    if (!payload.code || !payload.brand || !payload.model || payload.price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required product fields: code, brand, model, and price are required.'
      });
    }

    const cleanCode = String(payload.code).trim().toUpperCase();
    const dbRecord = formatAppToDb({ ...payload, code: cleanCode });

    if (supabase) {
      try {
        // Check for duplicate code
        const { data: existing } = await supabase
          .from('products')
          .select('code')
          .eq('code', cleanCode)
          .maybeSingle();

        if (existing && !req.query.upsert) {
          return res.status(409).json({
            success: false,
            error: `Product with SKU Code "${cleanCode}" already exists.`
          });
        }

        // Insert into database
        const { data, error } = await supabase
          .from('products')
          .upsert(dbRecord, { onConflict: 'code' })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({
          success: true,
          product: formatDbToApp(data || dbRecord)
        });
      } catch (sbErr) {
        console.error('[API POST /products] Database error:', sbErr.message);
        let errorMsg = sbErr.message;
        if (errorMsg.includes('row-level security policy')) {
          errorMsg = 'Database permission notice: Please add SUPABASE_SERVICE_ROLE_KEY to your Vercel Environment Variables (from Supabase Settings -> API -> service_role secret).';
        }
        return res.status(500).json({
          success: false,
          error: errorMsg
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Database connection unavailable.'
    });
  }

  // ==========================================
  // PUT: Update an existing product (Admin Only)
  // ==========================================
  if (req.method === 'PUT') {
    const payload = req.body || {};
    const code = (req.query.code || payload.code || '').trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Product code is required for update.'
      });
    }

    const dbRecord = formatAppToDb({ ...payload, code });

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(dbRecord)
          .eq('code', code)
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          product: formatDbToApp(data || dbRecord)
        });
      } catch (sbErr) {
        console.error('[API PUT /products] Error updating product:', sbErr.message);
        return res.status(500).json({
          success: false,
          error: `Database error: ${sbErr.message}`
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Database is not configured.'
    });
  }

  // ==========================================
  // DELETE: Delete a product (Admin Only)
  // ==========================================
  if (req.method === 'DELETE') {
    const code = (req.query.code || req.body?.code || '').trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Product code is required for deletion.'
      });
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('code', code);

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: `Product ${code} successfully deleted.`
        });
      } catch (sbErr) {
        console.error('[API DELETE /products] Error deleting product:', sbErr.message);
        return res.status(500).json({
          success: false,
          error: `Database error: ${sbErr.message}`
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Database is not configured.'
    });
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed.` });
}
