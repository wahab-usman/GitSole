import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const [sizeAlerts, setSizeAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('gitsole_size_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

    setOrders(prev => [newOrder, ...prev]);
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

  return (
    <OrderContext.Provider value={{
      orders,
      placeOrder,
      getOrderById,
      registerSizeAlert,
      sizeAlerts
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
