// Frontend API Service Helper: AI Product Creation Analyzer
// Communicates with backend endpoint POST /api/analyze-image

/**
 * Call backend to analyze shoe image(s) with Gemini API
 * @param {Array<string>} images - Array of image Base64 data URLs or HTTP URLs
 * @param {string} userApiKey - Optional admin fallback API Key
 */
export async function analyzeShoeImagesWithAI(images, userApiKey = '') {
  try {
    const imageList = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);

    if (imageList.length === 0) {
      return {
        success: false,
        error: 'Please upload at least one shoe image first.'
      };
    }

    // 1. Try secure backend serverless endpoint POST /api/analyze-image
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageList,
          apiKey: userApiKey || undefined
        })
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.product) {
          return {
            success: true,
            product: resData.product,
            source: 'Serverless Gemini AI'
          };
        } else if (resData.error) {
          console.warn('[Backend Analyze Endpoint returned error]:', resData.error);
        }
      }
    } catch (netErr) {
      console.warn('[Backend Endpoint Fetch Failed, trying client fallback]:', netErr.message);
    }

    // 2. Client-side fallback if serverless endpoint is unreachable (e.g. static preview or local dev without serverless runner)
    const activeKey = userApiKey || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gitsole_gemini_api_key') || '';

    if (activeKey && activeKey.startsWith('AIzaSy')) {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this shoe image and return ONLY a JSON object:
{
  "brand": "Nike",
  "model": "Air Force 1",
  "title": "Nike Air Force 1 White",
  "category": "Sneakers",
  "subcategory": "Low-Top",
  "gender": "Unisex",
  "color": "White",
  "secondaryColors": ["Black"],
  "shoeType": "Lifestyle",
  "style": "Retro",
  "material": "Leather",
  "condition": "Excellent",
  "tier": "Excellent",
  "score": 9.0,
  "retailPrice": 24000,
  "shortDescription": "Classic low-top sneakers.",
  "conditionNotes": "Sanitized and in solid condition.",
  "description": "Pre-owned curated footwear.",
  "features": ["Lace-up closure", "Rubber outsole"],
  "tags": ["Nike", "Air Force 1"],
  "keywords": ["Nike", "Air Force 1"]
}`
                  },
                  imageList[0].startsWith('data:')
                    ? {
                        inlineData: {
                          mimeType: imageList[0].substring(imageList[0].indexOf(':') + 1, imageList[0].indexOf(';')),
                          data: imageList[0].substring(imageList[0].indexOf(',') + 1)
                        }
                      }
                    : { text: `Image URL: ${imageList[0]}` }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (directRes.ok) {
        const d = await directRes.json();
        const txt = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) {
          const parsed = JSON.parse(txt);
          return { success: true, product: parsed, source: 'Direct Gemini Vision' };
        }
      }
    }

    // 3. Last-resort fallback error response without breaking app
    return {
      success: false,
      error: "AI couldn't analyze this image. Please check API key setup or enter the details manually."
    };
  } catch (err) {
    console.error('[aiProductAnalyzer Error]:', err);
    return {
      success: false,
      error: "AI couldn't analyze this image. Please try again or enter the details manually."
    };
  }
}
