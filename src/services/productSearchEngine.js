// GitSole Product Search Engine & Inventory Filtering Utility
// Performs structured searches against actual GitSole database products

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

  // Filter products strictly from active database
  const matching = products.filter((p) => {
    // 1. Availability Filter: Only available products (unless explicitly asking for all)
    if (status === 'available' && p.status && p.status !== 'available') {
      return false;
    }

    // 2. Brand Filter
    if (brand && brand !== 'ALL' && brand.toLowerCase() !== 'all' && brand.toLowerCase() !== 'unknown') {
      const b = brand.toLowerCase().trim();
      const pBrand = (p.brand || '').toLowerCase().trim();
      if (!pBrand.includes(b) && !b.includes(pBrand)) {
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

    // 4. Size Filter (Handles UK sizes and EU size mappings e.g. 42 -> UK 8, 43 -> UK 9)
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

    // 6. Category Filter (e.g. Sneakers, Boots)
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
      const inCode = (p.code || '').toLowerCase().includes(q);
      if (!inBrand && !inModel && !inColor && !inNotes && !inCode) {
        return false;
      }
    }

    return true;
  });

  return matching;
}

/**
 * Parse natural language user text into numeric price & filter values
 */
export function parseNaturalLanguageText(userMessage = '') {
  const text = userMessage.toLowerCase();
  const filters = {};

  // 1. Budget parsing (e.g., "5k", "5000", "5 hazar", "under 5000", "between 4k and 6k", "around 5k")
  let maxPrice = null;
  let minPrice = null;

  // Range match: "between 4000 and 6000" or "4k to 6k"
  const rangeMatch = text.match(/(?:between|from)?\s*(\d+(?:k)?)\s*(?:to|and|-)\s*(\d+(?:k)?)/);
  if (rangeMatch) {
    const minVal = parsePriceVal(rangeMatch[1]);
    const maxVal = parsePriceVal(rangeMatch[2]);
    if (minVal && maxVal) {
      minPrice = minVal;
      maxPrice = maxVal;
    }
  } else {
    // "under 5k", "below 5000", "max 6000", "5000 rupees", "5k budget", "5 hazar"
    const singlePriceMatch = text.match(/(?:under|below|max|budget|within|around|upto)?\s*(?:rs|pkr)?\s*(\d+(?:\.\d+)?\s*k|\d{4,5}|\d+\s*hazar)/);
    if (singlePriceMatch) {
      const rawPrice = singlePriceMatch[1];
      maxPrice = parsePriceVal(rawPrice);
    }
  }

  if (maxPrice) filters.maxPrice = maxPrice;
  if (minPrice) filters.minPrice = minPrice;

  // 2. Brand detection
  const brands = ['nike', 'jordan', 'adidas', 'new balance', 'puma', 'asics', 'reebok', 'timberland', 'vans', 'converse', 'yeezy'];
  for (const b of brands) {
    if (text.includes(b)) {
      filters.brand = b === 'new balance' ? 'New Balance' : b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // 3. Color detection
  const colors = ['black', 'white', 'red', 'blue', 'green', 'grey', 'gray', 'wheat', 'brown', 'gold', 'yellow', 'silver', 'pink'];
  for (const c of colors) {
    if (text.includes(c)) {
      filters.color = c === 'gray' ? 'grey' : c;
      break;
    }
  }

  // 4. Size detection ("size 9", "uk 8", "size 42", "43")
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
