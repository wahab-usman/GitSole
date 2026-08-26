// Vercel Serverless Function: POST /api/chat-assistant
// AI Shopping Assistant backend for GitSole e-commerce platform with intent classification

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

    // Intent 1: Casual Greeting / Conversation
    if (intent === 'GREETING') {
      let greetingReply = "I'm doing great! 👟 I'm here to help you find the right pair from GitSole. What size, brand, or budget are you looking for today?";
      if (subType === 'GREETING') {
        greetingReply = "Hi! Welcome to GitSole Concierge 👋 How can I help you find your next pair of shoes today?";
      }
      return res.status(200).json({
        success: true,
        reply: greetingReply,
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Intent 2: GitSole Store FAQ & Support
    if (intent === 'GITSOLE_FAQ') {
      let faqReply = "GitSole offers curated branded thrift footwear with cash on delivery and free home delivery all over Pakistan!";
      if (subType === 'DELIVERY') {
        faqReply = "Yes! We offer cash on delivery (COD) and free home delivery all over Pakistan. Normal delivery takes 3–5 working days.";
      } else if (subType === 'TRACKING') {
        faqReply = "You can track your GitSole order anytime by clicking 'Track Order' in our header menu or visiting our tracking page.";
      } else if (subType === 'AUTHENTICITY') {
        faqReply = "Every pair on GitSole is 100% hand-inspected for authenticity, cleanliness, and structural condition before listing!";
      } else if (subType === 'RETURNS') {
        faqReply = "We provide a 7-day hassle-free return and exchange guarantee. If your shoes don't fit or match expectations, we will replace or refund!";
      } else if (subType === 'CONTACT') {
        faqReply = "You can chat with our team directly on WhatsApp at 0309-4376043 or email us at support@gitsole.pk!";
      }

      return res.status(200).json({
        success: true,
        reply: faqReply,
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Intent 3: Vague / Underspecified Shopping Request
    if (intent === 'VAGUE_SHOPPING') {
      return res.status(200).json({
        success: true,
        reply: "Sure! What is your budget, size (e.g. UK 9 / 42), or preferred brand (Nike, Adidas, Jordan)?",
        products: [],
        appliedFilters: contextFilters
      });
    }

    // Intent 4: Specific Product Search Request
    const newExtracted = parseNaturalLanguageText(message);
    const mergedFilters = {
      ...contextFilters,
      ...newExtracted
    };

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

    if (matchingProducts.length === 0 && (mergedFilters.maxPrice || mergedFilters.brand || mergedFilters.color)) {
      const relaxedFilters = { ...mergedFilters };
      if (relaxedFilters.maxPrice) {
        relaxedFilters.maxPrice = Math.round(relaxedFilters.maxPrice * 1.35);
      }
      delete relaxedFilters.color;

      const fallbackMatches = searchProducts(products, relaxedFilters);

      if (fallbackMatches.length > 0) {
        matchingProducts = fallbackMatches;
        relaxedSearchNotice = true;
      } else {
        matchingProducts = searchProducts(products, { status: 'available' }).slice(0, 4);
      }
    }

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

    // 3. Generate Clean Conversational Reply
    let aiReply = '';
    if (relaxedSearchNotice) {
      aiReply = `I couldn't find an exact match under your strict filter, but I found these closest options currently available in our store:`;
    } else if (finalProductCards.length > 0) {
      const count = finalProductCards.length;
      aiReply = `I found ${count} pair${count > 1 ? 's' : ''} that match your preferences:`;
    } else {
      aiReply = `I couldn't find available shoes matching those criteria right now, but feel free to adjust your budget or size!`;
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
