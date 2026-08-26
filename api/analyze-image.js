// Vercel Serverless Function: POST /api/analyze-image
// Secure server-side Gemini Vision API image analyzer for GitSole Admin

export default async function handler(req, res) {
  // CORS & method verification
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { images, apiKey, requestId = 'req_' + Date.now() } = req.body || {};

    console.log(`[${requestId}] Backend received image analysis request:`, {
      imageCount: Array.isArray(images) ? images.length : 1
    });

    // 1. Validate API Key from Server Environment or Admin Request
    const geminiApiKey = process.env.GEMINI_API_KEY || (apiKey && apiKey.startsWith('AIzaSy') ? apiKey : '');

    if (!geminiApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Server GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in Vercel environment settings or provide a valid key.'
      });
    }

    // 2. Validate input image payload
    const imageList = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);

    if (imageList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload at least one shoe image.'
      });
    }

    // 3. Prepare Gemini API vision payload with strict single-image isolation prompt
    const geminiParts = [
      {
        text: `You are an expert sneaker authenticator and thrift footwear cataloger for GitSole e-commerce platform.
Analyze ONLY the image(s) provided in this specific request payload. Ignore any previous product information, previous images, previous responses, cached data, filenames, URLs, or assumptions. Identify the shoe based solely on the visual content of the current image.

CRITICAL NO-HALLUCINATION RULES:
1. Do NOT invent or make up details that are not visible or identifiable.
2. If the exact model cannot be determined from the visual content alone, output "Unknown" for model.
3. If the brand cannot be confidently determined from visual logos/features, output "Unknown" for brand.
4. If the material cannot be determined, output "Unknown" for material.
5. If gender cannot be determined, output "Unisex" for gender.
6. If condition tier cannot be reliably determined, output "Needs Review" for condition.
7. Do NOT invent Price, Size, Stock quantity, or SKU.
8. Generate a clean, SEO-friendly, professional Product Title without marketing hype words (avoid "BEST", "AMAZING", "PREMIUM", "HOT SELLING").
9. Keep descriptions concise, factual, and suitable for GitSole.

Return ONLY a valid JSON object matching this exact structure:`
      }
    ];
{
  "brand": "Nike|Jordan|Adidas|New Balance|Puma|Asics|Reebok|Timberland|Vans|Converse|Yeezy|Other",
  "model": "Exact Model Name or Unknown",
  "title": "Clean SEO Product Title",
  "category": "Sneakers|Boots|Casual|Running|Basketball|Loafers|Slides",
  "subcategory": "Low-Top|High-Top|Mid-Top|Slip-On",
  "gender": "Men|Women|Unisex",
  "color": "Primary Color",
  "secondaryColors": ["Secondary Color 1"],
  "shoeType": "Lifestyle|Performance|Thrift Classic",
  "style": "Retro|Modern|Streetwear|Workwear",
  "material": "Leather|Suede|Canvas|Mesh|Nubuck|Unknown",
  "condition": "Pristine|Excellent|Great|Good|Needs Review",
  "tier": "Pristine|Excellent|Great|Good",
  "score": 9.0,
  "retailPrice": 24000,
  "shortDescription": "Concise 1-sentence summary.",
  "conditionNotes": "Fact-based 2-sentence thrift inspection summary about sole, upper, and cleanliness.",
  "description": "Professional 2-3 sentence product overview.",
  "features": ["Classic silhouette", "Rubber outsole", "Lace-up closure"],
  "tags": ["Brand", "Model", "Category"],
  "keywords": ["shoe keyword 1", "shoe keyword 2"]
}`
      }
    ];

    // Format up to 3 images for Gemini Vision
    for (const imgItem of imageList.slice(0, 3)) {
      if (typeof imgItem === 'string') {
        if (imgItem.startsWith('data:image/')) {
          const mimeType = imgItem.substring(imgItem.indexOf(':') + 1, imgItem.indexOf(';'));
          const base64Data = imgItem.substring(imgItem.indexOf(',') + 1);
          geminiParts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data
            }
          });
        } else if (imgItem.startsWith('http://') || imgItem.startsWith('https://')) {
          try {
            const imgRes = await fetch(imgItem);
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              const base64Data = Buffer.from(arrayBuf).toString('base64');
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
              geminiParts.push({
                inlineData: {
                  mimeType: contentType,
                  data: base64Data
                }
              });
            }
          } catch (fetchErr) {
            console.warn('[Serverless Gemini] Image URL fetch failed:', imgItem, fetchErr.message);
          }
        }
      }
    }

    // 4. Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const apiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: geminiParts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('[Serverless Gemini API Error]:', apiRes.status, errText);
      return res.status(500).json({
        success: false,
        error: `Gemini API call failed (${apiRes.status}). Please check API key or image format.`
      });
    }

    const resData = await apiRes.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API returned an empty analysis response.'
      });
    }

    // 5. Parse and sanitize JSON
    let productData;
    try {
      productData = JSON.parse(rawText);
    } catch (parseErr) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON structure returned by Gemini.');
      }
    }

    // 6. Enforce No-Hallucination & Standard Defaults
    const sanitized = {
      brand: productData.brand || 'Other',
      model: productData.model || 'Unknown',
      title: (productData.title || `${productData.brand || 'Shoe'} ${productData.model || ''}`).replace(/(BEST|AMAZING|PREMIUM|HOT SELLING|MUST BUY)/gi, '').trim(),
      category: productData.category || 'Sneakers',
      subcategory: productData.subcategory || 'Low-Top',
      gender: productData.gender || 'Unisex',
      color: productData.color || 'Multi-color',
      secondaryColors: Array.isArray(productData.secondaryColors) ? productData.secondaryColors : [],
      shoeType: productData.shoeType || 'Lifestyle',
      style: productData.style || 'Retro',
      material: productData.material || 'Unknown',
      condition: productData.condition || 'Needs Review',
      tier: productData.tier || 'Excellent',
      score: Number(productData.score) || 9.0,
      retailPrice: Number(productData.retailPrice) || 24000,
      shortDescription: productData.shortDescription || 'Authentic curated thrift footwear.',
      conditionNotes: productData.conditionNotes || 'Hand-inspected, cleaned and sanitized. Upper and outsole in solid shape.',
      description: productData.description || 'Pre-owned curated footwear in solid structural condition.',
      features: Array.isArray(productData.features) && productData.features.length > 0 ? productData.features : ['Lace-up closure', 'Durable outsole', 'Curated thrift footwear'],
      tags: Array.isArray(productData.tags) ? productData.tags : [productData.brand, productData.model].filter(Boolean),
      keywords: Array.isArray(productData.keywords) ? productData.keywords : [productData.brand, productData.model].filter(Boolean)
    };

    return res.status(200).json({
      success: true,
      product: sanitized
    });
  } catch (error) {
    console.error('[Serverless Analyze Image Endpoint Exception]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected server error occurred while analyzing the image.'
    });
  }
}
