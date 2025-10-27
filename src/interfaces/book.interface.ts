export interface Book {
  id: string;
  title: string;
  authorId: string;
  isbn: string;
  publishedYear: number;
  genre?: string;
  description?: string;
}
