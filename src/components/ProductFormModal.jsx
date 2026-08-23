import React, { useState, useEffect } from 'react';
import { BRANDS, SIZES_UK, TIERS } from '../data/products';
import { X, Plus, Trash2, Image, AlertCircle } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    code: '',
    brand: 'Nike',
    model: '',
    colourway: '',
    sizeUK: '9',
    sizeUS: '10',
    insoleCm: 28.0,
    score: 9.0,
    tier: 'Excellent',
    price: 8500,
    retailPrice: 22000,
    boxIncluded: false,
    status: 'available',
    conditionNotes: '',
    photosText: '',
    flawPhoto: '',
    flawCaption: '',
    featured: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        brand: initialData.brand || 'Nike',
        model: initialData.model || '',
        colourway: initialData.colourway || '',
        sizeUK: String(initialData.sizeUK || '9'),
        sizeUS: String(initialData.sizeUS || '10'),
        insoleCm: Number(initialData.insoleCm || 28.0),
        score: Number(initialData.score || 9.0),
        tier: initialData.tier || 'Excellent',
        price: Number(initialData.price || 8500),
        retailPrice: Number(initialData.retailPrice || 22000),
        boxIncluded: Boolean(initialData.boxIncluded),
        status: initialData.status || 'available',
        conditionNotes: initialData.conditionNotes || '',
        photosText: Array.isArray(initialData.photos) ? initialData.photos.join('\n') : '',
        flawPhoto: initialData.flaws?.[0]?.photo || '',
        flawCaption: initialData.flaws?.[0]?.caption || '',
        featured: Boolean(initialData.featured),
      });
    } else {
      // Auto-generate next product code
      const randomCodeSuffix = Math.floor(400 + Math.random() * 500);
      setFormData({
        code: `GS-${randomCodeSuffix}`,
        brand: 'Nike',
        model: '',
        colourway: '',
        sizeUK: '9',
        sizeUS: '10',
        insoleCm: 28.0,
        score: 9.0,
        tier: 'Excellent',
        price: 8500,
        retailPrice: 22000,
        boxIncluded: false,
        status: 'available',
        conditionNotes: 'Hand-inspected, cleaned and graded. Upper, sole and insoles in solid shape.',
        photosText: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80\nhttps://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        flawPhoto: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        flawCaption: 'Faint surface rub mark on inner lateral side.',
        featured: false,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const photosList = formData.photosText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const price = Number(formData.price) || 0;
    const retailPrice = Number(formData.retailPrice) || price;
    const discountPercent = retailPrice > price ? Math.round(((retailPrice - price) / retailPrice) * 100) : 0;

    const productPayload = {
      code: formData.code.trim().toUpperCase(),
      brand: formData.brand,
      model: formData.model.trim(),
      colourway: formData.colourway.trim() || 'Original Colourway',
      sizeUK: String(formData.sizeUK),
      sizeUS: String(formData.sizeUS),
      insoleCm: Number(formData.insoleCm) || 28.0,
      score: Number(formData.score) || 9.0,
      tier: formData.tier,
      price: price,
      retailPrice: retailPrice,
      discountPercent: discountPercent,
      boxIncluded: formData.boxIncluded,
      status: formData.status,
      conditionNotes: formData.conditionNotes,
      listedAt: initialData ? initialData.listedAt : 'Just listed',
      featured: formData.featured,
      photos: photosList.length > 0 ? photosList : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
      flaws: formData.flawPhoto ? [{ photo: formData.flawPhoto.trim(), caption: formData.flawCaption.trim() || 'Minor flaw photographed.' }] : [],
    };

    onSubmit(productPayload);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid var(--color-ink)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-paper)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-oxblood)', backgroundColor: '#FFF', padding: '2px 6px', display: 'inline-block', fontWeight: 700, marginBottom: '4px' }}>
              INVENTORY MANAGEMENT
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px' }}>
              {initialData ? `Edit Listing (${initialData.code})` : 'Add New Shoe Listing'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-paper)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Code, Brand, Model */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Stock Code *
              </label>
              <input
                type="text"
                required
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. GS-0439"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Brand *
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Model *
              </label>
              <input
                type="text"
                required
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Air Jordan 1 High OG"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>
          </div>

          {/* Row 2: Colourway, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Colourway
              </label>
              <input
                type="text"
                name="colourway"
                value={formData.colourway}
                onChange={handleChange}
                placeholder="e.g. White / Core Black / Gum"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
              >
                <option value="available">Available for Sale</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Row 3: Sizes & Insole */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Size UK *
              </label>
              <select
                name="sizeUK"
                value={formData.sizeUK}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
              >
                {SIZES_UK.map((sz) => (
                  <option key={sz} value={sz}>UK {sz}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Size US
              </label>
              <input
                type="text"
                name="sizeUS"
                value={formData.sizeUS}
                onChange={handleChange}
                placeholder="e.g. 10"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Insole (CM)
              </label>
              <input
                type="number"
                step="0.5"
                name="insoleCm"
                value={formData.insoleCm}
                onChange={handleChange}
                placeholder="28.0"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>
          </div>

          {/* Row 4: Pricing & Condition Score */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Selling Price (PKR) *
              </label>
              <input
                type="number"
                required
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 8900"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Retail Price (PKR)
              </label>
              <input
                type="number"
                name="retailPrice"
                value={formData.retailPrice}
                onChange={handleChange}
                placeholder="e.g. 24500"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Condition Score (/10)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                name="score"
                value={formData.score}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Condition Tier
              </label>
              <select
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
              >
                {TIERS.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Notes */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Condition Inspection Notes
            </label>
            <textarea
              name="conditionNotes"
              rows={3}
              value={formData.conditionNotes}
              onChange={handleChange}
              placeholder="e.g. Upper leather immaculate. Minor creasing on toe box. Outsole tread ~90% depth."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
            />
          </div>

          {/* Photos URLs */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Product Photo URLs (One URL per line)
            </label>
            <textarea
              name="photosText"
              rows={3}
              value={formData.photosText}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-line-strong)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            />
          </div>

          {/* Flaw Photo & Caption */}
          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '10px' }}>
              Specific Flaw Inspection (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Flaw Photo URL</label>
                <input
                  type="text"
                  name="flawPhoto"
                  value={formData.flawPhoto}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-line-strong)', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Flaw Description</label>
                <input
                  type="text"
                  name="flawCaption"
                  value={formData.flawCaption}
                  onChange={handleChange}
                  placeholder="e.g. Light scuff mark on lateral heel overlay."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-line-strong)', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Checkboxes: Box Included & Featured */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', borderTop: '1px solid var(--color-line)', paddingTop: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              <input
                type="checkbox"
                name="boxIncluded"
                checked={formData.boxIncluded}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              Original Box Included
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              Feature on Homepage Drop
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '10px 20px', minHeight: '42px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 24px', minHeight: '42px' }}
            >
              {initialData ? 'Save Product Changes' : 'Publish Product Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
