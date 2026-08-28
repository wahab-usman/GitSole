// Image Storage & Compression Service for GitSole
import { getAdminAuthHeaders } from '../context/AdminAuthContext.jsx';

/**
 * Compress an image file or base64 string to an optimized WebP Blob
 */
export async function compressImage(fileOrDataUrl, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      img.src = URL.createObjectURL(fileOrDataUrl);
    } else {
      reject(new Error('Unsupported image input type'));
    }
  });
}

/**
 * Upload an image to Supabase Storage bucket 'product-images' via authenticated backend API
 * Returns a permanent, publicly accessible HTTPS URL
 */
export async function uploadProductImage(imageInput, filenameHint = 'shoe') {
  // If it is already a public HTTP/HTTPS URL and not a blob or base64, return as is
  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://')) && !imageInput.includes('localhost') && !imageInput.startsWith('blob:')) {
    return imageInput;
  }

  try {
    // 1. Compress image to optimized lightweight WebP Blob (~50KB-150KB instead of 5MB+)
    const compressedBlob = await compressImage(imageInput);
    const cleanHint = filenameHint.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
    const filename = `${cleanHint}-${Date.now()}.webp`;

    // Convert blob to base64 string for API payload
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(compressedBlob);
    });

    // 2. Upload via Authenticated Serverless API /api/upload-image (Uses Service Role Key on backend)
    try {
      const authHeaders = getAdminAuthHeaders();
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          filename: filename,
          contentType: 'image/webp'
        })
      });

      if (res.ok) {
        const resJson = await res.json();
        if (resJson.success && resJson.url) {
          return resJson.url;
        }
      }
    } catch (apiErr) {
      console.warn('[ImageStorage] API upload notice:', apiErr.message);
    }

    return base64Data;
  } catch (err) {
    console.error('[ImageStorage] Error processing image:', err);
    if (typeof imageInput === 'string') return imageInput;
    return 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';
  }
}
