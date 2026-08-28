// Real-time Cloud Database Service for GitSole Orders
// Powered by Supabase integration with serverless security protection

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getAdminAuthHeaders } from '../context/AdminAuthContext.jsx';

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
 * Fetch all orders from Cloud Database (Admin Only via Authenticated /api/orders)
 */
export async function fetchCloudOrders() {
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch('/api/orders', {
      headers: {
        ...authHeaders
      }
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.orders)) {
        return json.orders;
      }
    }
  } catch (apiErr) {
    console.warn('[Orders API] Fetch notice:', apiErr.message);
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
 * Save or insert a single order into Cloud DB (Customer Checkout)
 */
export async function saveCloudOrder(newOrder) {
  if (!newOrder || !newOrder.id) return false;

  let success = false;
  const dbRecord = formatAppOrderToDb(newOrder);

  // 1. Save via /api/orders POST
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbRecord)
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) {
        success = true;
      }
    }
  } catch (apiErr) {
    console.warn('[Orders API] Save notice:', apiErr.message);
  }

  // 2. Direct Supabase insert (allowed by RLS: Customer Insert Orders)
  if (!success && isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([dbRecord]);

      if (!error) success = true;
    } catch (err) {}
  }

  // Update local storage backup
  try {
    const saved = localStorage.getItem('gitsole_orders');
    const existing = saved ? JSON.parse(saved) : [];
    const index = existing.findIndex((o) => o.id === newOrder.id);
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
 * Update partial fields of an order in Cloud DB (Admin Only via Authenticated /api/orders)
 */
export async function updateCloudOrderFields(orderId, fields) {
  if (!orderId) return false;

  let success = false;
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ id: orderId, ...fields })
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) success = true;
    }
  } catch (apiErr) {
    console.warn('[Orders API] Update notice:', apiErr.message);
  }

  // Update local storage
  try {
    const saved = localStorage.getItem('gitsole_orders');
    if (saved) {
      const existing = JSON.parse(saved);
      const updated = existing.map((o) => (o.id === orderId ? { ...o, ...fields } : o));
      localStorage.setItem('gitsole_orders', JSON.stringify(updated));
    }
  } catch (_) {}

  return success;
}

/**
 * Delete an order from Cloud DB (Admin Only via Authenticated /api/orders)
 */
export async function deleteCloudOrder(orderId) {
  if (!orderId) return false;

  let success = false;
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders
      }
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) success = true;
    }
  } catch (apiErr) {
    console.warn('[Orders API] Delete notice:', apiErr.message);
  }

  // Update local storage
  try {
    const saved = localStorage.getItem('gitsole_orders');
    if (saved) {
      const existing = JSON.parse(saved);
      const updated = existing.filter((o) => o.id !== orderId);
      localStorage.setItem('gitsole_orders', JSON.stringify(updated));
    }
  } catch (_) {}

  return success;
}
