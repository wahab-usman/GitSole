// Real-time Cloud Database Service for GitSole Orders
// Powered by Supabase integration with automatic offline caching

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Format DB snake_case record to Frontend camelCase object
 */
export function formatDbOrderToApp(dbRecord) {
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

/**
 * Format Frontend camelCase object to DB snake_case record
 */
export function formatAppOrderToDb(appOrder) {
  if (!appOrder || !appOrder.id) return null;
  return {
    id: appOrder.id,
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

/**
 * Fetch all orders from Cloud Database (Supabase)
 */
export async function fetchCloudOrders() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(formatDbOrderToApp);
      }

      if (error) {
        console.warn('[Supabase Orders Fetch Warning]:', error.message || error);
      }
    } catch (err) {
      console.warn('[Supabase Orders Fetch Error]:', err.message);
    }
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem('gitsole_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}

  return null;
}

/**
 * Save or insert a single order into Cloud DB (Supabase)
 */
export async function saveCloudOrder(newOrder) {
  if (!newOrder || !newOrder.id) return false;

  let success = false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const dbRecord = formatAppOrderToDb(newOrder);
      const { error } = await supabase
        .from('orders')
        .upsert(dbRecord, { onConflict: 'id' });

      if (!error) {
        success = true;
      } else {
        console.warn('[Supabase Save Order Warning]:', error.message || error);
      }
    } catch (err) {
      console.warn('[Supabase Save Order Error]:', err.message);
    }
  }

  // Always update local storage as backup
  try {
    const saved = localStorage.getItem('gitsole_orders');
    const existing = saved ? JSON.parse(saved) : [];
    const index = existing.findIndex(o => o.id === newOrder.id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = newOrder;
    } else {
      updated = [newOrder, ...existing];
    }
    localStorage.setItem('gitsole_orders', JSON.stringify(updated));
  } catch (_) {}

  return success;
}

/**
 * Update partial fields of an order in Cloud DB (Supabase)
 */
export async function updateCloudOrderFields(orderId, fields) {
  if (!orderId) return false;

  let success = false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const updatePayload = {};
      if (fields.status) updatePayload.status = fields.status;
      if (fields.courier) updatePayload.courier = fields.courier;
      if (fields.trackingNumber) updatePayload.tracking_number = fields.trackingNumber;
      if (fields.timeline) updatePayload.timeline = fields.timeline;
      if (fields.customer) updatePayload.customer = fields.customer;

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      if (!error) {
        success = true;
      } else {
        console.warn('[Supabase Update Order Warning]:', error.message || error);
      }
    } catch (err) {
      console.warn('[Supabase Update Order Error]:', err.message);
    }
  }

  // Update local storage
  try {
    const saved = localStorage.getItem('gitsole_orders');
    if (saved) {
      const existing = JSON.parse(saved);
      const updated = existing.map(o => o.id === orderId ? { ...o, ...fields } : o);
      localStorage.setItem('gitsole_orders', JSON.stringify(updated));
    }
  } catch (_) {}

  return success;
}

/**
 * Delete an order from Cloud DB (Supabase)
 */
export async function deleteCloudOrder(orderId) {
  if (!orderId) return false;

  let success = false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (!error) {
        success = true;
      }
    } catch (err) {
      console.warn('[Supabase Delete Order Error]:', err.message);
    }
  }

  // Update local storage
  try {
    const saved = localStorage.getItem('gitsole_orders');
    if (saved) {
      const existing = JSON.parse(saved);
      const updated = existing.filter(o => o.id !== orderId);
      localStorage.setItem('gitsole_orders', JSON.stringify(updated));
    }
  } catch (_) {}

  return success;
}
