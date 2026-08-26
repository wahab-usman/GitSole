import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCloudOrders, saveCloudOrder, updateCloudOrderFields, deleteCloudOrder } from '../services/cloudDb';

const OrderContext = createContext();

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
      const saved = localStorage.getItem('gitsole_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_ORDERS.length) {
          return parsed;
        }
      }
      return INITIAL_ORDERS;
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

      setOrders(prev => {
        const map = new Map();
        // Add default initial orders
        INITIAL_ORDERS.forEach(o => map.set(o.id, o));
        // Add existing local orders
        prev.forEach(o => map.set(o.id, o));
        // Add cloud orders
        cloudOrders.forEach(o => map.set(o.id, o));
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        return merged;
      });
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
      paymentMethod: orderData.paymentMethod || 'cod',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      delivery: 0,
      codFee: 0,
      total: orderData.paymentMethod === 'bank_transfer' ? Math.round((orderData.subtotal || 0) * 0.97) : (orderData.subtotal || 0),
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

    // 2. Push to Cloud Database
    saveCloudOrder(newOrder).then(() => {
      setLastSyncedAt(new Date());
    });

    return newOrder;
  };

  const addManualOrder = (manualOrder) => {
    const orderId = manualOrder.id || `GS-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRX-${Math.floor(100000 + Math.random() * 900000)}-PK`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
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
      timeline: [
        { step: "Order Placed", time: "Just now", done: true, desc: "Manually logged via Admin Panel." },
        { step: "Confirm on WhatsApp", time: "Within 30 mins", done: true, desc: "Address confirmed on WhatsApp." }
      ]
    };

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== orderId)]);
    saveCloudOrder(newOrder);
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
      addManualOrder,
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
