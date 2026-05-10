import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

import { routeLogger, errorHandler } from "./middleware/error-handler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middlewares padronizados de logging e tratamento de erros
app.use(routeLogger);

// Permissive CORS middleware para testes locais. Em produção, restrinja as origens.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.BIND_HOST || '127.0.0.1';

  // Use simple listen signature for compatibility across platforms
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
})();
