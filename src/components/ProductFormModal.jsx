import React, { useState, useEffect } from 'react';
import { BRANDS, SIZES_UK, SIZES_EU, convertEuSizeToAll, getEuFromUk, TIERS } from '../data/products';
import { X, Plus, Trash2, Image, UploadCloud, AlertCircle, Sparkles, Loader2, Check, Zap } from 'lucide-react';
import { analyzeShoeImagesWithAI } from '../services/aiProductAnalyzer';
import { uploadProductImage } from '../services/imageStorageService';

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    code: '',
    brand: 'Nike',
    model: '',
    colourway: '',
    sizeEU: '44',
    sizeUK: '9',
    sizeUS: '10',
    insoleCm: 28.0,
    score: 9.0,
    tier: 'Excellent',
    price: '',
    retailPrice: 22000,
    boxIncluded: false,
    status: 'available',
    conditionNotes: '',
    flawCaption: '',
    featured: false,
  });

  const [photos, setPhotos] = useState([]);
  const [flawPhoto, setFlawPhoto] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [hasAiGenerated, setHasAiGenerated] = useState(false);
  const [aiGeneratedMap, setAiGeneratedMap] = useState({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [userApiKey, setUserApiKey] = useState(() => {
    const k = (localStorage.getItem('gitsole_gemini_api_key') || '').trim();
    if (k && !k.startsWith('AIzaSy') && !k.startsWith('AQ.') && k.length < 20) {
      localStorage.removeItem('gitsole_gemini_api_key');
      return '';
    }
    return k;
  });

  const handleSaveApiKey = (val) => {
    const trimmed = (val || '').trim();
    setUserApiKey(trimmed);
    if (trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.') || trimmed.length >= 20) {
      localStorage.setItem('gitsole_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('gitsole_gemini_api_key');
    }
  };

  const handleEuSizeSelect = (selectedEu) => {
    const res = convertEuSizeToAll(selectedEu);
    if (res) {
      setFormData(prev => ({
        ...prev,
        sizeEU: res.sizeEU,
        sizeUK: res.sizeUK,
        sizeUS: res.sizeUS,
        insoleCm: res.insoleCm,
      }));
      setAiGeneratedMap(prev => ({
        ...prev,
        sizeUK: true,
        sizeUS: true,
        insoleCm: true
      }));
    } else {
      setFormData(prev => ({ ...prev, sizeEU: selectedEu }));
    }
  };

  const handleAIShoeScan = async (targetPhoto = null) => {
    const imagesToScan = targetPhoto ? [targetPhoto] : (photos.length > 0 ? photos : [customUrlInput].filter(Boolean));
    if (imagesToScan.length === 0) {
      alert('Please upload or add at least one shoe picture first to generate details with AI.');
      return;
    }

    const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
    console.log(`[${requestId}] Frontend image payload:`, {
      count: imagesToScan.length,
      sampleSnippet: typeof imagesToScan[0] === 'string' ? imagesToScan[0].substring(0, 45) : 'binary'
    });

    setIsScanning(true);
    setScanMessage('Analyzing shoe...');

    const res = await analyzeShoeImagesWithAI(imagesToScan, userApiKey, requestId);

    setIsScanning(false);
    if (res.success && res.product) {
      const p = res.product;
      setFormData(prev => ({
        ...prev,
        brand: p.brand || prev.brand,
        model: p.model || prev.model,
        colourway: p.colourway || prev.colourway,
        retailPrice: p.retailPrice || prev.retailPrice,
        score: p.score || prev.score,
        tier: p.tier || prev.tier,
        conditionNotes: p.conditionNotes || prev.conditionNotes,
      }));

      setHasAiGenerated(true);
      setAiGeneratedMap({
        brand: true,
        model: true,
        colourway: true,
        retailPrice: true,
        score: true,
        tier: true,
        conditionNotes: true
      });

      setScanMessage('✓ Details generated successfully');
    } else {
      setScanMessage(res.error || "AI couldn't analyze this image. Please try again or enter the details manually.");
    }
  };

  // Scroll locking for body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      const derivedEu = initialData.sizeEU || getEuFromUk(initialData.sizeUK) || '44';
      setFormData({
        code: initialData.code || '',
        brand: initialData.brand || 'Nike',
        model: initialData.model || '',
        colourway: initialData.colourway || '',
        sizeEU: String(derivedEu),
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
        flawCaption: initialData.flaws?.[0]?.caption || '',
        featured: Boolean(initialData.featured),
      });
      setPhotos(Array.isArray(initialData.photos) ? [...initialData.photos] : []);
      setFlawPhoto(initialData.flaws?.[0]?.photo || '');
    } else {
      const randomCodeSuffix = Math.floor(400 + Math.random() * 500);
      setFormData({
        code: `GS-${randomCodeSuffix}`,
        brand: 'Nike',
        model: '',
        colourway: '',
        sizeEU: '44',
        sizeUK: '9',
        sizeUS: '10',
        insoleCm: 28.0,
        score: 9.0,
        tier: 'Excellent',
        price: '',
        retailPrice: 22000,
        boxIncluded: false,
        status: 'available',
        conditionNotes: '',
        flawCaption: '',
        featured: false,
      });
      setPhotos([]);
      setFlawPhoto('');
      setHasAiGenerated(false);
      setAiGeneratedMap({});
      setScanMessage('');
      setFormError('');
    }
  }, [initialData, isOpen]);

  const renderAiBadge = (fieldName) => {
    if (!aiGeneratedMap[fieldName]) return null;
    return (
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9.5px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        border: '1px solid #A5D6A7',
        padding: '1px 6px',
        borderRadius: '3px',
        marginLeft: '6px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        ✨ AI Generated
      </span>
    );
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload product photos from device to Cloud Storage
  const handleDevicePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const validImageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validImageFiles.length === 0) return;

    setIsUploadingImages(true);
    setScanMessage('Compressing and uploading images to cloud...');

    try {
      const uploadPromises = validImageFiles.map(async (file, idx) => {
        const uploadedUrl = await uploadProductImage(file, `${formData.code || 'shoe'}-${idx + 1}`);
        return uploadedUrl;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      const filteredUrls = newPhotoUrls.filter(Boolean);

      if (filteredUrls.length > 0) {
        setPhotos((prev) => [...prev, ...filteredUrls]);
        handleAIShoeScan(filteredUrls[0]);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  // Remove photo thumbnail
  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Add photo via custom URL
  const handleAddCustomUrl = () => {
    if (customUrlInput.trim()) {
      setPhotos((prev) => [...prev, customUrlInput.trim()]);
      setCustomUrlInput('');
    }
  };

  // Upload flaw photo from device to Cloud Storage
  const handleDeviceFlawUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploadingImages(true);
      try {
        const uploadedFlawUrl = await uploadProductImage(file, `${formData.code || 'shoe'}-flaw`);
        if (uploadedFlawUrl) {
          setFlawPhoto(uploadedFlawUrl);
        }
      } catch (err) {
        console.error('Failed to upload flaw image:', err);
      } finally {
        setIsUploadingImages(false);
      }
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = (formData.code || '').trim().toUpperCase();
    const cleanBrand = (formData.brand || '').trim();
    const cleanModel = (formData.model || '').trim();
    const price = Number(formData.price) || 0;

    // Strict validation
    if (!cleanCode) {
      setFormError('Product SKU / Code is required.');
      return;
    }
    if (!cleanBrand) {
      setFormError('Brand is required.');
      return;
    }
    if (!cleanModel) {
      setFormError('Shoe Model / Article name is required.');
      return;
    }
    if (price <= 0) {
      setFormError('Price (PKR) must be greater than 0.');
      return;
    }

    const retailPrice = Number(formData.retailPrice) || price;
    const discountPercent = retailPrice > price ? Math.round(((retailPrice - price) / retailPrice) * 100) : 0;

    setIsSaving(true);

    try {
      // Ensure any remaining raw base64 photos are uploaded to cloud
      let finalPhotos = [...photos];
      if (finalPhotos.length > 0) {
        const processedPhotos = await Promise.all(
          finalPhotos.map((p, idx) => uploadProductImage(p, `${cleanCode}-${idx + 1}`))
        );
        finalPhotos = processedPhotos.filter(Boolean);
      }

      let finalFlawPhoto = flawPhoto;
      if (finalFlawPhoto && (finalFlawPhoto.startsWith('data:') || finalFlawPhoto.startsWith('blob:'))) {
        finalFlawPhoto = await uploadProductImage(finalFlawPhoto, `${cleanCode}-flaw`);
      }

      const productPayload = {
        code: cleanCode,
        brand: cleanBrand,
        model: cleanModel,
        colourway: formData.colourway.trim() || 'Original Colourway',
        sizeEU: String(formData.sizeEU || getEuFromUk(formData.sizeUK) || '44'),
        sizeUK: String(formData.sizeUK || '9'),
        sizeUS: String(formData.sizeUS || '10'),
        insoleCm: Number(formData.insoleCm) || 28.0,
        score: Number(formData.score) || 9.0,
        tier: formData.tier || 'Excellent',
        price: price,
        retailPrice: retailPrice,
        discountPercent: discountPercent,
        boxIncluded: Boolean(formData.boxIncluded),
        status: formData.status || 'available',
        conditionNotes: formData.conditionNotes || '',
        listedAt: initialData ? initialData.listedAt : 'Just listed',
        featured: Boolean(formData.featured),
        photos: finalPhotos.length > 0 ? finalPhotos : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
        flaws: finalFlawPhoto ? [{ photo: finalFlawPhoto, caption: formData.flawCaption.trim() || 'Minor flaw photographed.' }] : [],
      };

      const result = await onSubmit(productPayload);
      if (result && result.success === false) {
        setFormError(result.error || 'Failed to save product to database');
      } else {
        onClose();
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred while saving product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '88vh',
          overflowY: 'auto',
          border: '2px solid var(--color-ink)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '2px'
        }}
      >
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
          zIndex: 20
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

          {/* Device Photo Upload Section */}
          <div style={{ backgroundColor: 'var(--color-paper)', border: '1.5px solid var(--color-line-strong)', padding: '18px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '10px', color: 'var(--color-ink)' }}>
              Product Pictures (Upload from Device) *
            </label>

            {/* Drag & Select Device File Button */}
            <div style={{
              border: '2px dashed var(--color-line-strong)',
              backgroundColor: '#FFFFFF',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleDevicePhotosUpload}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={32} color="var(--color-oxblood)" />
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-ink)' }}>
                  Click or Drop Photos Here to Upload from Device
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Supports JPG, PNG, WEBP from your Phone or PC
                </div>
              </div>
            </div>

            {/* Photo Thumbnails List */}
            {photos.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-muted)' }}>
                  Uploaded Pictures ({photos.length}):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                  {photos.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', border: '1px solid var(--color-line)', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={url} alt={`Upload ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(140, 47, 35, 0.9)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional URL addition toggle */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-line)' }}>
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-oxblood)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  + Add via Image URL Link instead
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://..."
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--color-line-strong)', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', minHeight: '34px' }}
                  >
                    Add URL
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Shoe Vision Scanner Action Band */}
          <div style={{
            backgroundColor: '#F4F1EA',
            border: '1.5px solid var(--color-oxblood)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--color-oxblood)" />
                  AI Shoe Vision Autodetect
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  Upload picture ➔ Click scan ➔ AI fills Brand, Model, Colourway & Notes automatically!
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-oxblood)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {showApiKeyInput ? 'Hide Key Setting' : '⚙️ Gemini API Key'}
                </button>

                <button
                  type="button"
                  onClick={() => handleAIShoeScan()}
                  disabled={isScanning}
                  className="btn btn-oxblood"
                  style={{
                    padding: '8px 16px',
                    minHeight: '38px',
                    fontSize: '13px',
                    opacity: isScanning ? 0.75 : 1
                  }}
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Analyzing shoe...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> {hasAiGenerated ? 'Regenerate Details' : '✨ Generate Details with AI'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {showApiKeyInput && (
              <div style={{ backgroundColor: '#FFF', border: '1px solid var(--color-line-strong)', padding: '10px 12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Google Gemini API Key (Optional for 100% Live AI Cloud Model):
                </label>
                <input
                  type="text"
                  placeholder="Paste your Gemini API Key (starts with AIzaSy... or AQ...)"
                  value={userApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-line)' }}
                />
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
                  Get your free Gemini API Key in 10 seconds at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-oxblood)', fontWeight: 700, textDecoration: 'underline' }}>
                    aistudio.google.com/app/apikey
                  </a>
                </div>
              </div>
            )}
          </div>

          {scanMessage && (
            <div style={{
              backgroundColor: scanMessage.includes('✨') ? '#E8F5E9' : '#FFF3E0',
              border: scanMessage.includes('✨') ? '1px solid #4CAF50' : '1px solid #FF9800',
              color: scanMessage.includes('✨') ? '#2E7D32' : '#E65100',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {scanMessage}
            </div>
          )}

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
                Brand *{renderAiBadge('brand')}
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
                Model *{renderAiBadge('model')}
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
                Colourway{renderAiBadge('colourway')}
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

          {/* Row 3: Sizing with 1-Click Europe Auto-Fill */}
          <div style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-line-strong)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={14} color="var(--color-oxblood)" />
                Europe Size (EU) — Pick & Auto-fill All Sizes:
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#2E7D32', fontWeight: 700, backgroundColor: '#E8F5E9', padding: '2px 8px', borderRadius: '3px' }}>
                ⚡ Auto-Calculates UK, US & Insole CM
              </span>
            </div>

            {/* Quick EU Pill Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['39', '40', '40.5', '41', '42', '42.5', '43', '44', '44.5', '45', '46'].map((eu) => {
                const isSelected = String(formData.sizeEU) === eu;
                return (
                  <button
                    key={eu}
                    type="button"
                    onClick={() => handleEuSizeSelect(eu)}
                    style={{
                      border: isSelected ? '2px solid var(--color-oxblood)' : '1px solid var(--color-line-strong)',
                      backgroundColor: isSelected ? 'var(--color-oxblood)' : '#FFF',
                      color: isSelected ? '#FFF' : 'var(--color-ink)',
                      padding: '6px 10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    EU {eu}
                  </button>
                );
              })}
            </div>

            {/* Custom EU dropdown & Calculated UK / US / Insole Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', paddingTop: '4px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--color-muted)' }}>
                  All EU Sizes
                </label>
                <select
                  name="sizeEU"
                  value={formData.sizeEU}
                  onChange={(e) => handleEuSizeSelect(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF', fontWeight: 700 }}
                >
                  {SIZES_EU.map((eu) => (
                    <option key={eu} value={eu}>EU {eu}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--color-muted)' }}>
                  Size UK *{renderAiBadge('sizeUK')}
                </label>
                <select
                  name="sizeUK"
                  value={formData.sizeUK}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
                >
                  {SIZES_UK.map((sz) => (
                    <option key={sz} value={sz}>UK {sz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--color-muted)' }}>
                  Size US{renderAiBadge('sizeUS')}
                </label>
                <input
                  type="text"
                  name="sizeUS"
                  value={formData.sizeUS}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--color-muted)' }}>
                  Insole (CM){renderAiBadge('insoleCm')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="insoleCm"
                  value={formData.insoleCm}
                  onChange={handleChange}
                  placeholder="28.0"
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--color-line-strong)', backgroundColor: '#FFF' }}
                />
              </div>
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
                Retail Price (PKR){renderAiBadge('retailPrice')}
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
                Condition Score (/10){renderAiBadge('score')}
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
                Condition Tier{renderAiBadge('tier')}
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
              Condition Inspection Notes{renderAiBadge('conditionNotes')}
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

          {/* Flaw Photo Device Upload */}
          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-oxblood)', marginBottom: '10px' }}>
              Specific Flaw Inspection Photo (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Upload Flaw Picture from Device</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{
                    padding: '8px 14px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-line-strong)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UploadCloud size={16} />
                    Choose Device File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceFlawUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {flawPhoto && (
                    <div style={{ position: 'relative', width: '40px', height: '40px', border: '1px solid var(--color-line)', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={flawPhoto} alt="Flaw preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setFlawPhoto('')}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(140, 47, 35, 0.75)',
                          color: '#FFF',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove flaw picture"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Flaw Inspection Note</label>
                <input
                  type="text"
                  name="flawCaption"
                  value={formData.flawCaption}
                  onChange={handleChange}
                  placeholder="e.g. Light scuff mark on lateral heel overlay."
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--color-line-strong)', fontSize: '13px' }}
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

          {/* Form Error Banner */}
          {formError && (
            <div style={{
              backgroundColor: '#FFEBEE',
              border: '1px solid #EF5350',
              padding: '12px 16px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#C62828',
              fontSize: '13.5px',
              fontWeight: 500
            }}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploadingImages}
              className="btn btn-outline"
              style={{ padding: '10px 20px', minHeight: '42px', opacity: (isSaving || isUploadingImages) ? 0.6 : 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImages}
              className="btn btn-primary"
              style={{ padding: '10px 24px', minHeight: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {(isSaving || isUploadingImages) ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>{isUploadingImages ? 'Uploading Photos...' : 'Saving to Database...'}</span>
                </>
              ) : (
                <span>{initialData ? 'Save Product Changes' : 'Publish Product Listing'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
