// Real-time Cloud Database Service for GitSole Orders
// Powered by Supabase integration with serverless security protection

import { getAdminAuthHeaders } from '../context/AdminAuthContext.jsx';

/**
 * Format DB snake_case record to Frontend camelCase object
 */
export function formatDbOrderToApp(dbRecord) {
  if (!dbRecord) return null;
  return {
    id: String(dbRecord.id || '').trim().toUpperCase(),
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
    id: String(appOrder.id || '').trim().toUpperCase(),
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
 * Fetch a single order live from Supabase / API by ID or Tracking Code (Public/Customer Access)
 */
export async function fetchSingleCloudOrder(idOrTracking) {
  if (!idOrTracking) return null;
  const cleanId = String(idOrTracking).trim().toUpperCase();

  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.order) {
        return json.order;
      }
    }
  } catch (err) {
    console.warn(`[Orders API] Fetch single order error for ${cleanId}:`, err.message);
  }

  return null;
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
    console.warn('[Orders API] Fetch all orders notice:', apiErr.message);
  }

  return null;
}

/**
 * Save or insert a single order into Cloud DB (Customer Checkout)
 */
export async function saveCloudOrder(newOrder) {
  if (!newOrder || !newOrder.id) return { success: false, error: 'Invalid order payload' };

  const dbRecord = formatAppOrderToDb(newOrder);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbRecord)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, order: json.order || newOrder };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    console.warn('[Orders API] Save notice:', apiErr.message);
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to create order' };
}

/**
 * Update partial fields of an order in Cloud DB (Admin Only via Authenticated /api/orders)
 */
export async function updateCloudOrderFields(orderId, fields) {
  if (!orderId) return { success: false, error: 'Order ID is required' };

  const cleanId = String(orderId).trim().toUpperCase();
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ id: cleanId, ...fields })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, order: json.order };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    console.warn(`[Orders API] Update error for ${cleanId}:`, apiErr.message);
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to update order' };
}

/**
 * Delete an order from Cloud DB (Admin Only via Authenticated /api/orders)
 */
export async function deleteCloudOrder(orderId) {
  if (!orderId) return { success: false, error: 'Order ID is required' };

  const cleanId = String(orderId).trim().toUpperCase();
  const authHeaders = getAdminAuthHeaders();

  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders
      }
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true };
    } else if (json.error) {
      return { success: false, error: json.error };
    }
  } catch (apiErr) {
    console.warn(`[Orders API] Delete error for ${cleanId}:`, apiErr.message);
    return { success: false, error: apiErr.message };
  }

  return { success: false, error: 'Failed to delete order' };
}
