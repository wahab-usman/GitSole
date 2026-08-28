// Vercel Serverless Function: /api/orders
// Security-Hardened Orders API for GitSole E-Commerce

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wmoqabcoiqjbpwlwzkcs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kFAD10jtINWeUSNz2mIwaQ_U03U5tId';

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  return createClient(cleanUrl, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
}

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

function formatDbOrderToApp(dbRecord) {
  if (!dbRecord) return null;
  return {
    id: dbRecord.id,
    date: dbRecord.date || dbRecord.created_at || new Date().toISOString(),
    customer: typeof dbRecord.customer === 'string' ? JSON.parse(dbRecord.customer) : (dbRecord.customer || {}),
    paymentMethod: dbRecord.payment_method || dbRecord.paymentMethod || 'cod',
    items: typeof dbRecord.items === 'string' ? JSON.parse(dbRecord.items) : (Array.isArray(dbRecord.items) ? dbRecord.items : []),
    subtotal: Number(dbRecord.subtotal) || 0,
    delivery: Number(dbRecord.delivery) || 0,
    codFee: Number(dbRecord.cod_fee ?? dbRecord.codFee) || 0,
    total: Number(dbRecord.total) || 0,
    courier: dbRecord.courier || 'Trax / TCS Express',
    trackingNumber: dbRecord.tracking_number || dbRecord.trackingNumber || `TRX-${dbRecord.id}-PK`,
    status: dbRecord.status || 'placed',
    timeline: typeof dbRecord.timeline === 'string' ? JSON.parse(dbRecord.timeline) : (Array.isArray(dbRecord.timeline) ? dbRecord.timeline : [])
  };
}

function formatAppOrderToDb(appOrder) {
  if (!appOrder || !appOrder.id) return null;
  return {
    id: String(appOrder.id).trim().toUpperCase(),
    date: appOrder.date || new Date().toISOString(),
    customer: appOrder.customer || {},
    payment_method: appOrder.paymentMethod || 'cod',
    items: appOrder.items || [],
    subtotal: Number(appOrder.subtotal) || 0,
    delivery: Number(appOrder.delivery) || 0,
    cod_fee: Number(appOrder.codFee) || 0,
    total: Number(appOrder.total) || 0,
    courier: appOrder.courier || 'Trax / TCS Express',
    tracking_number: appOrder.trackingNumber || `TRX-${appOrder.id}-PK`,
    status: appOrder.status || 'placed',
    timeline: appOrder.timeline || []
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
  // GET: Single Order Lookup (Customer / Tracking) OR All Orders (Admin Only)
  // ==========================================
  if (req.method === 'GET') {
    const requestedId = (req.query.id || req.query.trackingNumber || '').trim().toUpperCase();

    // 1. Single Order Lookup by ID or Tracking Code (Public/Customer Tracking)
    if (requestedId) {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`id.ilike.${requestedId},tracking_number.ilike.${requestedId}`)
            .maybeSingle();

          if (!error && data) {
            return res.status(200).json({
              success: true,
              source: 'supabase',
              order: formatDbOrderToApp(data)
            });
          } else if (error) {
            console.warn(`[API GET /orders?id=${requestedId}] Supabase query notice:`, error.message);
          }
        } catch (err) {
          console.error(`[API GET /orders?id=${requestedId}] Exception:`, err.message);
        }
      }

      return res.status(404).json({
        success: false,
        error: `Order "${requestedId}" not found.`
      });
    }

    // 2. Fetch All Orders (Strict Admin Auth Required)
    if (!verifyAdminAuth(req)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Admin authentication required to list all orders.'
      });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('date', { ascending: false });

        if (!error && Array.isArray(data)) {
          return res.status(200).json({
            success: true,
            count: data.length,
            orders: data.map(formatDbOrderToApp)
          });
        }
      } catch (err) {
        console.error('[API GET /orders] Supabase error:', err.message);
      }
    }

    return res.status(200).json({ success: true, count: 0, orders: [] });
  }

  // ==========================================
  // POST: Customer Order Placement (Public Checkout)
  // ==========================================
  if (req.method === 'POST') {
    const payload = req.body || {};

    if (!payload.id || !payload.customer || !payload.items) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order payload: id, customer, and items are required.'
      });
    }

    const cleanId = String(payload.id).trim().toUpperCase();
    const dbRecord = formatAppOrderToDb({ ...payload, id: cleanId });

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .upsert(dbRecord, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;

        console.log(`[API POST /orders] Successfully created order ${cleanId}`);

        return res.status(201).json({
          success: true,
          order: formatDbOrderToApp(data || dbRecord)
        });
      } catch (err) {
        console.error('[API POST /orders] Error inserting order:', err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(500).json({ success: false, error: 'Database unavailable' });
  }

  // ==========================================
  // SENSITIVE MUTATIONS: ADMIN AUTH REQUIRED
  // ==========================================
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required.'
    });
  }

  // ==========================================
  // PUT: Admin Update Order (Status, Courier, Tracking, Timeline)
  // ==========================================
  if (req.method === 'PUT') {
    const { id, ...fields } = req.body || {};
    const orderId = String(id || req.query.id || '').trim().toUpperCase();

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    if (supabase) {
      try {
        const updatePayload = {};
        if (fields.status) updatePayload.status = fields.status;
        if (fields.courier) updatePayload.courier = fields.courier;
        if (fields.trackingNumber || fields.tracking_number) updatePayload.tracking_number = fields.trackingNumber || fields.tracking_number;
        if (fields.timeline) updatePayload.timeline = fields.timeline;
        if (fields.customer) updatePayload.customer = fields.customer;

        const { data, error } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', orderId)
          .select()
          .single();

        if (error) throw error;

        console.log(`[API PUT /orders] Successfully updated order ${orderId} to status: ${fields.status}`);

        return res.status(200).json({
          success: true,
          order: formatDbOrderToApp(data)
        });
      } catch (err) {
        console.error(`[API PUT /orders] Error updating order ${orderId}:`, err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(500).json({ success: false, error: 'Database unavailable' });
  }

  // ==========================================
  // DELETE: Admin Delete Order
  // ==========================================
  if (req.method === 'DELETE') {
    const orderId = String(req.query.id || req.body?.id || '').trim().toUpperCase();

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;

        console.log(`[API DELETE /orders] Successfully deleted order ${orderId}`);

        return res.status(200).json({
          success: true,
          message: `Order ${orderId} successfully deleted.`
        });
      } catch (err) {
        console.error(`[API DELETE /orders] Error deleting order ${orderId}:`, err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(500).json({ success: false, error: 'Database unavailable' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
