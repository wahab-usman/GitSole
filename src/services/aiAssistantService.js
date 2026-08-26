// Frontend Service Helper: AI Shopping Assistant
// Communicates with backend endpoint POST /api/chat-assistant with client-side fallback

import { searchProducts, parseNaturalLanguageText, detectUserIntent } from './productSearchEngine';

/**
 * Send customer message to AI Shopping Assistant API
 * @param {string} userMessage - Customer message text
 * @param {Array} history - Previous message objects in current session
 * @param {Object} contextFilters - Accumulated search filters
 * @param {Array} products - Local products array from ProductContext
 */
export async function sendChatMessageToAI(userMessage, history = [], contextFilters = {}, products = []) {
  try {
    // 1. Try backend serverless endpoint POST /api/chat-assistant
    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history,
          contextFilters,
          products
        })
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          return {
            success: true,
            reply: resData.reply,
            products: resData.products || [],
            appliedFilters: resData.appliedFilters || contextFilters
          };
        }
      }
    } catch (netErr) {
      console.warn('[Chat Assistant Serverless API unreachable, using client engine]:', netErr.message);
    }

    // 2. Client-side Intent Classification & Fallback Engine
    const { intent, subType } = detectUserIntent(userMessage);

    if (intent === 'GREETING') {
      let greetingReply = "I'm doing great! 👟 I'm here to help you find the right pair from GitSole. What size, brand, or budget are you looking for today?";
      if (subType === 'GREETING') {
        greetingReply = "Hi! Welcome to GitSole Concierge 👋 How can I help you find your next pair of shoes today?";
      }
      return {
        success: true,
        reply: greetingReply,
        products: [],
        appliedFilters: contextFilters
      };
    }

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

      return {
        success: true,
        reply: faqReply,
        products: [],
        appliedFilters: contextFilters
      };
    }

    if (intent === 'VAGUE_SHOPPING') {
      return {
        success: true,
        reply: "Sure! What is your budget, size (e.g. UK 9 / 42), or preferred brand (Nike, Adidas, Jordan)?",
        products: [],
        appliedFilters: contextFilters
      };
    }

    // Intent: PRODUCT_SEARCH
    const newExtracted = parseNaturalLanguageText(userMessage);

    const mergedFilters = {
      ...contextFilters,
      ...newExtracted
    };

    let matchingProducts = searchProducts(products, mergedFilters);
    let relaxedNotice = false;

    if (matchingProducts.length === 0 && (mergedFilters.maxPrice || mergedFilters.brand)) {
      const relaxed = { ...mergedFilters };
      if (relaxed.maxPrice) relaxed.maxPrice = Math.round(relaxed.maxPrice * 1.35);
      delete relaxed.color;

      const fallbackMatches = searchProducts(products, relaxed);
      if (fallbackMatches.length > 0) {
        matchingProducts = fallbackMatches;
        relaxedNotice = true;
      } else {
        matchingProducts = searchProducts(products, { status: 'available' }).slice(0, 4);
      }
    }

    const finalProducts = matchingProducts.slice(0, 5);

    let reply = '';
    if (relaxedNotice) {
      reply = `I couldn't find an exact match under your strict criteria, but I found these closest options currently available in our store:`;
    } else if (finalProducts.length > 0) {
      const count = finalProducts.length;
      reply = `I found ${count} pair${count > 1 ? 's' : ''} that match your preferences:`;
    } else {
      reply = `I couldn't find available shoes matching those criteria right now. What other budget or brand would you like to try?`;
    }

    return {
      success: true,
      reply,
      products: finalProducts,
      appliedFilters: mergedFilters
    };
  } catch (error) {
    console.error('[aiAssistantService Error]:', error);
    return {
      success: false,
      reply: "Sorry, I'm having trouble finding shoes right now. Please try again.",
      products: [],
      appliedFilters: contextFilters
    };
  }
}
