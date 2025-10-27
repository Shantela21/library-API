import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/appError';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

export const errorLogger = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const status = (err as any).status || 'error';

  console.error(`[${status.toUpperCase()}] ${new Date().toISOString()}`);
  console.error(`Message: ${err.message}`);

  if (err instanceof ValidationError) {
    console.error('Validation Errors:', (err as ValidationError).errors);
  } else if (!(err instanceof AppError)) {
    // Only log stack for non-operational errors (non-AppError instances)
    console.error('Stack:', err.stack);
  }

  next(err);
};
