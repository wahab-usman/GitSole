// Vercel Serverless Function: POST /api/chat-assistant
// AI Shopping Assistant backend for GitSole e-commerce platform with Gemini Function Calling & verified Supabase inventory

import { AI_TOOL_DECLARATIONS, executeTool } from '../src/services/aiToolsEngine.js';

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
    const { message, history = [], contextFilters = {}, products = [], cartItems = [], displayedProductsMap = {} } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'User message is required.' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    if (geminiApiKey) {
      try {
        const contents = [];

        // Reference map context
        let contextualMessage = message;
        if (displayedProductsMap && Object.keys(displayedProductsMap).length > 0) {
          const refSummary = Object.entries(displayedProductsMap)
            .map(([idx, p]) => `#${idx}: ${p.brand} ${p.model} (Code: ${p.code}, UK ${p.sizeUK}, PKR ${p.price})`)
            .join(', ');
          contextualMessage = `[Recently displayed products in chat: ${refSummary}]\nUser message: "${message}"`;
        }

        const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
        for (const msg of recentHistory) {
          if (msg.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.text }] });
          } else if (msg.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: msg.text }] });
          }
        }
        contents.push({ role: 'user', parts: [{ text: contextualMessage }] });

        const payload = {
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools: [{ functionDeclarations: AI_TOOL_DECLARATIONS }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 600 }
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content;

          if (candidate) {
            const parts = candidate.parts || [];
            const functionCallPart = parts.find(p => p.functionCall);

            if (functionCallPart && functionCallPart.functionCall) {
              const { name, args } = functionCallPart.functionCall;
              const toolResult = executeTool(name, args, products, cartItems);

              let verifiedProducts = [];
              if (toolResult.products && Array.isArray(toolResult.products)) {
                verifiedProducts = toolResult.products;
              } else if (toolResult.product) {
                verifiedProducts = [toolResult.product];
              } else if (toolResult.similarProducts && Array.isArray(toolResult.similarProducts)) {
                verifiedProducts = toolResult.similarProducts;
              }

              let action = null;
              if (toolResult.action === 'ADD_TO_CART' && toolResult.product) {
                action = { type: 'ADD_TO_CART', product: toolResult.product };
              }

              // Turn 2: Summarize tool result
              const secondPayload = {
                contents: [
                  ...contents,
                  candidate,
                  {
                    role: 'user',
                    parts: [{ functionResponse: { name, response: { output: toolResult } } }]
                  }
                ],
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                generationConfig: { temperature: 0.35, maxOutputTokens: 350 }
              };

              const secondRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(secondPayload)
                }
              );

              if (secondRes.ok) {
                const secondData = await secondRes.json();
                const finalReply = secondData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                return res.status(200).json({
                  success: true,
                  reply: finalReply || "Here are matching pairs available in stock:",
                  products: verifiedProducts,
                  action,
                  appliedFilters: args
                });
              }

              return res.status(200).json({
                success: true,
                reply: toolResult.message || `I found ${verifiedProducts.length} matching pair(s):`,
                products: verifiedProducts,
                action,
                appliedFilters: args
              });
            }

            const textPart = parts.find(p => p.text);
            if (textPart && textPart.text) {
              return res.status(200).json({
                success: true,
                reply: textPart.text.trim(),
                products: [],
                appliedFilters: contextFilters
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Serverless Gemini Error]:', err.message);
      }
    }

    // Fallback
    const result = executeTool('searchProducts', { query: message, limit: 4 }, products, cartItems);
    return res.status(200).json({
      success: true,
      reply: result.products?.length > 0 ? "Here are matching pairs available in stock:" : "I'm here to help you find shoes. What size or brand are you looking for?",
      products: result.products || []
    });
  } catch (error) {
    console.error('[Chat Assistant Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      error: "Sorry, I'm having trouble connecting right now. Please try again."
    });
  }
}
