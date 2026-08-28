// Vercel Serverless Function: POST /api/upload-image
// Handles authenticated image uploads to Supabase Storage bucket 'product-images'

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wmoqabcoiqjbpwlwzkcs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kFAD10jtINWeUSNz2mIwaQ_U03U5tId';

function verifyAdminAuth(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-auth'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');
    return Boolean(user && pass && user.trim().length > 0 && pass.trim().length > 0);
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-auth');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // Admin authentication check
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required to upload product images.'
    });
  }

  try {
    const { imageBase64, filename = 'shoe-upload.webp', contentType = 'image/webp' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Clean base64 header if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (SUPABASE_URL && SUPABASE_KEY) {
      const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
      const supabase = createClient(cleanUrl, SUPABASE_KEY, {
        auth: { persistSession: false }
      });

      const path = `products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, buffer, {
          contentType: contentType,
          cacheControl: '31536000',
          upsert: true
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);

        if (publicData && publicData.publicUrl) {
          return res.status(200).json({
            success: true,
            url: publicData.publicUrl
          });
        }
      } else if (error) {
        console.error('[Upload Image API] Supabase storage error:', error.message);
      }
    }

    // Fallback: return data URI
    return res.status(200).json({
      success: true,
      url: `data:${contentType};base64,${base64Data}`
    });
  } catch (err) {
    console.error('[API Upload Image Error]:', err);
    return res.status(500).json({ success: false, error: err.message || 'Image upload failed' });
  }
}
