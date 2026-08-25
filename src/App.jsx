import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import ConditionGuide from './pages/ConditionGuide';
import About from './pages/About';
import Contact from './pages/Contact';
import ReturnsGuarantee from './pages/ReturnsGuarantee';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import SmoothScroll, { useLenis } from './components/SmoothScroll';
import ScrollToTopButton from './components/ScrollToTopButton';

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  React.useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

function Layout({ children }) {
  const location = useLocation();
  const isBarePage = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isBarePage && <Header />}
      <main style={{ flex: 1 }}>{children}</main>
      {!isBarePage && <Footer />}
      <ScrollToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <OrderProvider>
        <CartProvider>
          <AdminAuthProvider>
            <SmoothScroll>
              <BrowserRouter>
                <ScrollToTop />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/product/:code" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order/:id" element={<OrderConfirmation />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/condition-guide" element={<ConditionGuide />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/returns" element={<ReturnsGuarantee />} />
                    <Route path="/returns-guarantee" element={<ReturnsGuarantee />} />
                    <Route path="/guarantee" element={<ReturnsGuarantee />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/faqs" element={<FAQ />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </SmoothScroll>
          </AdminAuthProvider>
        </CartProvider>
      </OrderProvider>
    </ProductProvider>
  );
}
