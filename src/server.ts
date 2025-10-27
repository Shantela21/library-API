import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { requestLogger, errorLogger } from './middleware/logger.middleware';
import authorsRouter from './routes/authors.route';
import booksRouter from './routes/books.route';
import { Author } from './interfaces/author.interface';
import { Book } from './interfaces/book.interface';

// Shared in-memory stores
export let authors: Author[] = [];
export let books: Book[] = [];

const app: Express = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(requestLogger);


app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Library API',
    endpoints: {
      authors: '/authors',
      docs: 'Coming soon...'
    }
  });
});

app.use('/authors', authorsRouter);
app.use('/books', booksRouter);


app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});


app.use(errorLogger);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;