// Real-time Cloud Database Service for Gitsole
// Uses Firebase Realtime DB REST API with zero-config instant cloud synchronization

const CLOUD_DB_BASE_URL = 'https://gitsole-storefront-default-rtdb.firebaseio.com';

/**
 * Fetch all orders from Cloud DB
 */
export async function fetchCloudOrders() {
  try {
    const res = await fetch(`${CLOUD_DB_BASE_URL}/orders.json`);
    if (!res.ok) throw new Error(`Cloud DB HTTP error ${res.status}`);
    const data = await res.json();
    if (!data) return null;
    
    // Data can be an object with keys as order IDs
    const ordersArray = Object.values(data).filter(Boolean);
    // Sort newest first
    ordersArray.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return ordersArray;
  } catch (err) {
    console.warn('[Cloud DB] Could not fetch cloud orders:', err.message);
    return null;
  }
}

/**
 * Push or update a single order in Cloud DB
 */
export async function saveCloudOrder(order) {
  if (!order || !order.id) return false;
  try {
    const res = await fetch(`${CLOUD_DB_BASE_URL}/orders/${order.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Cloud DB] Failed to save order ${order.id}:`, err.message);
    return false;
  }
}

/**
 * Update partial fields (e.g. status, timeline) of an order in Cloud DB
 */
export async function updateCloudOrderFields(orderId, fields) {
  if (!orderId) return false;
  try {
    const res = await fetch(`${CLOUD_DB_BASE_URL}/orders/${orderId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Cloud DB] Failed to update order ${orderId}:`, err.message);
    return false;
  }
}

/**
 * Delete an order from Cloud DB
 */
export async function deleteCloudOrder(orderId) {
  if (!orderId) return false;
  try {
    const res = await fetch(`${CLOUD_DB_BASE_URL}/orders/${orderId}.json`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Cloud DB] Failed to delete order ${orderId}:`, err.message);
    return false;
  }
}
