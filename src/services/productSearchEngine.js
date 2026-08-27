// GitSole Product Search Engine & Inventory Filtering Utility
// Performs structured searches against actual GitSole database products with advanced intent detection & sorting

/**
 * Classify user intent before calling database search
 * Intents:
 * - 'MAX_PRICE': "most expensive shoe", "expensive shoe", "maximum budget shoes", "highest priced"
 * - 'MIN_PRICE': "cheapest shoe", "least expensive", "lowest priced", "something cheap"
 * - 'BRAND_LIST': "what brands do you have?", "available brands"
 * - 'COUNT_QUERY': "how many Nike shoes do you have?"
 * - 'GREETING': Pure greetings ("hi", "how are you", "are you okay", "thanks")
 * - 'GITSOLE_FAQ': Delivery, tracking, authenticity, returns, contact info
 * - 'VAGUE_SHOPPING': "I need something good", "I have 5000 find me something good"
 * - 'PRODUCT_SEARCH': "Nike sneakers under 6000 size 9", "black shoes", "i need nike shoe", "nike"
 */
export function detectUserIntent(userMessage = '') {
  const text = (userMessage || '').toLowerCase().trim();
  if (!text) return { intent: 'GREETING', subType: 'EMPTY' };

  // 1. Check for MAX_PRICE / EXPENSIVE Intent FIRST
  if (
    text.includes('most expensive') ||
    text.includes('expensive shoe') ||
    text.includes('maximum budget') ||
    text.includes('highest price') ||
    text.includes('highest priced') ||
    text.includes('costliest') ||
    text.includes('most costly') ||
    text.includes('expensive pair')
  ) {
    return { intent: 'MAX_PRICE', sortBy: 'price', sortOrder: 'desc' };
  }

  // 2. Check for MIN_PRICE / CHEAPEST Intent
  if (
    text.includes('cheapest') ||
    text.includes('least expensive') ||
    text.includes('lowest price') ||
    text.includes('lowest priced') ||
    text.includes('most affordable') ||
    text.includes('something cheap') ||
    text.includes('cheap shoe') ||
    text.includes('cheapest pair')
  ) {
    return { intent: 'MIN_PRICE', sortBy: 'price', sortOrder: 'asc' };
  }

  // 3. Check for BRAND_LIST Intent
  if (
    text.includes('what brands') ||
    text.includes('which brands') ||
    text.includes('list of brands') ||
    text.includes('available brands') ||
    text.includes('brands do you have') ||
    text === 'brands' ||
    text === 'brand'
  ) {
    return { intent: 'BRAND_LIST' };
  }

  // 4. Check for COUNT_QUERY Intent
  if (text.includes('how many') && (text.includes('shoe') || text.includes('nike') || text.includes('adidas') || text.includes('pair') || text.includes('item') || text.includes('stock'))) {
    return { intent: 'COUNT_QUERY' };
  }

  // 5. GitSole Store FAQs & Support Questions
  if (text.includes('deliver') || text.includes('shipping') || text.includes('cod') || text.includes('cash on delivery') || text.includes('all over pakistan')) {
    return { intent: 'GITSOLE_FAQ', subType: 'DELIVERY' };
  }
  if (text.includes('track') || text.includes('tracking') || text.includes('order status') || text.includes('where is my order')) {
    return { intent: 'GITSOLE_FAQ', subType: 'TRACKING' };
  }
  if (text.includes('original') || text.includes('authentic') || text.includes('real') || text.includes('copy') || text.includes('fake') || text.includes('guarantee')) {
    return { intent: 'GITSOLE_FAQ', subType: 'AUTHENTICITY' };
  }
  if (text.includes('return') || text.includes('exchange') || text.includes('refund') || text.includes('policy')) {
    return { intent: 'GITSOLE_FAQ', subType: 'RETURNS' };
  }
  if (text.includes('contact') || text.includes('phone') || text.includes('whatsapp') || text.includes('number') || text.includes('location') || text.includes('address') || text.includes('helpline')) {
    return { intent: 'GITSOLE_FAQ', subType: 'CONTACT' };
  }

  // 6. Shopping Indicators (Brand, Price, Size, Color, Category, Deals)
  const brands = ['nike', 'jordan', 'adidas', 'new balance', 'puma', 'asics', 'reebok', 'timberland', 'vans', 'converse', 'yeezy', 'onitsuka', 'hoka', 'salomon'];
  const hasBrand = brands.some(b => new RegExp(`\\b${b}\\b`, 'i').test(text));
  const shoppingWords = [
    'shoe', 'shoes', 'sneaker', 'sneakers', 'pair', 'pairs', 'kicks', 'boot', 'boots',
    'dunk', 'force', 'trainer', 'trainers', 'footwear', 'deal', 'deals', 'pick', 'picks',
    'find', 'show', 'recommend', 'recommendation', 'recommendations', 'collection', 'catalog',
    'discount', 'sale', 'trending', 'popular', 'suggest', 'buy', 'shop', 'browse'
  ];
  const hasShoppingKeywords = shoppingWords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(text));
  const hasPrice = /(?:under|below|max|maximum|budget|within|around|upto|less than)?\s*(?:rs\.?|pkr\.?)?\s*(\d+(?:\.\d+)?\s*k|\d{4,6}|\d+\s*hazar)/i.test(text) || text.includes('cheap') || text.includes('budget') || text.includes('rupees') || text.includes('price');
  const hasExplicitSize = /\b(?:size|uk|eu|us)\s*[:#\-]?\s*(4[0-6]|1[0-3]|[5-9](?:\.5)?)\b/i.test(text);
  const hasColor = ['black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'wheat', 'brown', 'yellow', 'pink'].some(c => new RegExp(`\\b${c}\\b`, 'i').test(text));

  if (hasShoppingKeywords || hasPrice || hasBrand || hasExplicitSize || hasColor) {
    if (text === 'something good' || text === 'i need something good') {
      return { intent: 'VAGUE_SHOPPING', subType: 'VAGUE' };
    }
    if (text.includes('deal') || text.includes('best deal')) {
      return { intent: 'PRODUCT_SEARCH', subType: 'DEALS', sortBy: 'price', sortOrder: 'asc' };
    }
    return { intent: 'PRODUCT_SEARCH', subType: 'SPECIFIC' };
  }

  // 7. Casual Greetings ONLY if strictly greeting phrases
  const greetingPhrases = [
    'hi', 'hello', 'hey', 'how are you', 'how r u', 'are you okay', 'are u ok', 'are you ok',
    'whatsup', "what's up", 'good morning', 'good evening', 'good afternoon', 'thanks', 'thank you',
    'ok', 'okay', 'cool', 'nice', 'great', 'bye', 'goodbye', 'who are you',
    'what is your name', 'tell me a joke'
  ];

  const isPureGreeting = greetingPhrases.some(g => text === g || text === `${g}!` || text === `${g}?` || text === `${g}.`);
  if (isPureGreeting || /^(hi|hello|hey|greetings|thanks|thank you)\b/i.test(text)) {
    let subType = 'GREETING';
    if (text.includes('are you ok') || text.includes('are u ok') || text.includes('are you okay')) {
      subType = 'ARE_YOU_OKAY';
    } else if (text.includes('how are you') || text.includes('how r u')) {
      subType = 'HOW_ARE_YOU';
    } else if (text.includes('joke')) {
      subType = 'JOKE';
    }
    return { intent: 'GREETING', subType };
  }

  return { intent: 'PRODUCT_SEARCH', subType: 'GENERAL' };
}

/**
 * Filter GitSole product inventory based on structured AI filters with sorting & limit
 * @param {Array} products - List of product objects from database/context
 * @param {Object} filters - Filter criteria extracted by AI or user inputs
 */
export function searchProducts(products = [], filters = {}) {
  const {
    brand,
    minPrice,
    maxPrice,
    sizeUK,
    color,
    query,
    category,
    status = 'available',
    sortBy = null,
    sortOrder = 'desc',
    limit = null
  } = filters;

  if (!Array.isArray(products)) return [];

  let matching = products.filter((p) => {
    // 1. Availability Filter
    if (status === 'available' && p.status && p.status !== 'available') {
      return false;
    }

    // 2. Robust Brand Filter
    if (brand && brand !== 'ALL' && brand.toLowerCase() !== 'all' && brand.toLowerCase() !== 'unknown') {
      const b = brand.toLowerCase().trim();
      const pBrand = (p.brand || '').toLowerCase().trim();
      const pModel = (p.model || '').toLowerCase().trim();
      const cleanBrandQuery = b.replace(/\b(shoe|shoes|sneaker|sneakers|pair|footwear|brand)\b/gi, '').trim();

      const brandMatches = pBrand.includes(cleanBrandQuery) ||
                           cleanBrandQuery.includes(pBrand) ||
                           pModel.includes(cleanBrandQuery) ||
                           (cleanBrandQuery === 'nike' && (pBrand === 'jordan' || pModel.includes('jordan'))) ||
                           (cleanBrandQuery === 'jordan' && (pBrand === 'nike' || pModel.includes('jordan')));

      if (!brandMatches) {
        return false;
      }
    }

    // 3. Price Filter
    const itemPrice = Number(p.price) || 0;
    if (typeof minPrice === 'number' && minPrice > 0 && itemPrice < minPrice) {
      return false;
    }
    if (typeof maxPrice === 'number' && maxPrice > 0 && itemPrice > maxPrice) {
      return false;
    }

    // 4. Size Filter (UK / EU size mapping)
    if (sizeUK) {
      const cleanInput = String(sizeUK).toLowerCase().replace(/uk|us|size|\s/g, '').trim();
      const pSize = String(p.sizeUK || '').toLowerCase().trim();

      const euToUk = {
        '39': '5.5',
        '40': '6',
        '41': '7',
        '42': '8',
        '43': '9',
        '44': '10',
        '45': '11',
        '46': '12'
      };

      const normalizedInput = euToUk[cleanInput] || cleanInput;
      if (pSize && normalizedInput && pSize !== normalizedInput) {
        return false;
      }
    }

    // 5. Color Filter
    if (color && color.toLowerCase() !== 'all' && color.toLowerCase() !== 'unknown') {
      const c = color.toLowerCase().trim();
      const pColourway = (p.colourway || '').toLowerCase();
      const pModel = (p.model || '').toLowerCase();
      if (!pColourway.includes(c) && !pModel.includes(c)) {
        return false;
      }
    }

    // 6. Category Filter
    if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'unknown') {
      const cat = category.toLowerCase().trim();
      const pModel = (p.model || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      if (cat.includes('boot') && !pModel.includes('boot') && !pBrand.includes('timberland')) {
        return false;
      }
    }

    // 7. General Text Search Query
    if (query && typeof query === 'string' && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      const inBrand = (p.brand || '').toLowerCase().includes(q);
      const inModel = (p.model || '').toLowerCase().includes(q);
      const inColor = (p.colourway || '').toLowerCase().includes(q);
      const inNotes = (p.conditionNotes || '').toLowerCase().includes(q);
      if (!inBrand && !inModel && !inColor && !inNotes) {
        return false;
      }
    }

    return true;
  });

  // 8. Sorting Logic
  if (sortBy === 'price') {
    matching.sort((a, b) => {
      const pA = Number(a.price) || 0;
      const pB = Number(b.price) || 0;
      return sortOrder === 'asc' ? pA - pB : pB - pA;
    });
  }

  // 9. Limit Logic
  if (typeof limit === 'number' && limit > 0) {
    matching = matching.slice(0, limit);
  }

  return matching;
}

/**
 * Parse natural language user text into numeric price & filter values
 */
export function parseNaturalLanguageText(userMessage = '') {
  const text = (userMessage || '').toLowerCase().trim();
  const filters = {};

  let maxPrice = null;
  let minPrice = null;

  // 1. Price Range: "between 4000 and 8000", "4k to 8k", "5000 - 9000", "from 5k to 10k"
  const rangeMatch = text.match(/(?:between|from)?\s*(\d+(?:\.\d+)?\s*k|\d{4,6})\s*(?:to|and|-)\s*(\d+(?:\.\d+)?\s*k|\d{4,6})/i);
  if (rangeMatch) {
    const minVal = parsePriceVal(rangeMatch[1]);
    const maxVal = parsePriceVal(rangeMatch[2]);
    if (minVal && maxVal) {
      minPrice = minVal;
      maxPrice = maxVal;
    }
  } else {
    // 2. Single Price Match
    const cleanedText = text.replace(/,/g, '');
    const singlePriceMatch = cleanedText.match(/(?:under|below|max|maximum|budget|within|around|upto|less than|up to)?\s*(?:rs\.?|pkr\.?)?\s*(\d+(?:\.\d+)?\s*k|\d{4,6}|\d+\s*hazar)\s*(?:rs\.?|pkr|rupees)?/i);
    if (singlePriceMatch) {
      const matchedStr = singlePriceMatch[0];
      const isPriceContext = /(?:under|below|max|maximum|budget|within|around|upto|less than|up to|rs|pkr|rupees|price|k\b|hazar|\d{4,6})/i.test(matchedStr);
      if (isPriceContext) {
        maxPrice = parsePriceVal(singlePriceMatch[1]);
      }
    }
  }

  if (maxPrice) filters.maxPrice = maxPrice;
  if (minPrice) filters.minPrice = minPrice;

  // Extract Brand
  const brands = [
    'new balance',
    'air jordan',
    'jordan',
    'nike',
    'adidas',
    'timberland',
    'puma',
    'asics',
    'reebok',
    'vans',
    'converse',
    'yeezy'
  ];

  for (const b of brands) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(text)) {
      if (b === 'new balance') filters.brand = 'New Balance';
      else if (b === 'air jordan' || b === 'jordan') filters.brand = 'Jordan';
      else filters.brand = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // Extract Limit (e.g. "top 3", "show me 5")
  const limitMatch = text.match(/(?:top|show me|find|get|best)\s*(\d+)/i);
  if (limitMatch) {
    filters.limit = parseInt(limitMatch[1], 10);
  }

  // Extract Color
  const colors = ['black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'wheat', 'brown', 'gold', 'yellow', 'silver', 'pink'];
  for (const c of colors) {
    const colorRegex = new RegExp(`\\b${c}\\b`, 'i');
    if (colorRegex.test(text)) {
      filters.color = c === 'gray' ? 'grey' : c;
      break;
    }
  }

  // Extract Size safely (Ensure price numbers like 5000 don't get misparsed as size 5!)
  let textForSize = text
    .replace(/,/g, '')
    .replace(/(?:between|from)?\s*(\d+(?:\.\d+)?\s*k|\d{4,6})\s*(?:to|and|-)\s*(\d+(?:\.\d+)?\s*k|\d{4,6})/gi, ' ')
    .replace(/(?:under|below|max|budget|within|around|upto|less than)?\s*(?:rs\.?|pkr\.?)?\s*(\d+(?:\.\d+)?\s*k|\d{4,6}|\d+\s*hazar)\s*(?:rs\.?|pkr|rupees)?/gi, ' ')
    .replace(/\b\d{4,6}\b/g, ' ')
    .replace(/\b\d+\s*k\b/gi, ' ');

  // 1. Explicit size: "size 9", "size 9.5", "uk 9", "eu 42", "size: 9"
  const explicitSizeMatch = textForSize.match(/\b(?:size|uk|eu|us)\s*[:#\-]?\s*(4[0-6]|1[0-3]|[5-9](?:\.5)?)\b/i);
  if (explicitSizeMatch) {
    filters.sizeUK = explicitSizeMatch[1];
  } else {
    // 2. Standalone size number (only when explicitly requested like "in 9", "size 9.5")
    const standaloneSizeMatch = textForSize.match(/\b(?:in|a|for)?\s*(4[0-6]|1[0-3]|[6-9]\.5|[7-9])\b/i);
    if (standaloneSizeMatch && !text.includes('top ' + standaloneSizeMatch[1]) && !text.includes('best ' + standaloneSizeMatch[1])) {
      filters.sizeUK = standaloneSizeMatch[1];
    }
  }

  return filters;
}

function parsePriceVal(valStr) {
  if (!valStr) return null;
  const s = String(valStr).toLowerCase().trim().replace(/,/g, '');
  if (s.includes('k')) {
    const num = parseFloat(s.replace('k', ''));
    return num ? Math.round(num * 1000) : null;
  }
  if (s.includes('hazar')) {
    const num = parseFloat(s.replace('hazar', ''));
    return num ? Math.round(num * 1000) : null;
  }
  const num = parseInt(s.replace(/[^\d]/g, ''), 10);
  return num > 100 ? num : null;
}
