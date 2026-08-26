import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCloudOrders, saveCloudOrder, updateCloudOrderFields, deleteCloudOrder } from '../services/cloudDb';

const OrderContext = createContext();

const INITIAL_ORDERS = [
  {
    id: "GS-89102",
    date: "2026-08-22T14:30:00Z",
    customer: {
      name: "Hamza Tariq",
      whatsapp: "0301 2345678",
      address: "House 42, Street 8, Phase 5 DHA, near Lalik Jan Chowk",
      city: "Lahore",
      province: "Punjab"
    },
    paymentMethod: "cod",
    items: [
      {
        code: "GS-0428",
        brand: "Nike",
        model: "Air Max 90 'Infrared'",
        sizeUK: "9",
        score: 9.0,
        tier: "Excellent",
        price: 8900,
        photo: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80"
      }
    ],
    subtotal: 8900,
    delivery: 0,
    codFee: 0,
    total: 8900,
    courier: "Trax Logistics / TCS",
    trackingNumber: "TRX-994821-PK",
    status: "dispatched",
    timeline: [
      { step: "Order Placed", time: "Aug 22, 02:30 PM", done: true, desc: "Order details received via Gitsole storefront." },
      { step: "Confirmed on WhatsApp", time: "Aug 22, 03:15 PM", done: true, desc: "Address and size confirmed with customer on WhatsApp." },
      { step: "Prepared & Inspected", time: "Aug 22, 05:00 PM", done: true, desc: "Pair cleaned, re-inspected, and packaged." },
      { step: "Dispatched with Courier", time: "Aug 23, 11:30 AM", done: true, desc: "Parcel handed over to courier for nationwide dispatch." },
      { step: "Out for Delivery", time: "Estimated Aug 24", done: false, desc: "Rider will deliver to your doorstep. Keep exact cash ready." }
    ]
  }
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('gitsole_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const [sizeAlerts, setSizeAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('gitsole_size_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gitsole_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('gitsole_size_alerts', JSON.stringify(sizeAlerts));
    } catch (e) {
      console.error(e);
    }
  }, [sizeAlerts]);

  // Sync with Cloud DB function
  const syncWithCloud = useCallback(async () => {
    const cloudOrders = await fetchCloudOrders();
    if (cloudOrders && Array.isArray(cloudOrders)) {
      setIsCloudConnected(true);
      setLastSyncedAt(new Date());

      if (cloudOrders.length === 0) {
        // Seed initial orders to cloud DB if cloud DB is brand new
        for (const o of INITIAL_ORDERS) {
          await saveCloudOrder(o);
        }
        setOrders(INITIAL_ORDERS);
      } else {
        // Merge cloud orders with local state
        setOrders(prev => {
          const map = new Map();
          // First add existing local orders
          prev.forEach(o => map.set(o.id, o));
          // Cloud orders override / add new items
          cloudOrders.forEach(o => map.set(o.id, o));
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          return merged;
        });
      }
    } else {
      setIsCloudConnected(false);
    }
  }, []);

  // Initial cloud fetch and 5-second polling loop for real-time live sync
  useEffect(() => {
    syncWithCloud();
    const interval = setInterval(syncWithCloud, 5000);
    return () => clearInterval(interval);
  }, [syncWithCloud]);

  const placeOrder = (orderData) => {
    const orderId = `GS-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRX-${Math.floor(100000 + Math.random() * 900000)}-PK`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      items: orderData.items,
      subtotal: orderData.subtotal,
      delivery: 0,
      codFee: 0,
      total: orderData.paymentMethod === 'bank_transfer' ? Math.round(orderData.subtotal * 0.97) : orderData.subtotal,
      courier: "Trax / TCS Express",
      trackingNumber: trackingCode,
      status: "placed",
      timeline: [
        { step: "Order Placed", time: "Just now", done: true, desc: "Order details received. Stock reserved for your pair." },
        { step: "Confirm on WhatsApp", time: "Within 30 mins", done: false, desc: "Our team will message your WhatsApp number to verify address." },
        { step: "Prepared & Inspected", time: "Next", done: false, desc: "Shoes will be re-inspected, sanitized, and packaged." },
        { step: "Dispatched & Delivered", time: "2–4 Business Days", done: false, desc: "Free home delivery across Pakistan." }
      ]
    };

    // 1. Instant local update
    setOrders(prev => [newOrder, ...prev]);

    // 2. Real-time push to Cloud Database
    saveCloudOrder(newOrder).then(() => {
      setLastSyncedAt(new Date());
    });

    return newOrder;
  };

  const getOrderById = (id) => {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    return orders.find(o => o.id.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId) || null;
  };

  const registerSizeAlert = (alert) => {
    setSizeAlerts(prev => [...prev, { ...alert, date: new Date().toISOString() }]);
    return true;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    let updatedOrderObj = null;

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const statusLabels = {
        placed: 'Order Placed',
        advance_paid: 'Advance Received (PKR 300)',
        confirmed: 'Confirmed on WhatsApp',
        preparing: 'Prepared & Inspected',
        shipped: 'Dispatched with Courier',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      };

      const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      // Update timeline
      const updatedTimeline = order.timeline.map(t => ({ ...t, done: true }));
      
      // Add new step if not already there
      const stepExists = updatedTimeline.some(t => t.step === statusLabels[newStatus]);
      if (!stepExists) {
        updatedTimeline.push({
          step: statusLabels[newStatus],
          time: now,
          done: true,
          desc: `Status updated to "${statusLabels[newStatus]}".`
        });
      }

      updatedOrderObj = {
        ...order,
        status: newStatus,
        timeline: updatedTimeline
      };

      return updatedOrderObj;
    }));

    // Update Cloud DB
    if (updatedOrderObj) {
      updateCloudOrderFields(orderId, {
        status: updatedOrderObj.status,
        timeline: updatedOrderObj.timeline
      });
    }
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    deleteCloudOrder(orderId);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      placeOrder,
      getOrderById,
      updateOrderStatus,
      deleteOrder,
      registerSizeAlert,
      sizeAlerts,
      isCloudConnected,
      lastSyncedAt,
      syncWithCloud
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
