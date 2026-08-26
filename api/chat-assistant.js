// Vercel Serverless Function: POST /api/chat-assistant
// AI Shopping Assistant backend for GitSole e-commerce platform

import { searchProducts, parseNaturalLanguageText } from '../src/services/productSearchEngine.js';

export default async function handler(req, res) {
  // CORS Headers
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
    const { message, history = [], contextFilters = {}, products = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'User message is required.' });
    }

    // 1. Natural Language Filter Extraction
    const newExtracted = parseNaturalLanguageText(message);

    // Merge accumulated conversation context filters
    const mergedFilters = {
      ...contextFilters,
      ...newExtracted
    };

    // If user asked to reset or start over
    if (message.toLowerCase().includes('start over') || message.toLowerCase().includes('reset') || message.toLowerCase().includes('different')) {
      if (!newExtracted.brand) delete mergedFilters.brand;
      if (!newExtracted.maxPrice) delete mergedFilters.maxPrice;
      if (!newExtracted.minPrice) delete mergedFilters.minPrice;
      if (!newExtracted.color) delete mergedFilters.color;
      if (!newExtracted.sizeUK) delete mergedFilters.sizeUK;
    }

    // 2. Perform Real Database Search against GitSole inventory
    let matchingProducts = searchProducts(products, mergedFilters);
    let relaxedSearchNotice = null;

    // 3. Fallback: If no exact matches, intelligently relax filters to show closest REAL products
    if (matchingProducts.length === 0 && (mergedFilters.maxPrice || mergedFilters.brand || mergedFilters.color)) {
      // Relax price or color slightly to find closest actual inventory items
      const relaxedFilters = { ...mergedFilters };
      if (relaxedFilters.maxPrice) {
        relaxedFilters.maxPrice = Math.round(relaxedFilters.maxPrice * 1.35); // Relax budget by 35%
      }
      delete relaxedFilters.color; // Relax strict color match

      const fallbackMatches = searchProducts(products, relaxedFilters);

      if (fallbackMatches.length > 0) {
        matchingProducts = fallbackMatches;
        relaxedSearchNotice = true;
      } else {
        // Broadest available fallback
        matchingProducts = searchProducts(products, { status: 'available' }).slice(0, 4);
      }
    }

    // Limit to top 5 real product cards for optimal chat layout
    const finalProductCards = matchingProducts.slice(0, 5).map(p => ({
      code: p.code,
      brand: p.brand,
      model: p.model,
      colourway: p.colourway,
      price: p.price,
      retailPrice: p.retailPrice,
      sizeUK: p.sizeUK,
      sizeUS: p.sizeUS,
      score: p.score,
      tier: p.tier,
      photo: p.photos?.[0] || p.photo || '',
      status: p.status || 'available'
    }));

    // 4. Generate AI Conversational Response via Gemini API or Smart Conversational Template
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    let aiReply = '';

    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the AI Shopping Assistant for GitSole, Pakistan's premier curated branded footwear platform.
Be warm, enthusiastic, concise, and helpful.
The customer said: "${message}"

Current Applied Search Filters: ${JSON.stringify(mergedFilters)}
Matching Real Products Found in Database (${finalProductCards.length}):
${JSON.stringify(finalProductCards.map(p => ({ brand: p.brand, model: p.model, price: `PKR ${p.price}`, size: `UK ${p.sizeUK}` })))}

${relaxedSearchNotice ? 'NOTE: No exact match was found under the strict criteria, so we relaxed the budget/color filter to show the closest available shoes.' : ''}

RULES:
1. Speak in natural, friendly tone.
2. NEVER mention product codes or database technical terms.
3. Keep response under 3 sentences.
4. Encourage the customer to click "View Product" on the cards below.`
                    }
                  ]
                }
              ],
              generationConfig: { temperature: 0.3 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          aiReply = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (gemErr) {
        console.warn('[Chat Assistant Gemini Call Failed]:', gemErr.message);
      }
    }

    // Default conversational reply if Gemini API key is pending
    if (!aiReply) {
      if (relaxedSearchNotice) {
        aiReply = `I couldn't find an exact match under your strict filter, but I found these closest options currently available in our store!`;
      } else if (finalProductCards.length > 0) {
        const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
        const priceMention = mergedFilters.maxPrice ? ` under PKR ${mergedFilters.maxPrice.toLocaleString()}` : '';
        aiReply = `Great choice! Here are the best ${brandMention}shoes${priceMention} matching your request from our GitSole inventory:`;
      } else {
        aiReply = `I couldn't find available shoes matching those criteria right now, but feel free to adjust your budget or size!`;
      }
    }

    return res.status(200).json({
      success: true,
      reply: aiReply,
      products: finalProductCards,
      appliedFilters: mergedFilters
    });
  } catch (error) {
    console.error('[Chat Assistant Error]:', error);
    return res.status(500).json({
      success: false,
      error: "Sorry, I'm having trouble finding shoes right now. Please try again."
    });
  }
}
