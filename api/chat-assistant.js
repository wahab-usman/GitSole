// Vercel Serverless Function: POST /api/chat-assistant
// AI Shopping Assistant backend for GitSole e-commerce platform with MAX_PRICE, MIN_PRICE, and BRAND_LIST intents

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
    const intentResult = detectUserIntent(message);
    const { intent, subType } = intentResult;
    const geminiApiKey = process.env.GEMINI_API_KEY || '';

    // Handle BRAND_LIST Intent
    if (intent === 'BRAND_LIST') {
      const availableBrands = [...new Set(products.filter(p => p.status === 'available').map(p => p.brand))].filter(Boolean);
      const brandText = availableBrands.length > 0 ? availableBrands.join(', ') : 'Nike, Adidas, Jordan, New Balance, Timberland, Puma, Vans';
      return res.status(200).json({
        success: true,
        reply: `We currently have curated pairs available from top brands including: ${brandText}. Which brand would you like to explore?`,
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Handle GREETING Intent
    if (intent === 'GREETING') {
      let greetingReply = "I'm doing great, thank you for asking! 😊 I'm here to help you find your next pair of kicks from GitSole. What size, brand, or budget are you looking for today?";
      if (subType === 'ARE_YOU_OKAY') {
        greetingReply = "I'm doing great, thank you for checking! 😊 I'm fully ready to help you discover your next favourite pair of kicks on GitSole. How can I help you today?";
      } else if (subType === 'HOW_ARE_YOU') {
        greetingReply = "I'm doing awesome! 👟 Ready to help you hunt for clean sneakers or boots. What brand or size are you looking for?";
      } else if (subType === 'JOKE') {
        greetingReply = "Why did the shoe go to school? To get a little more sole! 👟 Let me know if you'd like to find some clean shoes today!";
      } else if (subType === 'GREETING') {
        greetingReply = "Hi there! Welcome to GitSole Concierge 👋 How can I help you find your next pair of shoes today?";
      }
      return res.status(200).json({
        success: true,
        reply: greetingReply,
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Handle GITSOLE FAQ Intent
    if (intent === 'GITSOLE_FAQ') {
      let faqReply = "GitSole offers curated branded thrift footwear with cash on delivery and free home delivery all over Pakistan!";
      if (subType === 'DELIVERY') {
        faqReply = "Yes! We offer cash on delivery (COD) and free home delivery all over Pakistan. Delivery takes 3–5 working days.";
      } else if (subType === 'TRACKING') {
        faqReply = "You can track your GitSole order anytime by clicking 'Track Order' in our header menu or visiting our tracking page.";
      } else if (subType === 'AUTHENTICITY') {
        faqReply = "Every pair on GitSole is 100% hand-inspected for authenticity, cleanliness, and structural condition before listing!";
      } else if (subType === 'RETURNS') {
        faqReply = "We provide a 7-day hassle-free return and exchange guarantee. If your shoes don't fit or match expectations, we will replace or refund!";
      } else {
        faqReply = "You can chat with our team directly on WhatsApp at 0321-1123474 or email us at support@gitsole.pk!";
      }
      return res.status(200).json({
        success: true,
        reply: faqReply,
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Handle VAGUE SHOPPING Intent
    if (intent === 'VAGUE_SHOPPING') {
      return res.status(200).json({
        success: true,
        reply: "Sure thing! What is your budget, size (e.g. UK 9 / 42), or preferred brand (Nike, Adidas, Jordan)?",
        products: [],
        appliedFilters: contextFilters
      });
    }

    // 2. Shopping Query (MAX_PRICE, MIN_PRICE, PRODUCT_SEARCH, COUNT_QUERY)
    const newExtracted = parseNaturalLanguageText(message);

    // Context handling: If asking broader MAX_PRICE or MIN_PRICE, don't let old budget filters block it unless explicitly requested
    let mergedFilters = { ...contextFilters, ...newExtracted };

    if (intent === 'MAX_PRICE') {
      mergedFilters.sortBy = 'price';
      mergedFilters.sortOrder = 'desc';
      mergedFilters.limit = newExtracted.limit || (message.toLowerCase().includes('3') ? 3 : (message.toLowerCase().includes('5') ? 5 : 1));
      delete mergedFilters.maxPrice; // Do not apply maxPrice ceiling when asking for highest price
    } else if (intent === 'MIN_PRICE') {
      mergedFilters.sortBy = 'price';
      mergedFilters.sortOrder = 'asc';
      mergedFilters.limit = newExtracted.limit || (message.toLowerCase().includes('3') ? 3 : (message.toLowerCase().includes('5') ? 5 : 1));
      delete mergedFilters.minPrice;
    }

    let matchingProducts = searchProducts(products, mergedFilters);
    let relaxedSearchNotice = null;

    if (matchingProducts.length === 0 && intent === 'PRODUCT_SEARCH' && (mergedFilters.maxPrice || mergedFilters.brand)) {
      const relaxed = { ...mergedFilters };
      if (relaxed.maxPrice) relaxed.maxPrice = Math.round(relaxed.maxPrice * 1.35);
      delete relaxed.color;
      matchingProducts = searchProducts(products, relaxed);
      if (matchingProducts.length > 0) relaxedSearchNotice = true;
    }

    // If COUNT_QUERY intent
    if (intent === 'COUNT_QUERY') {
      const count = matchingProducts.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      return res.status(200).json({
        success: true,
        reply: `We currently have ${count} available ${brandMention}pair${count !== 1 ? 's' : ''} in our GitSole inventory.`,
        products: matchingProducts.slice(0, 5),
        appliedFilters: mergedFilters
      });
    }

    const finalProductCards = matchingProducts.map(p => ({
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

    // 3. Gemini API Chat Response Generation
    if (geminiApiKey) {
      try {
        const promptText = `You are GitSole Concierge, an intelligent AI Personal Shopper for GitSole.
User message: "${message}"
Intent: ${intent}

Matching products found in store (${finalProductCards.length}): ${JSON.stringify(finalProductCards.map(p => ({ brand: p.brand, model: p.model, price: `PKR ${p.price}`, size: `UK ${p.sizeUK}` })))}

RULES:
1. Speak naturally, warmly, and concisely like ChatGPT (1-2 sentences).
2. If MAX_PRICE intent: "Here is our highest-priced available pair:" or "Here are our top highest-priced pairs:"
3. If MIN_PRICE intent: "Here is our most affordable pair currently available:"
4. Never show technical JSON or internal code.`;

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

    // Default Fallback Replies
    let fallbackReply = '';
    if (intent === 'MAX_PRICE') {
      const count = finalProductCards.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      fallbackReply = count > 1
        ? `Here are our top ${count} highest-priced ${brandMention}available pairs:`
        : `Here is the highest-priced available ${brandMention}pair currently in our store:`;
    } else if (intent === 'MIN_PRICE') {
      const count = finalProductCards.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      fallbackReply = count > 1
        ? `Here are our top ${count} most affordable ${brandMention}available pairs:`
        : `Here is the most affordable available ${brandMention}pair currently in our store:`;
    } else if (relaxedSearchNotice) {
      fallbackReply = `I couldn't find an exact match under your strict filter, but I found these closest options currently available in our store:`;
    } else if (finalProductCards.length > 0) {
      const count = finalProductCards.length;
      fallbackReply = `I found ${count} pair${count > 1 ? 's' : ''} that match your preferences:`;
    } else {
      fallbackReply = `I couldn't find available shoes matching those criteria right now. What other budget or brand would you like to try?`;
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
