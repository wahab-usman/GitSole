// GitSole Product Search Engine & Inventory Filtering Utility
// Performs structured searches against actual GitSole database products with intent detection

/**
 * Classify user intent before calling database search
 * Intents:
 * - 'GREETING': Casual greetings ("hi", "how are you", "are you okay", "thanks")
 * - 'GITSOLE_FAQ': Delivery, tracking, authenticity, returns, contact info
 * - 'VAGUE_SHOPPING': "I need something good", "Show me shoes"
 * - 'PRODUCT_SEARCH': "Nike sneakers under 6000 size 9", "black shoes"
 */
export function detectUserIntent(userMessage = '') {
  const text = userMessage.toLowerCase().trim();

  // 1. Casual Greetings, Wellness & Pleasantries
  const greetingPhrases = [
    'hi', 'hello', 'hey', 'how are you', 'how r u', 'are you okay', 'are u ok', 'are you ok',
    'whatsup', "what's up", 'good morning', 'good evening', 'good afternoon', 'thanks', 'thank you',
    'ok', 'okay', 'cool', 'nice', 'great', 'bye', 'goodbye', 'who are you',
    'what is your name', 'tell me a joke', 'feeling good', 'how do you do'
  ];

  const isPureGreeting = greetingPhrases.some(g => text === g || text === `${g}!` || text === `${g}?` || text === `${g}.` || text.includes(g));
  if (isPureGreeting || text.startsWith('how are you') || text.startsWith('are you ok') || text.startsWith('hi ') || text.startsWith('hello ')) {
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

  // 2. GitSole Store FAQs & Support Questions
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
  if (text.includes('contact') || text.includes('phone') || text.includes('whatsapp') || text.includes('number') || text.includes('location') || text.includes('address')) {
    return { intent: 'GITSOLE_FAQ', subType: 'CONTACT' };
  }

  // 3. Check for specific Shopping Criteria (Price, Brand, Size, Color, Category)
  const hasPrice = /(?:under|below|max|budget|within|around|upto)?\s*(?:rs|pkr)?\s*(\d+(?:\.\d+)?\s*k|\d{4,5}|\d+\s*hazar)/.test(text) || text.includes('cheap') || text.includes('budget') || text.includes('rupees') || text.includes('price');
  const hasBrand = ['nike', 'jordan', 'adidas', 'new balance', 'puma', 'asics', 'reebok', 'timberland', 'vans', 'converse', 'yeezy'].some(b => text.includes(b));
  const hasSize = /(?:size|uk|eu)?\s*(4[0-6]|1[0-2]|[5-9](?:\.5)?)/.test(text);
  const hasColor = ['black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'wheat', 'brown', 'yellow'].some(c => text.includes(c));
  const hasCategory = ['sneaker', 'shoe', 'boot', 'runner', 'retro', 'dunk', 'force', 'gazelle', 'samba', '550', 'air max'].some(cat => text.includes(cat));
  const hasFollowUpKeyword = ['cheaper', 'similar', 'other', 'different', 'another', 'more', 'what about', 'any other'].some(k => text.includes(k));

  if (hasPrice || hasBrand || hasSize || hasColor || hasFollowUpKeyword) {
    return { intent: 'PRODUCT_SEARCH', subType: 'SPECIFIC' };
  }

  if (hasCategory) {
    if (text === 'shoes' || text === 'sneakers' || text === 'i need shoes' || text === 'i want shoes' || text === 'something good' || text === 'show me shoes') {
      return { intent: 'VAGUE_SHOPPING', subType: 'VAGUE' };
    }
    return { intent: 'PRODUCT_SEARCH', subType: 'CATEGORY' };
  }

  if (text.length < 15 && (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('thanks'))) {
    return { intent: 'GREETING', subType: 'GREETING' };
  }

  return { intent: 'GREETING', subType: 'CASUAL_CHAT' };
}

/**
 * Filter GitSole product inventory based on structured AI filters
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
    status = 'available'
  } = filters;

  if (!Array.isArray(products)) return [];

  const matching = products.filter((p) => {
    if (status === 'available' && p.status && p.status !== 'available') {
      return false;
    }

    if (brand && brand !== 'ALL' && brand.toLowerCase() !== 'all' && brand.toLowerCase() !== 'unknown') {
      const b = brand.toLowerCase().trim();
      const pBrand = (p.brand || '').toLowerCase().trim();
      if (!pBrand.includes(b) && !b.includes(pBrand)) {
        return false;
      }
    }

    const itemPrice = Number(p.price) || 0;
    if (typeof minPrice === 'number' && minPrice > 0 && itemPrice < minPrice) {
      return false;
    }
    if (typeof maxPrice === 'number' && maxPrice > 0 && itemPrice > maxPrice) {
      return false;
    }

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

    if (color && color.toLowerCase() !== 'all' && color.toLowerCase() !== 'unknown') {
      const c = color.toLowerCase().trim();
      const pColourway = (p.colourway || '').toLowerCase();
      const pModel = (p.model || '').toLowerCase();
      if (!pColourway.includes(c) && !pModel.includes(c)) {
        return false;
      }
    }

    if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'unknown') {
      const cat = category.toLowerCase().trim();
      const pModel = (p.model || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      if (cat.includes('boot') && !pModel.includes('boot') && !pBrand.includes('timberland')) {
        return false;
      }
    }

    if (query && typeof query === 'string' && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      const inBrand = (p.brand || '').toLowerCase().includes(q);
      const inModel = (p.model || '').toLowerCase().includes(q);
      const inColor = (p.colourway || '').toLowerCase().includes(q);
      const inNotes = (p.conditionNotes || '').toLowerCase().includes(q);
      const inCode = (p.code || '').toLowerCase().includes(q);
      if (!inBrand && !inModel && !inColor && !inNotes && !inCode) {
        return false;
      }
    }

    return true;
  });

  return matching;
}

export function parseNaturalLanguageText(userMessage = '') {
  const text = userMessage.toLowerCase();
  const filters = {};

  let maxPrice = null;
  let minPrice = null;

  const rangeMatch = text.match(/(?:between|from)?\s*(\d+(?:k)?)\s*(?:to|and|-)\s*(\d+(?:k)?)/);
  if (rangeMatch) {
    const minVal = parsePriceVal(rangeMatch[1]);
    const maxVal = parsePriceVal(rangeMatch[2]);
    if (minVal && maxVal) {
      minPrice = minVal;
      maxPrice = maxVal;
    }
  } else {
    const singlePriceMatch = text.match(/(?:under|below|max|budget|within|around|upto)?\s*(?:rs|pkr)?\s*(\d+(?:\.\d+)?\s*k|\d{4,5}|\d+\s*hazar)/);
    if (singlePriceMatch) {
      const rawPrice = singlePriceMatch[1];
      maxPrice = parsePriceVal(rawPrice);
    }
  }

  if (maxPrice) filters.maxPrice = maxPrice;
  if (minPrice) filters.minPrice = minPrice;

  const brands = ['nike', 'jordan', 'adidas', 'new balance', 'puma', 'asics', 'reebok', 'timberland', 'vans', 'converse', 'yeezy'];
  for (const b of brands) {
    if (text.includes(b)) {
      filters.brand = b === 'new balance' ? 'New Balance' : b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  const colors = ['black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'wheat', 'brown', 'gold', 'yellow', 'silver', 'pink'];
  for (const c of colors) {
    if (text.includes(c)) {
      filters.color = c === 'gray' ? 'grey' : c;
      break;
    }
  }

  const sizeMatch = text.match(/(?:size|uk|eu)?\s*(4[0-6]|1[0-2]|[5-9](?:\.5)?)/);
  if (sizeMatch) {
    filters.sizeUK = sizeMatch[1];
  }

  return filters;
}

function parsePriceVal(valStr) {
  if (!valStr) return null;
  const s = String(valStr).toLowerCase().trim();
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
