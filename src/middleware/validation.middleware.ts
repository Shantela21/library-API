import { Request, Response, NextFunction } from 'express';
import { Book } from '../interfaces/book.interface';
import { Author } from '../interfaces/author.interface';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/appError';

// In-memory stores (import these from your routes or a shared location)
let authors: Author[] = [];
let books: Book[] = [];

export const validateAuthor = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body as Partial<Author>;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestError('Name is required and must be a non-empty string');
  }
  
  next();
};

export const validateBook = (req: Request, res: Response, next: NextFunction) => {
  const { title, authorId, isbn, publishedYear } = req.body as Partial<Book>;
  const errors: Record<string, string[]> = {
    title: [],
    authorId: [],
    isbn: [],
    publishedYear: []
  };

  // Validate title
  if (!title) {
    errors.title.push('Title is required');
  } else if (typeof title !== 'string' || title.trim().length === 0) {
    errors.title.push('Title must be a non-empty string');
  }
  
  // Validate authorId
  if (!authorId) {
    errors.authorId.push('Author ID is required');
  } else if (typeof authorId !== 'string') {
    errors.authorId.push('Author ID must be a string');
  } else if (!authors.some(author => author.id === authorId)) {
    errors.authorId.push('Author with the provided ID does not exist');
  }
  
  // Validate ISBN
  if (!isbn) {
    errors.isbn.push('ISBN is required');
  } else if (typeof isbn !== 'string' || !/^[0-9\-]+$/.test(isbn)) {
    errors.isbn.push('ISBN must contain only numbers and hyphens');
  }
  
  // Validate publishedYear
  if (publishedYear === undefined) {
    errors.publishedYear.push('Published year is required');
  } else {
    const year = Number(publishedYear);
    if (isNaN(year)) {
      errors.publishedYear.push('Published year must be a number');
    } else if (year < 1000 || year > new Date().getFullYear() + 1) {
      errors.publishedYear.push('Published year must be a valid year');
    }
  }
  
  // Filter out empty error arrays
  const filteredErrors = Object.entries(errors).reduce((acc, [key, value]) => {
    if (value.length > 0) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string[]>);
  
  if (Object.keys(filteredErrors).length > 0) {
    throw new ValidationError(filteredErrors);
  }
  
  next();
};

export const validateBookId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  
  if (!book) {
    throw new NotFoundError('Book not found');
  }
  
  next();
};
