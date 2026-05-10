import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  
  // Structured log
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId,
    errorCode: code,
    method: req.method,
    path: req.path,
    message: err.message,
    details: err.details,
    stack: status === 500 ? err.stack : undefined
  }));

  res.status(status).json({
    success: false,
    error: err.message || 'Ocorreu um erro inesperado no servidor.',
    code,
    requestId,
    ...(err.details || {})
  });
}

export function routeLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Attach requestId to request for use in handlers
  (req as any).requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    }));
  });

  next();
}
