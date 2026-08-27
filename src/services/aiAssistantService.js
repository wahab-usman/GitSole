// AI Shopping Assistant Service
// Conversational multi-turn engine powered by Google Gemini Function Calling & verified Supabase inventory

import { AI_TOOL_DECLARATIONS, executeTool } from './aiToolsEngine.js';

const SYSTEM_INSTRUCTION = `You are GitSole Concierge, the personal shopping assistant for GitSole (Pakistan's thrift sneaker marketplace).

Core Principles:
1. Grounding in Database: You have access to real-time tools connected to the store database. The database is your single source of truth. NEVER invent or hallucinate product names, IDs, prices, sizes, authenticity claims, conditions, or stock.
2. Natural Conversation: Speak naturally, warmly, and concisely like ChatGPT. Do NOT force every message into a product search. If the user says "hi", "how are you", "what is your return policy", answer conversationally without searching products.
3. Tool Usage:
   - Use 'searchProducts' or 'searchByBudget' when the user expresses shopping intent, budget, size, or brand requirements.
   - Use 'getProduct' or 'checkAvailability' when the user asks about a specific shoe, reference, or size availability.
   - Use 'addToCart' ONLY when the user explicitly requests to add an item to their cart/bag.
   - Use 'getSimilarProducts' when the user asks for alternatives or something similar.
4. Reference Resolution: Understand relative references in conversation:
   - "the first one", "number 1", "that one" refers to the 1st product previously shown.
   - "the second one", "number 2" refers to the 2nd product previously shown.
   - "the Nike pair", "the black one", "the cheaper one" refers to that specific previously displayed item.
5. Store Facts:
   - 100% hand-inspected authentic branded thrift shoes.
   - Free Home Delivery all over Pakistan with Cash on Delivery (COD). Delivery takes 3-5 working days.
   - 7-day hassle-free return and exchange guarantee.
   - WhatsApp helpline: 0321-1123474.
6. Clean Output: NEVER output HTML, JSX, SVG, technical code, raw JSON, or markdown image tags in your text response. All product cards will be rendered natively by the frontend.`;

/**
 * Format conversation history into valid Gemini Content messages
 */
function buildGeminiContents(history, userMessage, displayedProductsMap) {
  const contents = [];

  // Add reference context if previous products were displayed
  let contextualMessage = userMessage;
  if (displayedProductsMap && Object.keys(displayedProductsMap).length > 0) {
    const refSummary = Object.entries(displayedProductsMap)
      .map(([idx, p]) => `#${idx}: ${p.brand} ${p.model} (Code: ${p.code}, UK ${p.sizeUK}, PKR ${p.price})`)
      .join(', ');
    contextualMessage = `[Recently displayed products in chat: ${refSummary}]\nUser message: "${userMessage}"`;
  }

  // Include recent conversation turns (up to last 6)
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  for (const msg of recentHistory) {
    if (msg.sender === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: msg.text }]
      });
    } else if (msg.sender === 'ai') {
      contents.push({
        role: 'model',
        parts: [{ text: msg.text }]
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: contextualMessage }]
  });

  return contents;
}

/**
 * Main AI Shopping Assistant entry point
 */
export async function sendChatMessageToAI(
  userMessage,
  history = [],
  contextFilters = {},
  products = [],
  cartItems = [],
  displayedProductsMap = {}
) {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

  // 1. Live Google Gemini API with Function Calling
  if (geminiApiKey && geminiApiKey.length > 10) {
    try {
      const contents = buildGeminiContents(history, userMessage, displayedProductsMap);

      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        tools: [
          {
            functionDeclarations: AI_TOOL_DECLARATIONS
          }
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 600
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 11000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content;

        if (candidate) {
          const parts = candidate.parts || [];
          const functionCallPart = parts.find(p => p.functionCall);

          // CASE A: Gemini decided to call a verified Database Tool
          if (functionCallPart && functionCallPart.functionCall) {
            const { name, args } = functionCallPart.functionCall;
            const toolResult = executeTool(name, args, products, cartItems);

            // Extract verified products for UI cards
            let verifiedProducts = [];
            if (toolResult.products && Array.isArray(toolResult.products)) {
              verifiedProducts = toolResult.products;
            } else if (toolResult.product) {
              verifiedProducts = [toolResult.product];
            } else if (toolResult.similarProducts && Array.isArray(toolResult.similarProducts)) {
              verifiedProducts = toolResult.similarProducts;
            }

            // Extract actions (e.g. ADD_TO_CART)
            let action = null;
            if (toolResult.action === 'ADD_TO_CART' && toolResult.product) {
              action = { type: 'ADD_TO_CART', product: toolResult.product };
            }

            // Send tool result back to Gemini in 2nd turn to generate a natural conversational summary
            const secondTurnPayload = {
              contents: [
                ...contents,
                candidate,
                {
                  role: 'user',
                  parts: [
                    {
                      functionResponse: {
                        name,
                        response: { output: toolResult }
                      }
                    }
                  ]
                }
              ],
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
              },
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 350
              }
            };

            const secondResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secondTurnPayload)
              }
            );

            if (secondResponse.ok) {
              const secondData = await secondResponse.json();
              const finalReplyText = secondData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

              return {
                success: true,
                reply: finalReplyText || "Here are the matching pairs from our live catalog:",
                products: verifiedProducts,
                action,
                appliedFilters: args
              };
            }

            // Fallback if second turn had network issue
            return {
              success: true,
              reply: toolResult.message || `I found ${verifiedProducts.length} matching pair(s) in our store:`,
              products: verifiedProducts,
              action,
              appliedFilters: args
            };
          }

          // CASE B: Gemini replied directly (Chit-chat, FAQs, Policy, Greetings)
          const textPart = parts.find(p => p.text);
          if (textPart && textPart.text) {
            return {
              success: true,
              reply: textPart.text.trim(),
              products: [],
              appliedFilters: contextFilters
            };
          }
        }
      }
    } catch (apiErr) {
      console.warn('[Gemini Function Calling Error, switching to local tools]:', apiErr.message);
    }
  }

  // 2. Client-side Local Fallback Engine (Offline / Safe Fallback)
  const lowerMsg = userMessage.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|how are you|how r u|kaise ho|kya haal|assalam)\b/i.test(lowerMsg)) {
    return {
      success: true,
      reply: "Hey! 👋 Welcome to GitSole. What size, brand, or style are you looking for today?",
      products: []
    };
  }

  // Store FAQs
  if (lowerMsg.includes('return') || lowerMsg.includes('exchange')) {
    return {
      success: true,
      reply: "We offer a 7-day hassle-free return and size exchange guarantee. If your shoes don't fit or match expectations, we will exchange or refund!",
      products: []
    };
  }
  if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('cod')) {
    return {
      success: true,
      reply: "We provide Free Home Delivery with Cash on Delivery (COD) all over Pakistan. Delivery takes 3-5 working days.",
      products: []
    };
  }

  // Budget / Deals / Search fallback
  const result = executeTool('searchProducts', { query: userMessage, limit: 4 }, products, cartItems);
  return {
    success: true,
    reply: result.products?.length > 0 ? "Here are matching pairs available in stock:" : "I couldn't find exact matches in our current stock. What other brand or size do you wear?",
    products: result.products || []
  };
}
