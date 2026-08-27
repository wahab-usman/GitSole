// AI Tools Engine for GitSole Concierge
// Authoritative, verified database functions called by Google Gemini AI

import { searchProducts as filterDbProducts, parseNaturalLanguageText } from './productSearchEngine.js';

/**
 * Gemini Function Declarations for Tool-Calling
 */
export const AI_TOOL_DECLARATIONS = [
  {
    name: 'searchProducts',
    description: 'Search GitSole live product inventory for thrift sneakers and boots matching specific criteria. Returns real verified products from the database.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'General keyword search e.g. "Air Max", "Samba", "running"' },
        brand: { type: 'STRING', description: 'Specific brand name e.g. "Nike", "Adidas", "Jordan", "New Balance", "Timberland", "Puma", "Vans", "Salomon"' },
        category: { type: 'STRING', description: 'Category e.g. "Sneakers", "Boots", "Running", "Retro"' },
        color: { type: 'STRING', description: 'Color e.g. "black", "white", "red", "blue", "grey", "brown"' },
        sizeUK: { type: 'NUMBER', description: 'Shoe size in UK format e.g. 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11' },
        minPrice: { type: 'NUMBER', description: 'Minimum price in PKR' },
        maxPrice: { type: 'NUMBER', description: 'Maximum price/budget in PKR' },
        condition: { type: 'STRING', description: 'Condition tier or minimum score' },
        limit: { type: 'NUMBER', description: 'Maximum number of items to return (default 4, max 6)' }
      }
    }
  },
  {
    name: 'getProduct',
    description: 'Get verified complete product details for a specific product ID/code (e.g. "GS-0430" or "GS-808").',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'Exact GitSole product code / ID' }
      },
      required: ['productId']
    }
  },
  {
    name: 'checkAvailability',
    description: 'Check actual stock status and available size for a specific product ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'Product code / ID' },
        sizeUK: { type: 'NUMBER', description: 'Optional size in UK format to verify' }
      },
      required: ['productId']
    }
  },
  {
    name: 'searchByBudget',
    description: 'Search available shoes strictly within a customer budget in PKR.',
    parameters: {
      type: 'OBJECT',
      properties: {
        budget: { type: 'NUMBER', description: 'Maximum budget in PKR (e.g. 8000, 10000)' },
        sizeUK: { type: 'NUMBER', description: 'Optional UK shoe size' },
        brand: { type: 'STRING', description: 'Optional preferred brand' },
        limit: { type: 'NUMBER', description: 'Maximum items to return (default 4)' }
      },
      required: ['budget']
    }
  },
  {
    name: 'getSimilarProducts',
    description: 'Find alternative or similar shoes based on a product code or brand/category.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'Reference product code' },
        budget: { type: 'NUMBER', description: 'Optional budget in PKR' },
        sizeUK: { type: 'NUMBER', description: 'Optional UK size' },
        limit: { type: 'NUMBER', description: 'Maximum items to return (default 4)' }
      },
      required: ['productId']
    }
  },
  {
    name: 'addToCart',
    description: 'Add a verified product to the customer shopping bag when explicitly requested.',
    parameters: {
      type: 'OBJECT',
      properties: {
        productId: { type: 'STRING', description: 'The exact product code / ID to add to cart' }
      },
      required: ['productId']
    }
  },
  {
    name: 'getCart',
    description: 'Get the current items currently in customer shopping cart.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  }
];

/**
 * Format raw database product into verified clean product summary for AI
 */
function sanitizeProductForAI(p) {
  if (!p) return null;
  return {
    code: p.code,
    brand: p.brand,
    model: p.model,
    colourway: p.colourway || '',
    sizeUK: p.sizeUK,
    sizeEU: p.sizeEU || '',
    sizeUS: p.sizeUS || '',
    price: p.price,
    retailPrice: p.retailPrice || null,
    score: p.score || '9.0',
    tier: p.tier || 'Excellent',
    status: p.status || 'available',
    conditionDetails: p.conditionDetails || `Condition score: ${p.score || '9.0'}/10`,
    photo: p.photos?.[0] || p.photo || '',
    url: `/product/${p.code}`
  };
}

/**
 * Execute tool requests against verified database products and cart
 */
export function executeTool(toolName, args = {}, products = [], cartItems = []) {
  const availableProducts = Array.isArray(products) ? products : [];

  switch (toolName) {
    case 'searchProducts': {
      const limit = Math.min(Math.max(Number(args.limit) || 4, 1), 6);
      const filters = {
        query: args.query,
        brand: args.brand,
        category: args.category,
        color: args.color,
        sizeUK: args.sizeUK ? Number(args.sizeUK) : undefined,
        minPrice: args.minPrice ? Number(args.minPrice) : undefined,
        maxPrice: args.maxPrice ? Number(args.maxPrice) : undefined,
        limit
      };

      const matches = filterDbProducts(availableProducts, filters);
      const deduplicated = [];
      const seen = new Set();

      for (const item of matches) {
        if (!seen.has(item.code)) {
          seen.add(item.code);
          deduplicated.push(sanitizeProductForAI(item));
        }
      }

      return {
        foundCount: deduplicated.length,
        products: deduplicated.slice(0, limit)
      };
    }

    case 'getProduct': {
      const code = String(args.productId || '').trim().toUpperCase();
      const product = availableProducts.find(p => p.code?.toUpperCase() === code);

      if (!product) {
        return {
          found: false,
          error: `Product with ID '${args.productId}' was not found in the live inventory database.`
        };
      }

      return {
        found: true,
        product: sanitizeProductForAI(product)
      };
    }

    case 'checkAvailability': {
      const code = String(args.productId || '').trim().toUpperCase();
      const product = availableProducts.find(p => p.code?.toUpperCase() === code);

      if (!product) {
        return {
          found: false,
          message: `Product '${args.productId}' does not exist in our catalog.`
        };
      }

      const isAvailable = product.status === 'available';
      const requestedSize = args.sizeUK ? Number(args.sizeUK) : null;
      const sizeMatches = requestedSize ? Number(product.sizeUK) === requestedSize : true;

      return {
        found: true,
        productId: product.code,
        model: product.model,
        brand: product.brand,
        status: product.status,
        isAvailable,
        actualSizeUK: product.sizeUK,
        actualSizeEU: product.sizeEU || '',
        price: product.price,
        sizeMatches,
        note: isAvailable
          ? (sizeMatches ? 'In stock and ready to ship.' : `Only available in single piece UK ${product.sizeUK} (EU ${product.sizeEU || ''}).`)
          : 'This single-piece pair is currently sold out.'
      };
    }

    case 'searchByBudget': {
      const budget = Number(args.budget) || 10000;
      const limit = Math.min(Math.max(Number(args.limit) || 4, 1), 6);
      const sizeUK = args.sizeUK ? Number(args.sizeUK) : undefined;
      const brand = args.brand;

      const filters = {
        maxPrice: budget,
        sizeUK,
        brand,
        sortBy: 'price',
        sortOrder: 'asc',
        limit
      };

      const matches = filterDbProducts(availableProducts, filters);
      const results = matches.slice(0, limit).map(sanitizeProductForAI);

      return {
        budget,
        foundCount: results.length,
        products: results
      };
    }

    case 'getSimilarProducts': {
      const code = String(args.productId || '').trim().toUpperCase();
      const refProduct = availableProducts.find(p => p.code?.toUpperCase() === code);
      const limit = Math.min(Math.max(Number(args.limit) || 4, 1), 6);

      let targetBrand = refProduct ? refProduct.brand : undefined;
      let targetSize = args.sizeUK ? Number(args.sizeUK) : (refProduct ? refProduct.sizeUK : undefined);
      let maxPrice = args.budget ? Number(args.budget) : (refProduct ? Math.round(refProduct.price * 1.3) : undefined);

      const matches = filterDbProducts(availableProducts, {
        brand: targetBrand,
        sizeUK: targetSize,
        maxPrice,
        limit: limit + 1
      }).filter(p => p.code?.toUpperCase() !== code);

      const results = matches.slice(0, limit).map(sanitizeProductForAI);

      return {
        referenceProductId: code,
        foundCount: results.length,
        similarProducts: results
      };
    }

    case 'addToCart': {
      const code = String(args.productId || '').trim().toUpperCase();
      const product = availableProducts.find(p => p.code?.toUpperCase() === code);

      if (!product) {
        return {
          success: false,
          error: `Product '${args.productId}' not found in database.`
        };
      }

      if (product.status === 'sold') {
        return {
          success: false,
          error: `Product '${product.model}' is already sold.`
        };
      }

      return {
        success: true,
        action: 'ADD_TO_CART',
        product: sanitizeProductForAI(product),
        message: `Added ${product.brand} ${product.model} (UK ${product.sizeUK}) to cart.`
      };
    }

    case 'getCart': {
      const items = Array.isArray(cartItems) ? cartItems.map(sanitizeProductForAI).filter(Boolean) : [];
      const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
      return {
        itemCount: items.length,
        items,
        totalPKR: total
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
