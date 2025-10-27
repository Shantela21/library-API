import { Router, Request, Response } from 'express';
import { Author } from '../interfaces/author.interface';

const router = Router();

let authors: Author[] = [];

const generateId = (): string => Math.random().toString(36).substr(2, 9);

//GET
router.get('/', (req: Request, res: Response) => {
  res.status(200).json(authors);
});


router.get('/:id', (req: Request, res: Response) => {
  const author = authors.find(a => a.id === req.params.id);
  if (!author) {
    return res.status(404).json({ message: 'Author not found' });
  }
  res.status(200).json(author);
});


//POST
router.post('/', (req: Request, res: Response) => {
  const { name, biography, birthDate } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newAuthor: Author = {
    id: generateId(),
    name,
    books: [],
    ...(biography && { biography }),
    ...(birthDate && { birthDate: new Date(birthDate) })
  };
  
  authors.push(newAuthor);
  res.status(201).json(newAuthor);
});


//PUT
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, biography, birthDate } = req.body;
  
  const authorIndex = authors.findIndex(a => a.id === id);
  if (authorIndex === -1) {
    return res.status(404).json({ message: 'Author not found' });
  }
  
  const updatedAuthor: Author = {
    ...authors[authorIndex],
    ...(name && { name }),
    ...(biography !== undefined && { biography }),
    ...(birthDate && { birthDate: new Date(birthDate) })
  };
  
  authors[authorIndex] = updatedAuthor;
  res.status(200).json(updatedAuthor);
});


//DELETE
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const authorIndex = authors.findIndex(a => a.id === id);
  
  if (authorIndex === -1) {
    return res.status(404).json({ message: 'Author not found' });
  }
  
  authors = authors.filter(a => a.id !== id);
  res.status(204).send();
});

export default router;
