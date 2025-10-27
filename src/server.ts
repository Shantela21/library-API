import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { requestLogger, errorLogger } from './middleware/logger.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import authorsRouter from './routes/authors.route';
import booksRouter from './routes/books.route';
import { Author } from './interfaces/author.interface';
import { Book } from './interfaces/book.interface';

// Shared in-memory stores
export let authors: Author[] = [];
export let books: Book[] = [];

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
}

const app: Express = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

// Body parser
app.use(bodyParser.json({ limit: '10kb' }));

// Logger middleware
app.use(requestLogger);

// Add request time
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Library API',
    documentation: 'Coming soon...',
    timestamp: new Date().toISOString(),
    endpoints: {
      authors: {
        getAll: 'GET /api/v1/authors',
        getOne: 'GET /api/v1/authors/:id',
        getBooks: 'GET /api/v1/authors/:id/books',
        create: 'POST /api/v1/authors',
        update: 'PUT /api/v1/authors/:id',
        delete: 'DELETE /api/v1/authors/:id'
      },
      books: {
        getAll: 'GET /api/v1/books',
        getOne: 'GET /api/v1/books/:id',
        create: 'POST /api/v1/books',
        update: 'PUT /api/v1/books/:id',
        delete: 'DELETE /api/v1/books/:id'
      }
    }
  });
});

// API routes
app.use('/api/v1/authors', authorsRouter);
app.use('/api/v1/books', booksRouter);

// 404 handler for unhandled routes
app.use(notFoundHandler);

// Error logging
app.use(errorLogger);

// Global error handler
app.use(globalErrorHandler);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

export default app;