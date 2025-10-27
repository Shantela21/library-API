import { Request, Response, NextFunction } from 'express';
import { Book } from '../interfaces/book.interface';
import { Author } from '../interfaces/author.interface';

// In-memory stores (import these from your routes or a shared location)
let authors: Author[] = [];
let books: Book[] = [];

export const validateAuthor = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body as Partial<Author>;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required and must be a non-empty string' });
  }
  
  next();
};

export const validateBook = (req: Request, res: Response, next: NextFunction) => {
  const { title, authorId, isbn, publishedYear } = req.body as Partial<Book>;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (!authorId || typeof authorId !== 'string') {
    errors.push('Author ID is required');
  } else if (!authors.some(author => author.id === authorId)) {
    errors.push('Author with the provided ID does not exist');
  }
  
  if (!isbn || typeof isbn !== 'string' || !/^[0-9\-]+$/.test(isbn)) {
    errors.push('ISBN is required and must contain only numbers and hyphens');
  }
  
  const year = Number(publishedYear);
  if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
    errors.push('Published year must be a valid year');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }
  
  next();
};

export const validateBookId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  next();
};
