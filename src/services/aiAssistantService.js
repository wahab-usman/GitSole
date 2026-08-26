// Frontend Service Helper: AI Shopping Assistant
// Sends customer messages to backend API POST /api/chat-assistant with client-side fallback

import { searchProducts, parseNaturalLanguageText } from './productSearchEngine';

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

    // 2. Client-side Engine Fallback (Guaranteed to work everywhere with 100% real products)
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
      reply = `I couldn't find an exact match under your strict criteria, but I found these closest options currently available in our store!`;
    } else if (finalProducts.length > 0) {
      const brandStr = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      const priceStr = mergedFilters.maxPrice ? ` under PKR ${mergedFilters.maxPrice.toLocaleString()}` : '';
      const sizeStr = mergedFilters.sizeUK ? ` in size UK ${mergedFilters.sizeUK}` : '';
      reply = `Sure thing! Here are available ${brandStr}shoes${priceStr}${sizeStr} from GitSole:`;
    } else {
      reply = `I couldn't find shoes matching those exact criteria right now. What other budget or brand would you like to try?`;
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
