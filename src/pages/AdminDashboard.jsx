import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useOrder } from '../context/OrderContext';
import ProductFormModal from '../components/ProductFormModal';
import { formatPrice, BRANDS, buildWhatsAppUrl } from '../data/products';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  LogOut,
  ShoppingBag,
  Tag,
  DollarSign,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Key,
  X,
  Lock,
  User,
  ClipboardList,
  Truck,
  Package,
  MessageSquare,
  Ban,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, toggleSoldStatus, resetToDefault } = useProducts();
  const { isAdminLoggedIn, logout, credentials, updateCredentials } = useAdminAuth();
  const { orders, updateOrderStatus, deleteOrder, isCloudConnected, lastSyncedAt, syncWithCloud } = useOrder();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credsMsg, setCredsMsg] = useState('');

  const handleOpenCredsModal = () => {
    setNewUsername(credentials.username);
    setNewPassword(credentials.password);
    setCredsMsg('');
    setIsCredsModalOpen(true);
  };

  const handleSaveCreds = (e) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      updateCredentials(newUsername, newPassword);
      setCredsMsg('Login credentials updated successfully!');
      setTimeout(() => {
        setIsCredsModalOpen(false);
      }, 1200);
    }
  };

  // Redirect to login if unauthenticated
  React.useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/gitsole-owner-panel/login');
    }
  }, [isAdminLoggedIn, navigate]);

  if (!isAdminLoggedIn) return null;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  // Calculate metrics
  const totalListings = products.length;
  const availableCount = products.filter((p) => p.status === 'available').length;
  const soldCount = products.filter((p) => p.status === 'sold').length;
  const totalAvailableValue = products
    .filter((p) => p.status === 'available')
    .reduce((sum, p) => sum + (p.price || 0), 0);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (productPayload) => {
    if (editingProduct) {
      updateProduct(editingProduct.code, productPayload);
    } else {
      addProduct(productPayload);
    }
  };

  const handleDelete = (code, model) => {
    if (window.confirm(`Are you sure you want to delete listing "${code} - ${model}"?`)) {
      deleteProduct(code);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all inventory data back to the default sample dataset?')) {
      resetToDefault();
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-paper)', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Admin Control Bar Header */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '20px clamp(16px, 4vw, 40px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                backgroundColor: 'var(--color-oxblood)',
                color: '#FFF',
                padding: '3px 8px',
                fontWeight: 700
              }}>
                ADMIN DASHBOARD
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: isCloudConnected ? '#81C784' : '#E57373',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '3px 10px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isCloudConnected ? '#66BB6A' : '#EF5350',
                  display: 'inline-block'
                }} />
                {isCloudConnected ? 'LIVE CLOUD SYNC ACTIVE' : 'OFFLINE MODE'}
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(22px, 3vw, 32px)',
              letterSpacing: '-0.03em',
              marginTop: '4px'
            }}>
              Inventory & Store Control
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleManualSync}
              title="Pull latest orders live from Cloud DB"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-on-ink-line)',
                color: 'var(--color-paper)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <RotateCcw size={14} /> Refresh Sync
            </button>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                border: '1px solid var(--color-on-ink-line)',
                color: 'var(--color-paper)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              View Live Store <ExternalLink size={14} />
            </Link>

            <button
              onClick={handleOpenAddModal}
              className="btn btn-oxblood"
              style={{ padding: '9px 18px', minHeight: '40px', fontSize: '13.5px' }}
            >
              <Plus size={16} /> Add New Shoe
            </button>

            <button
              onClick={handleOpenCredsModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-on-ink-line)',
                color: 'var(--color-paper)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Key size={15} /> Change ID / Password
            </button>

            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-on-ink-line)',
                color: 'var(--color-paper)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px clamp(16px, 4vw, 40px)' }}>
        
        {/* Metric Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Listings</span>
              <ShoppingBag size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', color: 'var(--color-ink)', marginTop: '8px' }}>
              {totalListings}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Total pairs cataloged</div>
          </div>

          <div style={{ border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-oxblood)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Stock</span>
              <CheckCircle size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', color: 'var(--color-ink)', marginTop: '8px' }}>
              {availableCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Live single-piece stock</div>
          </div>

          <div style={{ border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sold Items</span>
              <XCircle size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', color: 'var(--color-ink)', marginTop: '8px' }}>
              {soldCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Completed transactions</div>
          </div>

          <div style={{ border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Stock Value</span>
              <Tag size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--color-ink)', marginTop: '8px' }}>
              {formatPrice(totalAvailableValue)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Sum of listed available items</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          borderBottom: '2px solid var(--color-line)'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              border: 'none',
              borderBottom: activeTab === 'products' ? '3px solid var(--color-oxblood)' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'products' ? 'var(--color-ink)' : 'var(--color-muted)',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag size={15} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid var(--color-oxblood)' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'orders' ? 'var(--color-ink)' : 'var(--color-muted)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <ClipboardList size={15} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Orders ({orders.length})
            {orders.filter(o => o.status === 'placed').length > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-oxblood)',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {orders.filter(o => o.status === 'placed').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
          {/* Filter and Search Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-line-strong)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--color-line-strong)',
            padding: '8px 12px',
            flex: '1 1 260px'
          }}>
            <Search size={16} color="var(--color-muted)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code (GS-0428), model, or brand..."
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--color-muted)" />
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>BRAND:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', fontSize: '13px' }}
              >
                <option value="ALL">All Brands</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>STATUS:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', fontSize: '13px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="sold">Sold Only</option>
              </select>
            </div>

            <button
              onClick={handleResetData}
              title="Reset inventory to default sample data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                border: '1px solid var(--color-line-strong)',
                backgroundColor: 'var(--color-paper)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <RotateCcw size={13} /> Reset Demo Data
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-line-strong)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '14px 16px' }}>Stock Code</th>
                <th style={{ padding: '14px 16px' }}>Shoe Details</th>
                <th style={{ padding: '14px 16px' }}>Size</th>
                <th style={{ padding: '14px 16px' }}>Condition Score</th>
                <th style={{ padding: '14px 16px' }}>Selling Price</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No shoe listings found matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSold = product.status === 'sold';
                  const mainPhoto = product.photos?.[0] || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

                  return (
                    <tr
                      key={product.code}
                      style={{
                        borderBottom: '1px solid var(--color-line)',
                        backgroundColor: isSold ? '#FAF9F6' : '#FFFFFF',
                        opacity: isSold ? 0.8 : 1
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>
                        {product.code}
                        {product.featured && (
                          <div style={{ fontSize: '9.5px', color: 'var(--color-oxblood)', textTransform: 'uppercase', marginTop: '2px' }}>
                            ★ Homepage
                          </div>
                        )}
                      </td>

                      {/* Photo & Model */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={mainPhoto}
                            alt={product.model}
                            style={{
                              width: '52px',
                              height: '52px',
                              objectFit: 'cover',
                              border: '1px solid var(--color-line-strong)'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                              {product.brand}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
                              <Link to={`/product/${product.code}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                {product.model}
                              </Link>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                              {product.colourway}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Size */}
                      <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: 600 }}>
                        UK {product.sizeUK}
                        <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontWeight: 400 }}>
                          US {product.sizeUS} · {product.insoleCm}cm
                        </div>
                      </td>

                      {/* Condition */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-paper)',
                          padding: '3px 8px',
                          border: '1px solid var(--color-line-strong)'
                        }}>
                          {product.score}/10
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px' }}>
                          {product.tier}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>
                        {formatPrice(product.price)}
                        {product.retailPrice > product.price && (
                          <div style={{ fontSize: '11px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                            {formatPrice(product.retailPrice)}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => toggleSoldStatus(product.code)}
                          title="Click to toggle status"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: isSold ? '#EBE8E1' : 'var(--color-oxblood)',
                            color: isSold ? 'var(--color-body)' : '#FFFFFF'
                          }}
                        >
                          {isSold ? 'SOLD OUT' : 'AVAILABLE'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            title="Edit Listing"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--color-line-strong)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product.code, product.model)}
                            title="Delete Listing"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'transparent',
                              border: '1px solid #FFD0D0',
                              color: 'var(--color-oxblood)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />

      {/* Change Credentials Modal */}
      {isCredsModalOpen && (
        <div
          onClick={() => setIsCredsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2050,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '420px',
              border: '2px solid var(--color-ink)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{
              backgroundColor: 'var(--color-ink)',
              color: 'var(--color-paper)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', backgroundColor: '#FFF', padding: '2px 6px', display: 'inline-block', fontWeight: 700, marginBottom: '4px' }}>
                  SECURITY SETTINGS
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}>
                  Change Admin Credentials
                </h3>
              </div>
              <button onClick={() => setIsCredsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCreds} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {credsMsg && (
                <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #4CAF50', color: '#2E7D32', padding: '10px 12px', fontSize: '13px', fontWeight: 600 }}>
                  {credsMsg}
                </div>
              )}

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  New Admin Username
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-line-strong)', padding: '0 10px' }}>
                  <User size={16} color="var(--color-muted)" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    style={{ width: '100%', padding: '10px 0', border: 'none', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  New Admin Password
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-line-strong)', padding: '0 10px' }}>
                  <Lock size={16} color="var(--color-muted)" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{ width: '100%', padding: '10px 0', border: 'none', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCredsModalOpen(false)} className="btn btn-outline" style={{ padding: '8px 16px', minHeight: '38px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', minHeight: '38px' }}>
                  Save New Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS TAB CONTENT */}
      {activeTab === 'orders' && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 60px' }}>
          {/* Order Status Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {[
              { val: 'ALL', label: 'All Orders', count: orders.length },
              { val: 'placed', label: 'New / Pending', count: orders.filter(o => o.status === 'placed').length },
              { val: 'advance_paid', label: 'Advance Paid', count: orders.filter(o => o.status === 'advance_paid').length },
              { val: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
              { val: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
              { val: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { val: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
            ].map(f => (
              <button
                key={f.val}
                onClick={() => setOrderStatusFilter(f.val)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  border: orderStatusFilter === f.val ? '2px solid var(--color-ink)' : '1px solid var(--color-line-strong)',
                  backgroundColor: orderStatusFilter === f.val ? 'var(--color-ink)' : '#FFF',
                  color: orderStatusFilter === f.val ? '#FFF' : 'var(--color-ink)',
                  cursor: 'pointer'
                }}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
              <ClipboardList size={48} strokeWidth={1} />
              <p style={{ marginTop: '12px', fontSize: '16px' }}>No orders yet. Orders from customers will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders
                .filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter)
                .map(order => {
                  const statusConfig = {
                    placed: { label: 'New Order', color: '#E65100', bg: '#FFF3E0', icon: <Clock size={14} /> },
                    advance_paid: { label: 'Advance Paid', color: '#1565C0', bg: '#E3F2FD', icon: <DollarSign size={14} /> },
                    confirmed: { label: 'Confirmed', color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircle size={14} /> },
                    preparing: { label: 'Preparing', color: '#6A1B9A', bg: '#F3E5F5', icon: <Package size={14} /> },
                    shipped: { label: 'Shipped', color: '#0277BD', bg: '#E1F5FE', icon: <Truck size={14} /> },
                    delivered: { label: 'Delivered', color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircle size={14} /> },
                    dispatched: { label: 'Dispatched', color: '#0277BD', bg: '#E1F5FE', icon: <Truck size={14} /> },
                    cancelled: { label: 'Cancelled', color: '#C62828', bg: '#FFEBEE', icon: <Ban size={14} /> }
                  };
                  const sc = statusConfig[order.status] || statusConfig.placed;

                  return (
                    <div key={order.id} style={{
                      backgroundColor: '#FFF',
                      border: '1px solid var(--color-line-strong)',
                      padding: '20px',
                    }}>
                      {/* Order Header */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px' }}>#{order.id}</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            backgroundColor: sc.bg,
                            color: sc.color,
                            letterSpacing: '0.05em'
                          }}>
                            {sc.icon} {sc.label}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-muted)' }}>
                          {new Date(order.date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Customer & Items */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="admin-order-grid">
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--color-body)' }}>
                          <div><strong>👤 Customer:</strong> {order.customer?.name}</div>
                          <div><strong>📱 WhatsApp:</strong> {order.customer?.whatsapp}</div>
                          <div><strong>📍 Address:</strong> {order.customer?.address}, {order.customer?.city}</div>
                          <div><strong>💳 Payment:</strong> {order.paymentMethod === 'cod' ? 'COD (PKR 300 Advance)' : 'Bank Transfer (Full Prepaid)'}</div>
                          <div><strong>📦 Tracking:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)' }}>{order.trackingNumber}</span></div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '8px', letterSpacing: '0.1em' }}>Items Ordered</div>
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              {item.photos?.[0] && <img src={item.photos[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', backgroundColor: 'var(--color-image-bg)' }} />}
                              {item.photo && !item.photos?.[0] && <img src={item.photo} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', backgroundColor: 'var(--color-image-bg)' }} />}
                              <div style={{ flex: 1, fontSize: '13px' }}>
                                <div style={{ fontWeight: 600 }}>{item.model}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>UK {item.sizeUK} · {item.score}/10</div>
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>{formatPrice(item.price)}</div>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
                            <span>Total</span>
                            <span style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--color-line)', paddingTop: '14px' }}>
                        {/* WhatsApp button */}
                        <a
                          href={buildWhatsAppUrl(`Hello ${order.customer?.name}! Regarding your Gitsole order #${order.id}:`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#25D366',
                            color: '#FFF',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                        >
                          <MessageSquare size={14} /> WhatsApp Customer
                        </a>

                        {/* Direct Status Selector Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                            Status:
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              border: '1.5px solid var(--color-ink)',
                              backgroundColor: sc.bg,
                              color: sc.color,
                              cursor: 'pointer',
                              borderRadius: '2px'
                            }}
                          >
                            <option value="placed">⏳ Order Placed (Pending Advance)</option>
                            <option value="advance_paid">💵 Advance Paid (PKR 300 Received)</option>
                            <option value="confirmed">✅ Order Confirmed</option>
                            <option value="preparing">📦 Sanitized & Preparing</option>
                            <option value="shipped">🚚 Dispatched & On The Way</option>
                            <option value="delivered">🎉 Delivered to Doorstep</option>
                            <option value="cancelled">❌ Cancelled Order</option>
                          </select>
                        </div>

                        {/* Delete Order Button */}
                        <button
                          onClick={() => { if (window.confirm(`Delete order #${order.id}?`)) deleteOrder(order.id); }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#FFEBEE',
                            color: '#C62828',
                            border: '1px solid #EF9A9A',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginLeft: 'auto'
                          }}
                        >
                          <Trash2 size={13} /> Delete Order
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-order-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
