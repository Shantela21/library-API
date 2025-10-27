import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import { AppError, ValidationError, NotFoundError } from '../utils/appError';

// Extend the Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
}

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  errors?: Record<string, any>;
  isOperational?: boolean;
  path?: string;
  value?: any;
  keyValue?: Record<string, any>;
  errmsg?: string;
}

// Type guard for MongoDB duplicate key error
const isMongoDuplicateKeyError = (error: any): error is { code: number; keyValue: Record<string, any> } => {
  return error.code === 11000 && error.keyValue !== undefined;
};

// Type guard for MongoDB validation error
const isMongoValidationError = (error: any): error is { name: string; errors: Record<string, any> } => {
  return error.name === 'ValidationError' && error.errors !== undefined;
};

// Type guard for JWT error
const isJwtError = (error: any): error is { name: string } => {
  return error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError';
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  // We need to include next in the function signature for Express to recognize this as an error handling middleware
  // even though we don't use it directly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Set default values if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥', {
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Handle different types of errors
  if (isMongoDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    err = new AppError(message, 400);
  } else if (isMongoValidationError(err)) {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    err = new ValidationError(message, errors);
  } else if (isJwtError(err)) {
    const message = err.name === 'JsonWebTokenError' 
      ? 'Invalid token. Please log in again!'
      : 'Your token has expired! Please log in again.';
    err = new AppError(message, 401);
  }

  // Send error response
  if (err.isOperational || err instanceof AppError) {
    res.status(err.statusCode as number).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err instanceof ValidationError && { errors: err.errors })
    });
  } else {
    // 1) Log error
    console.error('UNHANDLED ERROR 💥', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(process.env.NODE_ENV === 'development' && { fullError: JSON.stringify(err, null, 2) })
    });

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      ...(process.env.NODE_ENV === 'development' && { 
        error: err.message,
        stack: err.stack 
      })
    });
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
};

/**
 * Wrapper for async/await error handling in Express routes
 * @param fn The async route handler function
 * @returns A function that handles errors and passes them to Express's error handling middleware
 */
export const catchAsync = <T extends RequestHandler>(
  fn: T
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
