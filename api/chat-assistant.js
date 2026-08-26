// Vercel Serverless Function: POST /api/chat-assistant
// AI Shopping Assistant backend for GitSole e-commerce platform with ChatGPT-like conversational capability

import { searchProducts, parseNaturalLanguageText, detectUserIntent } from '../src/services/productSearchEngine.js';

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

    // 1. Classify User Intent FIRST
    const { intent, subType } = detectUserIntent(message);
    const geminiApiKey = process.env.GEMINI_API_KEY || '';

    // Check if intent requires searching product database
    const isProductSearch = intent === 'PRODUCT_SEARCH';
    let finalProductCards = [];
    let mergedFilters = { ...contextFilters };

    if (isProductSearch) {
      const newExtracted = parseNaturalLanguageText(message);
      mergedFilters = { ...contextFilters, ...newExtracted };

      if (message.toLowerCase().includes('start over') || message.toLowerCase().includes('reset')) {
        if (!newExtracted.brand) delete mergedFilters.brand;
        if (!newExtracted.maxPrice) delete mergedFilters.maxPrice;
        if (!newExtracted.minPrice) delete mergedFilters.minPrice;
        if (!newExtracted.color) delete mergedFilters.color;
        if (!newExtracted.sizeUK) delete mergedFilters.sizeUK;
      }

      let matchingProducts = searchProducts(products, mergedFilters);
      if (matchingProducts.length === 0 && (mergedFilters.maxPrice || mergedFilters.brand)) {
        const relaxed = { ...mergedFilters };
        if (relaxed.maxPrice) relaxed.maxPrice = Math.round(relaxed.maxPrice * 1.35);
        delete relaxed.color;
        matchingProducts = searchProducts(products, relaxed);
      }
      finalProductCards = matchingProducts.slice(0, 5).map(p => ({
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
    }

    // 2. Call Gemini API for dynamic, ChatGPT-quality conversational response
    if (geminiApiKey) {
      try {
        const promptText = `You are GitSole Concierge, an intelligent, empathetic, and friendly AI Assistant & Personal Shopper for GitSole e-commerce platform in Pakistan.

Customer message: "${message}"
Detected Intent: ${intent} (${subType})

${isProductSearch ? `Matching real products found in store inventory (${finalProductCards.length}): ${JSON.stringify(finalProductCards.map(p => ({ brand: p.brand, model: p.model, price: `PKR ${p.price}`, size: `UK ${p.sizeUK}` })))}` : 'No product cards attached.'}

CONVERSATIONAL RULES:
1. Answer naturally, warmly, intelligently, and conversationally like ChatGPT or Gemini.
2. If the user asks a casual question ("are you okay?", "how are you?", "tell me a joke", "what is your name?"), answer directly with warmth, humor, and personality!
3. If the user asks a GitSole store question (delivery, COD, tracking, returns, guarantee), answer accurately.
4. If recommending shoes, summarize the matches nicely in 1-2 sentences.
5. Keep your response concise (1 to 3 sentences) and never show technical JSON or internal code.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.7 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const gReply = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (gReply) {
            return res.status(200).json({
              success: true,
              reply: gReply,
              products: finalProductCards,
              appliedFilters: mergedFilters
            });
          }
        }
      } catch (err) {
        console.warn('[Gemini Chat Error]:', err.message);
      }
    }

    // Fallback Natural Language Replies if Gemini API key is pending
    let fallbackReply = '';
    if (intent === 'GREETING') {
      if (subType === 'ARE_YOU_OKAY') {
        fallbackReply = "I'm doing great, thank you for asking! 😊 I'm fully ready to help you discover your next pair of kicks. How can I help you today?";
      } else if (subType === 'HOW_ARE_YOU') {
        fallbackReply = "I'm doing awesome! 👟 Ready to help you hunt for clean sneakers or boots. What brand or size are you looking for?";
      } else if (subType === 'JOKE') {
        fallbackReply = "Why did the shoe go to school? To get a little more sole! 👟 Let me know if you'd like to find some clean shoes today!";
      } else {
        fallbackReply = "Hi there! Welcome to GitSole Concierge 👋 How can I help you find your next pair of shoes today?";
      }
    } else if (intent === 'GITSOLE_FAQ') {
      if (subType === 'DELIVERY') {
        fallbackReply = "Yes! We offer cash on delivery (COD) and free home delivery all over Pakistan. Delivery takes 3–5 working days.";
      } else if (subType === 'TRACKING') {
        fallbackReply = "You can track your GitSole order anytime by clicking 'Track Order' in our header menu or visiting our tracking page.";
      } else if (subType === 'AUTHENTICITY') {
        fallbackReply = "Every pair on GitSole is 100% hand-inspected for authenticity, cleanliness, and structural condition before listing!";
      } else if (subType === 'RETURNS') {
        fallbackReply = "We provide a 7-day hassle-free return and exchange guarantee. If your shoes don't fit or match expectations, we will replace or refund!";
      } else {
        fallbackReply = "You can chat with our team directly on WhatsApp at 0309-4376043 or email us at support@gitsole.pk!";
      }
    } else if (intent === 'VAGUE_SHOPPING') {
      fallbackReply = "Sure! What budget, size (e.g. UK 9 / 42), or preferred brand (Nike, Adidas, Jordan) are you looking for?";
    } else {
      const count = finalProductCards.length;
      fallbackReply = count > 0
        ? `I found ${count} pair${count > 1 ? 's' : ''} that match your preferences:`
        : `I couldn't find available shoes matching those exact criteria right now. What other budget or brand would you like to try?`;
    }

    return res.status(200).json({
      success: true,
      reply: fallbackReply,
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
