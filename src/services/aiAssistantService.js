// Frontend Service Helper: AI Shopping Assistant
// Communicates with backend endpoint POST /api/chat-assistant with client-side fallback

import { searchProducts, parseNaturalLanguageText, detectUserIntent } from './productSearchEngine.js';

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

    if (intent === 'BRAND_LIST') {
      const availableBrands = [...new Set(products.filter(p => p.status === 'available').map(p => p.brand))].filter(Boolean);
      const brandText = availableBrands.length > 0 ? availableBrands.join(', ') : 'Nike, Adidas, Jordan, New Balance, Timberland, Puma, Vans';
      return {
        success: true,
        reply: `We currently have curated pairs available from top brands including: ${brandText}. Which brand would you like to explore?`,
        products: [],
        appliedFilters: contextFilters
      };
    }

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
        faqReply = "You can chat with our team directly on WhatsApp at 0321-1123474 or email us at support@gitsole.pk!";
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
        reply: "Sure thing! What is your budget, size (e.g. UK 9 / 42), or preferred brand (Nike, Adidas, Jordan)?",
        products: [],
        appliedFilters: contextFilters
      };
    }

    // 3. Process Product Search & Sorting (MAX_PRICE, MIN_PRICE, PRODUCT_SEARCH, COUNT_QUERY)
    const newExtracted = parseNaturalLanguageText(userMessage);
    let mergedFilters = { ...contextFilters, ...newExtracted };

    if (intent === 'MAX_PRICE') {
      mergedFilters.sortBy = 'price';
      mergedFilters.sortOrder = 'desc';
      mergedFilters.limit = newExtracted.limit || (userMessage.toLowerCase().includes('3') ? 3 : (userMessage.toLowerCase().includes('5') ? 5 : 1));
      delete mergedFilters.maxPrice;
      delete mergedFilters.minPrice;
    } else if (intent === 'MIN_PRICE') {
      mergedFilters.sortBy = 'price';
      mergedFilters.sortOrder = 'asc';
      mergedFilters.limit = newExtracted.limit || (userMessage.toLowerCase().includes('3') ? 3 : (userMessage.toLowerCase().includes('5') ? 5 : 1));
      delete mergedFilters.minPrice;
      delete mergedFilters.maxPrice;
    }

    let matchingProducts = searchProducts(products, mergedFilters);
    let relaxedNotice = '';

    // Smart context unblocking: if combined filters yielded 0 results, retry with isolated new query
    if (matchingProducts.length === 0) {
      // 1. Try with fresh query filters only (ignore stale context)
      const freshMatches = searchProducts(products, newExtracted);
      if (freshMatches.length > 0) {
        matchingProducts = freshMatches;
        mergedFilters = { ...newExtracted };
        if (contextFilters.maxPrice && !newExtracted.maxPrice) {
          relaxedNotice = `We don't have ${newExtracted.brand || ''} pairs under your previous budget of Rs. ${contextFilters.maxPrice.toLocaleString()}, but here are the available ${newExtracted.brand || ''} pairs in stock:`.replace(/\s+/g, ' ');
        } else if (contextFilters.sizeUK && !newExtracted.sizeUK) {
          relaxedNotice = `We don't have ${newExtracted.brand || ''} in size UK ${contextFilters.sizeUK}, but here are other available pairs:`.replace(/\s+/g, ' ');
        }
      } else if (mergedFilters.brand) {
        // 2. Try brand alone
        const brandOnlyMatches = searchProducts(products, { brand: mergedFilters.brand });
        if (brandOnlyMatches.length > 0) {
          matchingProducts = brandOnlyMatches;
          mergedFilters = { brand: mergedFilters.brand };
          relaxedNotice = `Here are the available ${mergedFilters.brand} pairs currently in stock:`;
        }
      } else if (mergedFilters.maxPrice) {
        // 3. Relax price threshold by 35%
        const relaxed = { ...mergedFilters, maxPrice: Math.round(mergedFilters.maxPrice * 1.35) };
        delete relaxed.color;
        const fallbackMatches = searchProducts(products, relaxed);
        if (fallbackMatches.length > 0) {
          matchingProducts = fallbackMatches;
          mergedFilters = relaxed;
          relaxedNotice = `I couldn't find an exact match under your strict criteria, but I found these closest options:`;
        }
      }
    }

    if (intent === 'COUNT_QUERY') {
      const count = matchingProducts.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      return {
        success: true,
        reply: `We currently have ${count} available ${brandMention}pair${count !== 1 ? 's' : ''} in our GitSole inventory.`,
        products: matchingProducts.slice(0, 5),
        appliedFilters: mergedFilters
      };
    }

    const finalProducts = matchingProducts;

    let reply = '';
    if (intent === 'MAX_PRICE') {
      const count = finalProducts.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      reply = count > 1
        ? `Here are our top ${count} highest-priced ${brandMention}available pairs:`
        : `Here is the highest-priced available ${brandMention}pair currently in our store:`;
    } else if (intent === 'MIN_PRICE') {
      const count = finalProducts.length;
      const brandMention = mergedFilters.brand ? `${mergedFilters.brand} ` : '';
      reply = count > 1
        ? `Here are our top ${count} most affordable ${brandMention}available pairs:`
        : `Here is the most affordable available ${brandMention}pair currently in our store:`;
    } else if (relaxedNotice) {
      reply = relaxedNotice;
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
