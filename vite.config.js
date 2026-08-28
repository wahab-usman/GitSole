import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import url from 'url';

function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        if (pathname && pathname.startsWith('/api/')) {
          const endpoint = pathname.replace('/api/', '').split('?')[0];
          try {
            let handlerModule;
            if (endpoint === 'products') {
              handlerModule = await import('./api/products.js');
            } else if (endpoint === 'orders') {
              handlerModule = await import('./api/orders.js');
            } else if (endpoint === 'upload-image') {
              handlerModule = await import('./api/upload-image.js');
            } else if (endpoint === 'analyze-image') {
              handlerModule = await import('./api/analyze-image.js');
            } else if (endpoint === 'chat-assistant') {
              handlerModule = await import('./api/chat-assistant.js');
            }

            if (handlerModule && handlerModule.default) {
              // Parse body for POST / PUT
              let body = {};
              if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                body = await new Promise((resolve) => {
                  let data = '';
                  req.on('data', (chunk) => { data += chunk; });
                  req.on('end', () => {
                    try {
                      resolve(JSON.parse(data || '{}'));
                    } catch (e) {
                      resolve({});
                    }
                  });
                });
              }

              req.query = parsedUrl.query || {};
              req.body = body;

              // Helper for res.status().json()
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              return handlerModule.default(req, res);
            }
          } catch (err) {
            console.error(`[API Dev Server Error in ${endpoint}]:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  server: {
    port: 3000,
    open: false
  }
});
