/**
 * Base error class for operational errors (errors we can predict and handle)
 */
export class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    // This ensures the error stack trace is captured correctly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends AppError {
  errors: Record<string, string[]>;
  
  constructor(message: string, errors: string[] | Record<string, string[]>) {
    super(message, 400);
    
    // Normalize errors to always be a Record<string, string[]>
    if (Array.isArray(errors)) {
      this.errors = { general: errors };
    } else {
      this.errors = errors;
    }
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error for when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error for bad requests (invalid input data)
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Error for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized to access this resource') {
    super(message, 401);
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error for forbidden actions (insufficient permissions)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error for when a resource already exists
 */
export class ConflictError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 409);
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
