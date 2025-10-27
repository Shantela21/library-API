import { Router, Request, Response, NextFunction } from 'express';
import { Author } from '../interfaces/author.interface';
import { Book } from '../interfaces/book.interface';
import { catchAsync } from '../middleware/error.middleware';
import { BadRequestError, NotFoundError } from '../utils/appError';
import { authors, books } from '../server';

const router = Router();

// Generate a simple ID
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Query parameters interface
interface AuthorQueryParams {
  sort?: 'name' | 'bookCount';
  limit?: string;
  search?: string;
}

// GET all authors with filtering, sorting, and pagination
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const { sort = 'name', limit, search } = req.query as unknown as AuthorQueryParams;
  
  let result = [...authors];
  
  // Search by name or biography
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(author => 
      author.name.toLowerCase().includes(searchLower) ||
      (author.biography && author.biography.toLowerCase().includes(searchLower))
    );
  }
  
  // Sort
  if (sort === 'bookCount') {
    result.sort((a, b) => (a.books?.length || 0) - (b.books?.length || 0));
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Limit results
  if (limit && !isNaN(Number(limit))) {
    result = result.slice(0, Number(limit));
  }
  
  res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      authors: result
    }
  });
}));

// GET author by ID
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const author = authors.find(a => a.id === req.params.id);
  
  if (!author) {
    throw new NotFoundError('Author not found');
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      author
    }
  });
}));

// GET author's books
router.get('/:id/books', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { sort = 'title', limit } = req.query as { sort?: 'title' | 'year'; limit?: string };
  
  const author = authors.find(a => a.id === id);
  if (!author) {
    throw new NotFoundError('Author not found');
  }
  
  let authorBooks = books.filter(book => book.authorId === id);
  
  // Sort books
  if (sort === 'year') {
    authorBooks.sort((a, b) => a.publishedYear - b.publishedYear);
  } else {
    authorBooks.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  // Limit results
  if (limit && !isNaN(Number(limit))) {
    authorBooks = authorBooks.slice(0, Number(limit));
  }
  
  res.status(200).json({
    status: 'success',
    results: authorBooks.length,
    data: {
      books: authorBooks
    }
  });
}));

// CREATE author
router.post('/', catchAsync(async (req: Request, res: Response) => {
  const { name, biography, birthDate } = req.body;
  
  if (!name) {
    throw new BadRequestError('Name is required');
  }
  
  // Check if author with same name already exists
  const existingAuthor = authors.find(a => a.name.toLowerCase() === name.toLowerCase());
  if (existingAuthor) {
    throw new BadRequestError('An author with this name already exists');
  }
  
  const newAuthor: Author = {
    id: generateId(),
    name,
    books: [],
    ...(biography && { biography }),
    ...(birthDate && { birthDate: new Date(birthDate) })
  };
  
  authors.push(newAuthor);
  
  res.status(201).json({
    status: 'success',
    data: {
      author: newAuthor
    }
  });
}));

// UPDATE author
router.put('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, biography, birthDate } = req.body;
  
  const authorIndex = authors.findIndex(a => a.id === id);
  if (authorIndex === -1) {
    throw new NotFoundError('Author not found');
  }
  
  // Check if name is being changed and if it conflicts with existing author
  if (name && name !== authors[authorIndex].name) {
    const nameExists = authors.some(a => 
      a.id !== id && a.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameExists) {
      throw new BadRequestError('An author with this name already exists');
    }
  }
  
  const updatedAuthor: Author = {
    ...authors[authorIndex],
    ...(name && { name }),
    ...(biography !== undefined && { biography }),
    ...(birthDate && { birthDate: new Date(birthDate) })
  };
  
  authors[authorIndex] = updatedAuthor;
  
  res.status(200).json({
    status: 'success',
    data: {
      author: updatedAuthor
    }
  });
}));

// DELETE author
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const authorIndex = authors.findIndex(a => a.id === id);
  
  if (authorIndex === -1) {
    throw new NotFoundError('Author not found');
  }
  
  // Check if author has books
  const authorBooks = books.filter(book => book.authorId === id);
  if (authorBooks.length > 0) {
    throw new BadRequestError('Cannot delete author with existing books. Delete the books first.');
  }
  
  authors.splice(authorIndex, 1);
  
  res.status(204).send();
}));

export default router;
