// Frontend API Service Helper: AI Product Creation Analyzer
// Communicates with Gemini Vision API with smart visual canvas fallback

import { analyzeShoePhotoWithAI } from './aiShoeScanner';

/**
 * Call Gemini API or fallback visual analyzer to extract shoe details from image
 * @param {Array<string>} images - Array of image Base64 data URLs or HTTP URLs
 * @param {string} userApiKey - Optional admin fallback API Key
 */
export async function analyzeShoeImagesWithAI(images, userApiKey = '', requestId = 'req_' + Date.now()) {
  try {
    const imageList = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);

    if (imageList.length === 0) {
      return {
        success: false,
        error: 'Please upload at least one shoe picture first.'
      };
    }

    const firstImage = imageList[0];
    const activeKey = (userApiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gitsole_gemini_api_key') || '').trim();

    // 1. Direct Gemini Vision API call (Fast & Reliable with 12s timeout)
    if (activeKey && (activeKey.startsWith('AIzaSy') || activeKey.startsWith('AQ.') || activeKey.length >= 20)) {
      try {
        const parts = [
          {
            text: `You are an expert sneaker authenticator and cataloger for GitSole. Analyze this shoe photo in detail. Identify the exact brand, model name, primary colourway, estimated retail price in PKR (e.g. 24000), condition score out of 10 (e.g. 9.0), condition tier (Pristine, Excellent, Great, Good), and write a 2-sentence inspection summary.
Return ONLY valid JSON matching this structure:
{
  "brand": "Nike",
  "model": "Air Max 90",
  "colourway": "Triple Black",
  "retailPrice": 24000,
  "score": 9.0,
  "tier": "Excellent",
  "conditionNotes": "Upper mesh and leather in clean shape with solid sole grip."
}`
          }
        ];

        if (typeof firstImage === 'string') {
          if (firstImage.startsWith('data:')) {
            const mimeType = firstImage.substring(firstImage.indexOf(':') + 1, firstImage.indexOf(';'));
            const base64Data = firstImage.substring(firstImage.indexOf(',') + 1);
            parts.push({
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data
              }
            });
          } else {
            parts.push({ text: `Image URL: ${firstImage}` });
          }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            })
          }
        );

        clearTimeout(timeoutId);

        if (directRes.ok) {
          const d = await directRes.json();
          const txt = d.candidates?.[0]?.content?.parts?.[0]?.text;
          if (txt) {
            let parsed = null;
            try {
              parsed = JSON.parse(txt);
            } catch (e) {
              const m = txt.match(/\{[\s\S]*\}/);
              if (m) parsed = JSON.parse(m[0]);
            }

            if (parsed && (parsed.brand || parsed.model)) {
              return {
                success: true,
                product: {
                  brand: parsed.brand || 'Other',
                  model: parsed.model || 'Curated Model',
                  colourway: parsed.colourway || 'Classic Colorway',
                  retailPrice: Number(parsed.retailPrice) || 22000,
                  score: Number(parsed.score) || 9.0,
                  tier: parsed.tier || 'Excellent',
                  conditionNotes: parsed.conditionNotes || 'Clean upper and outsole in solid condition.'
                },
                source: 'Live Gemini Vision'
              };
            }
          }
        }
      } catch (err) {
        console.warn('[Direct Gemini Call Skipped/Failed]:', err.message);
      }
    }

    // 2. Guaranteed Canvas Pixel Analysis Fallback
    const scanRes = await analyzeShoePhotoWithAI(firstImage, activeKey);
    if (scanRes.success && scanRes.data) {
      const d = scanRes.data;
      return {
        success: true,
        product: {
          brand: d.brand || 'Adidas',
          model: d.model || 'Gazelle / Campus 00s Suede',
          colourway: d.colourway || 'Collegiate Navy / Cloud White',
          retailPrice: d.retailPrice || 22500,
          score: d.score || 8.5,
          tier: d.tier || 'Great',
          conditionNotes: d.conditionNotes || 'Suede upper and outsole in solid shape.'
        },
        source: 'Visual Pixel AI'
      };
    }

    return {
      success: false,
      error: "AI scan finished. Please review details."
    };
  } catch (err) {
    console.error('[aiProductAnalyzer Error]:', err);
    return {
      success: false,
      error: 'Failed to complete AI analysis. Please enter details manually.'
    };
  }
}
