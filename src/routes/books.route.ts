import { Router, Request, Response } from 'express';
import { Book } from '../interfaces/book.interface';
import { Author } from '../interfaces/author.interface';
import { validateBook, validateBookId } from '../middleware/validation.middleware';

const router = Router();

// In-memory store for books
let books: Book[] = [];

// Reference to authors array (in a real app, this would be a database)
let authors: Author[] = [];

// Generate a simple ID
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// GET 
router.get('/', (req: Request, res: Response) => {
  // Include author details in the response
  const booksWithAuthors = books.map(book => {
    const author = authors.find(a => a.id === book.authorId);
    return {
      ...book,
      author: author ? { id: author.id, name: author.name } : null
    };
  });
  
  res.status(200).json(booksWithAuthors);
});

// GET BOOK BY ID
router.get('/:id', validateBookId, (req: Request, res: Response) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  const author = authors.find(a => a.id === book.authorId);
  const bookWithAuthor = {
    ...book,
    author: author ? { id: author.id, name: author.name } : null
  };
  
  res.status(200).json(bookWithAuthor);
});

// POST 
router.post('/', validateBook, (req: Request, res: Response) => {
  const { title, authorId, isbn, publishedYear, genre, description } = req.body;
  
  const newBook: Book = {
    id: generateId(),
    title,
    authorId,
    isbn,
    publishedYear: Number(publishedYear),
    ...(genre && { genre }),
    ...(description && { description })
  };
  
  books.push(newBook);
  
  // Update the author's books array
  const authorIndex = authors.findIndex(a => a.id === authorId);
  if (authorIndex !== -1) {
    authors[authorIndex].books.push(newBook.id);
  }
  
  res.status(201).json(newBook);
});

// PUT  BOOK BY ID
router.put('/:id', [validateBookId, validateBook], (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, authorId, isbn, publishedYear, genre, description } = req.body;
  
  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  const oldBook = books[bookIndex];
  
  // If author is being changed, update the authors' books arrays
  if (authorId && authorId !== oldBook.authorId) {
    // Remove book from old author's books array
    const oldAuthorIndex = authors.findIndex(a => a.id === oldBook.authorId);
    if (oldAuthorIndex !== -1) {
      authors[oldAuthorIndex].books = authors[oldAuthorIndex].books.filter(bookId => bookId !== id);
    }
    
    // Add book to new author's books array
    const newAuthorIndex = authors.findIndex(a => a.id === authorId);
    if (newAuthorIndex !== -1) {
      authors[newAuthorIndex].books.push(id);
    }
  }
  
  const updatedBook: Book = {
    ...oldBook,
    title: title || oldBook.title,
    authorId: authorId || oldBook.authorId,
    isbn: isbn || oldBook.isbn,
    publishedYear: publishedYear ? Number(publishedYear) : oldBook.publishedYear,
    ...(genre !== undefined ? { genre } : { genre: oldBook.genre }),
    ...(description !== undefined ? { description } : { description: oldBook.description })
  };
  
  books[bookIndex] = updatedBook;
  
  res.status(200).json(updatedBook);
});

// DELETE /books/:id - Delete a book
router.delete('/:id', validateBookId, (req: Request, res: Response) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(b => b.id === id);
  
  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }
  
  const book = books[bookIndex];
  
  // Remove book from author's books array
  const authorIndex = authors.findIndex(a => a.id === book.authorId);
  if (authorIndex !== -1) {
    authors[authorIndex].books = authors[authorIndex].books.filter(bookId => bookId !== id);
  }
  
  // Remove the book
  books = books.filter(b => b.id !== id);
  
  res.status(204).send();
});

export default router;
