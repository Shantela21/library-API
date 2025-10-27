import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger } from './middleware/logger.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import authorsRouter from './routes/authors.route';
import booksRouter from './routes/books.route';
import { Author } from './interfaces/author.interface';
import { Book } from './interfaces/book.interface';

// Shared in-memory stores
export let authors: Author[] = [];
export let books: Book[] = [];

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Body parser
app.use(bodyParser.json({ limit: '10kb' }));

// Logger middleware
app.use(requestLogger);

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Welcome to the Library API',
    documentation: 'Coming soon...',
    endpoints: {
      authors: {
        getAll: 'GET /authors',
        getOne: 'GET /authors/:id',
        getBooks: 'GET /authors/:id/books',
        create: 'POST /authors',
        update: 'PUT /authors/:id',
        delete: 'DELETE /authors/:id'
      },
      books: {
        getAll: 'GET /books',
        getOne: 'GET /books/:id',
        create: 'POST /books',
        update: 'PUT /books/:id',
        delete: 'DELETE /books/:id'
      }
    }
  });
});

// API routes
app.use('/api/v1/authors', authorsRouter);
app.use('/api/v1/books', booksRouter);

// 404 handler for unhandled routes
app.all('*', notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;