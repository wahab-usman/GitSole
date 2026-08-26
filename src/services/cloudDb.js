// Real-time Cloud Database Service for Gitsole
// Powered by restful-api cloud REST container for instant multi-device sync

const CLOUD_CONTAINER_ID = 'ff8081819ff5b11001a03ca2ee9c2319';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_CONTAINER_ID}`;

/**
 * Fetch all orders from Cloud DB
 */
export async function fetchCloudOrders() {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (!res.ok) throw new Error(`Cloud DB HTTP error ${res.status}`);
    const json = await res.json();
    if (!json || !json.data || !Array.isArray(json.data.orders)) return [];
    
    const orders = [...json.data.orders];
    orders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return orders;
  } catch (err) {
    console.warn('[Cloud DB] Could not fetch cloud orders:', err.message);
    return null;
  }
}

/**
 * Replace entire orders container in Cloud DB
 */
export async function saveAllCloudOrders(ordersArray) {
  if (!Array.isArray(ordersArray)) return false;
  try {
    const res = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'gitsole_master_orders_store_v1',
        data: {
          orders: ordersArray,
          lastUpdated: new Date().toISOString()
        }
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Cloud DB] Failed to sync orders array:', err.message);
    return false;
  }
}

/**
 * Save or insert a single order into Cloud DB
 */
export async function saveCloudOrder(newOrder) {
  if (!newOrder || !newOrder.id) return false;
  try {
    const currentOrders = await fetchCloudOrders();
    const existing = Array.isArray(currentOrders) ? currentOrders : [];
    
    // Check if order already exists
    const index = existing.findIndex(o => o.id === newOrder.id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = newOrder;
    } else {
      updated = [newOrder, ...existing];
    }
    
    return await saveAllCloudOrders(updated);
  } catch (err) {
    console.warn(`[Cloud DB] Failed to save order ${newOrder.id}:`, err.message);
    return false;
  }
}

/**
 * Update partial fields of an order in Cloud DB
 */
export async function updateCloudOrderFields(orderId, fields) {
  if (!orderId) return false;
  try {
    const currentOrders = await fetchCloudOrders();
    if (!Array.isArray(currentOrders)) return false;

    const updated = currentOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, ...fields };
      }
      return order;
    });

    return await saveAllCloudOrders(updated);
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
    const currentOrders = await fetchCloudOrders();
    if (!Array.isArray(currentOrders)) return false;

    const filtered = currentOrders.filter(o => o.id !== orderId);
    return await saveAllCloudOrders(filtered);
  } catch (err) {
    console.warn(`[Cloud DB] Failed to delete order ${orderId}:`, err.message);
    return false;
  }
}
