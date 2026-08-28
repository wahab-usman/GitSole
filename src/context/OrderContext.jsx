import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCloudOrders, fetchSingleCloudOrder, saveCloudOrder, updateCloudOrderFields, deleteCloudOrder } from '../services/cloudDb';

const OrderContext = createContext();

const STORAGE_ORDERS_KEY = 'gitsole_orders_cache_v2';

/**
 * Accurate stage-by-stage order timeline progression helper
 */
export function buildTimelineForStatus(status, orderDate, isCOD = true) {
  const dateFormatted = orderDate
    ? new Date(orderDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recently';
  const nowFormatted = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Map each status to an integer stage rank
  // 0: placed, 1: advance_paid, 2: confirmed, 3: preparing, 4: shipped, 5: delivered
  const ranks = {
    placed: 0,
    advance_paid: 1,
    confirmed: 2,
    preparing: 3,
    shipped: 4,
    delivered: 5,
    cancelled: -1
  };

  const currentRank = ranks[status] ?? 0;

  if (status === 'cancelled') {
    return [
      { step: "Order Placed", time: dateFormatted, done: true, desc: "Order details received." },
      { step: "Order Cancelled", time: nowFormatted, done: true, desc: "This order was cancelled." }
    ];
  }

  const steps = [
    {
      rank: 0,
      step: "Order Placed",
      time: dateFormatted,
      done: true,
      desc: "Order details received via Gitsole storefront. 1-of-1 pair reserved."
    },
    {
      rank: 1,
      step: isCOD ? "Advance Received (PKR 300)" : "Payment Verification",
      time: currentRank >= 1 ? (currentRank === 1 ? nowFormatted : "Received") : "Within 30 mins",
      done: currentRank >= 1,
      desc: isCOD
        ? (currentRank >= 1 ? "PKR 300 advance received via JazzCash/EasyPaisa/Bank." : "Send PKR 300 advance to confirm order verification.")
        : (currentRank >= 1 ? "Full payment received and verified." : "Awaiting payment verification on WhatsApp.")
    },
    {
      rank: 2,
      step: "Order Confirmed",
      time: currentRank >= 2 ? (currentRank === 2 ? nowFormatted : "Confirmed") : (currentRank >= 1 ? "In progress" : "Next"),
      done: currentRank >= 2,
      desc: currentRank >= 2
        ? "Order verified with customer on WhatsApp and confirmed."
        : "Our team will message your WhatsApp number to verify address."
    },
    {
      rank: 3,
      step: "Sanitized & Preparing",
      time: currentRank >= 3 ? (currentRank === 3 ? nowFormatted : "Ready") : (currentRank >= 2 ? "In progress" : "Next"),
      done: currentRank >= 3,
      desc: currentRank >= 3
        ? "Pair cleaned, re-inspected against condition scores, sanitized and packed."
        : "Shoes will be re-inspected, sanitized, and packaged."
    },
    {
      rank: 4,
      step: "Dispatched & On The Way",
      time: currentRank >= 4 ? (currentRank === 4 ? nowFormatted : "In transit") : (currentRank >= 3 ? "1–2 Business Days" : "2–3 Business Days"),
      done: currentRank >= 4,
      desc: currentRank >= 4
        ? "Parcel handed over to Trax / TCS Express for nationwide dispatch."
        : "Handover to express courier with SMS tracking."
    },
    {
      rank: 5,
      step: "Delivered to Doorstep",
      time: currentRank >= 5 ? nowFormatted : (currentRank >= 4 ? "Estimated 24–48 hrs" : "2–4 Business Days"),
      done: currentRank >= 5,
      desc: currentRank >= 5
        ? "Delivered to customer doorstep."
        : isCOD
          ? "Rider delivers to doorstep. Keep remaining cash ready."
          : "Rider delivers parcel to your door."
    }
  ];

  return steps.map(({ rank, ...rest }) => rest);
}

const INITIAL_ORDERS = [
  {
    id: "GS-12060",
    date: "2026-08-26T10:51:00Z",
    customer: {
      name: "Safia Younas",
      whatsapp: "03211448224",
      address: "50 elahi bux park amir road shadbagh lahore, Near Shadbagh, Lahore, Punjab",
      city: "Lahore",
      province: "Punjab"
    },
    paymentMethod: "cod",
    items: [
      {
        code: "GS-0442",
        brand: "Jordan",
        model: "Air Jordan 1 Retro High 'Shadow 2.0'",
        sizeUK: "9.5",
        score: 8.0,
        tier: "Great",
        price: 11200,
        photo: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
      }
    ],
    subtotal: 11200,
    delivery: 0,
    codFee: 0,
    total: 11200,
    courier: "Trax / TCS Express",
    trackingNumber: "TRX-120600-PK",
    status: "placed",
    timeline: [
      { step: "Order Placed", time: "Aug 26, 10:51 AM", done: true, desc: "Order details received via Gitsole storefront." },
      { step: "Confirm on WhatsApp", time: "Within 30 mins", done: false, desc: "Our team will message your WhatsApp number to verify address." }
    ]
  },
  {
    id: "GS-32307",
    date: "2026-08-26T10:49:00Z",
    customer: {
      name: "Safia Younas",
      whatsapp: "03211448224",
      address: "50 elahi bux park amir road shadbagh lahore, Near Shadbagh, Lahore, Punjab",
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
    courier: "Trax / TCS Express",
    trackingNumber: "TRX-323070-PK",
    status: "placed",
    timeline: [
      { step: "Order Placed", time: "Aug 26, 10:49 AM", done: true, desc: "Order details received via Gitsole storefront." },
      { step: "Confirm on WhatsApp", time: "Within 30 mins", done: false, desc: "Our team will message your WhatsApp number to verify address." }
    ]
  },
  {
    id: "GS-21283",
    date: "2026-08-26T10:44:00Z",
    customer: {
      name: "Usman",
      whatsapp: "03211123474",
      address: "Amir road, Near Shadbagh, Lahore, Punjab",
      city: "Lahore",
      province: "Punjab"
    },
    paymentMethod: "cod",
    items: [
      {
        code: "GS-0431",
        brand: "Timberland",
        model: "Premium 6-Inch Waterproof Boot",
        sizeUK: "8",
        score: 7.0,
        tier: "Good",
        price: 6800,
        photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
      }
    ],
    subtotal: 6800,
    delivery: 0,
    codFee: 0,
    total: 6800,
    courier: "Trax / TCS Express",
    trackingNumber: "TRX-212830-PK",
    status: "placed",
    timeline: [
      { step: "Order Placed", time: "Aug 26, 10:44 AM", done: true, desc: "Order details received via Gitsole storefront." },
      { step: "Confirm on WhatsApp", time: "Within 30 mins", done: false, desc: "Our team will message your WhatsApp number to verify address." }
    ]
  },
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
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_ORDERS;
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

  // Sync state to local storage cache for fast rendering
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('gitsole_size_alerts', JSON.stringify(sizeAlerts));
    } catch (e) {}
  }, [sizeAlerts]);

  // Sync with Cloud DB (Admin will fetch all orders; customers will skip)
  const syncWithCloud = useCallback(async () => {
    const cloudOrders = await fetchCloudOrders();
    if (cloudOrders && Array.isArray(cloudOrders)) {
      setIsCloudConnected(true);
      setLastSyncedAt(new Date());

      setOrders(prev => {
        const map = new Map();
        // Base initial orders
        INITIAL_ORDERS.forEach(o => map.set(o.id.toUpperCase(), o));
        // Previous local orders
        prev.forEach(o => map.set(o.id.toUpperCase(), o));
        // Server authoritative orders
        cloudOrders.forEach(o => map.set(o.id.toUpperCase(), o));
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        return merged;
      });
    }
  }, []);

  // Periodic admin sync loop
  useEffect(() => {
    syncWithCloud();
    const interval = setInterval(syncWithCloud, 6000);
    return () => clearInterval(interval);
  }, [syncWithCloud]);

  /**
   * Place an order from Customer Checkout
   */
  const placeOrder = async (orderData) => {
    const orderId = `GS-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRX-${Math.floor(100000 + Math.random() * 900000)}-PK`;

    const orderDate = new Date().toISOString();
    const isCOD = orderData.paymentMethod !== 'bank_transfer';
    const initialTimeline = buildTimelineForStatus('placed', orderDate, isCOD);

    const newOrder = {
      id: orderId,
      date: orderDate,
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod || 'cod',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      delivery: 0,
      codFee: 0,
      total: orderData.paymentMethod === 'bank_transfer' ? Math.round((orderData.subtotal || 0) * 0.97) : (orderData.subtotal || 0),
      courier: "Trax / TCS Express",
      trackingNumber: trackingCode,
      status: "placed",
      timeline: initialTimeline
    };

    // 1. Optimistic local update
    setOrders(prev => [newOrder, ...prev.filter(o => o.id.toUpperCase() !== orderId.toUpperCase())]);

    // 2. Save directly to Supabase via serverless API
    try {
      const res = await saveCloudOrder(newOrder);
      if (res && res.success) {
        setLastSyncedAt(new Date());
        setIsCloudConnected(true);
      }
    } catch (err) {
      console.warn('[OrderContext] Save order error:', err.message);
    }

    return newOrder;
  };

  /**
   * Admin: Log Order Manually
   */
  const addManualOrder = async (manualOrder) => {
    const orderId = manualOrder.id || `GS-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRX-${Math.floor(100000 + Math.random() * 900000)}-PK`;

    const orderDate = new Date().toISOString();
    const isCOD = manualOrder.paymentMethod !== 'bank_transfer';
    const initialTimeline = buildTimelineForStatus('placed', orderDate, isCOD);

    const newOrder = {
      id: orderId,
      date: orderDate,
      customer: {
        name: manualOrder.customerName || 'Customer',
        whatsapp: manualOrder.whatsapp || '',
        address: manualOrder.address || 'Lahore, Pakistan',
        city: manualOrder.city || 'Lahore',
        province: manualOrder.province || 'Punjab'
      },
      paymentMethod: manualOrder.paymentMethod || 'cod',
      items: manualOrder.items || [
        {
          code: manualOrder.itemCode || 'GS-CUSTOM',
          brand: manualOrder.brand || 'Thrift Pair',
          model: manualOrder.model || 'Footwear Pair',
          sizeUK: manualOrder.sizeUK || '9',
          score: 8.5,
          tier: 'Great',
          price: Number(manualOrder.price) || 8500,
          photo: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80'
        }
      ],
      subtotal: Number(manualOrder.price) || 8500,
      delivery: 0,
      codFee: 0,
      total: Number(manualOrder.price) || 8500,
      courier: "Trax / TCS Express",
      trackingNumber: trackingCode,
      status: "placed",
      timeline: initialTimeline
    };

    setOrders(prev => [newOrder, ...prev.filter(o => o.id.toUpperCase() !== orderId.toUpperCase())]);
    await saveCloudOrder(newOrder);
    return newOrder;
  };

  /**
   * Fetch real-time live order from Supabase by ID or Tracking Code
   */
  const fetchLiveOrder = useCallback(async (idOrTracking) => {
    if (!idOrTracking) return null;
    const cleanId = String(idOrTracking).trim().toUpperCase();

    // Query live from serverless Supabase API
    const liveOrder = await fetchSingleCloudOrder(cleanId);
    if (liveOrder) {
      setOrders(prev => {
        const index = prev.findIndex(o => o.id.toUpperCase() === liveOrder.id.toUpperCase() || o.trackingNumber.toUpperCase() === liveOrder.trackingNumber.toUpperCase());
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = liveOrder;
          return updated;
        } else {
          return [liveOrder, ...prev];
        }
      });
      return liveOrder;
    }

    // Fallback to local memory
    return orders.find(o => o.id.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId) || null;
  }, [orders]);

  /**
   * Synchronous get order by ID (Memory lookup)
   */
  const getOrderById = (id) => {
    if (!id) return null;
    const cleanId = String(id).trim().toUpperCase();
    return orders.find(o => o.id.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId) || null;
  };

  const registerSizeAlert = (alert) => {
    setSizeAlerts(prev => [...prev, { ...alert, date: new Date().toISOString() }]);
    return true;
  };

  /**
   * Admin: Update order status (Persists directly to Supabase)
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) return;
    const cleanId = String(orderId).trim().toUpperCase();

    const existingOrder = orders.find(o => o.id.toUpperCase() === cleanId);
    const isCOD = existingOrder?.paymentMethod !== 'bank_transfer';
    const updatedTimeline = buildTimelineForStatus(newStatus, existingOrder?.date, isCOD);

    // 1. Optimistic local update
    setOrders(prev => prev.map(order => {
      if (order.id.toUpperCase() === cleanId) {
        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline
        };
      }
      return order;
    }));

    // 2. Persist to Supabase Cloud Database via Authenticated API
    try {
      const res = await updateCloudOrderFields(cleanId, {
        status: newStatus,
        timeline: updatedTimeline
      });
      if (res && res.success) {
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('[OrderContext] Update status error:', err);
    }
  };

  /**
   * Admin: Delete order
   */
  const deleteOrder = async (orderId) => {
    if (!orderId) return;
    const cleanId = String(orderId).trim().toUpperCase();

    setOrders(prev => prev.filter(order => order.id.toUpperCase() !== cleanId));
    await deleteCloudOrder(cleanId);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      placeOrder,
      addManualOrder,
      getOrderById,
      fetchLiveOrder,
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
