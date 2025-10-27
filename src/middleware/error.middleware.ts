import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

interface ErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    message: err.message || 'Something went wrong!',
  };

  // Handle different types of errors
  if (err instanceof AppError) {
    errorResponse.status = err.status;
    
    // Handle validation errors
    if (err instanceof (AppError as any).constructor.name === 'ValidationError') {
      errorResponse.errors = (err as any).errors;
    }
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(err.statusCode || 500).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
