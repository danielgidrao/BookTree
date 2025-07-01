
import fs from 'fs';
import path from 'path';
import { Book, BookFilters } from './interfaces';
import { BTree } from './bTree';

const DATA_DIR = path.resolve(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const TREE_FILE = path.join(DATA_DIR, 'Btree.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

let bookTree: BTree;
let persistedBooks: Book[] = [];

function loadFromDisk() {
  // Carrega array de livros
  if (fs.existsSync(BOOKS_FILE)) {
    const rawBooks = fs.readFileSync(BOOKS_FILE, 'utf-8');
    persistedBooks = JSON.parse(rawBooks) as Book[];
  }

  // Carrega árvore serializada ou reconstrói
  if (fs.existsSync(TREE_FILE)) {
    const rawTree = fs.readFileSync(TREE_FILE, 'utf-8');
    const parsed = JSON.parse(rawTree) as any;
    bookTree = BTree.deserialize(parsed);
    console.log(`✅ Árvore B-Tree desserializada de ${TREE_FILE}.`);
  } else {
    console.log(`ℹ️ Arquivo de árvore não encontrado em ${TREE_FILE}, reconstruindo a partir de ${BOOKS_FILE}.`);
    bookTree = new BTree(3);
    for (const book of persistedBooks) {
      const key = `${book.titulo}|${book.isbn13}`;
      bookTree.insert(key, book);
    }
  }

  if (fs.existsSync(BOOKS_FILE)) {
    const rawBooks = fs.readFileSync(BOOKS_FILE, 'utf-8');
    persistedBooks = JSON.parse(rawBooks) as Book[];
  }

  if (fs.existsSync(TREE_FILE)) {
    const rawTree = fs.readFileSync(TREE_FILE, 'utf-8');
    const parsed = JSON.parse(rawTree) as any;
    bookTree = BTree.deserialize(parsed);
  } else {
    bookTree = new BTree(3);
    for (const book of persistedBooks) {
      const key = `${book.titulo}|${book.isbn13}`;
      bookTree.insert(key, book);
    }
  }
}

function saveToDisk() {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(persistedBooks, null, 2));
  const serialized = bookTree.serialize();
  fs.writeFileSync(TREE_FILE, JSON.stringify(serialized, null, 2));
}

loadFromDisk();

function matchesFilters(book: Book, filters: BookFilters): boolean {
  return true; // omitido para brevidade
}

export function insertBook(book: Book): void {
  const key = `${book.titulo}|${book.isbn13}`;
  bookTree.insert(key, book);
  const idx = persistedBooks.findIndex(b => b.isbn13 === book.isbn13);
  if (idx >= 0) persistedBooks[idx] = book;
  else persistedBooks.push(book);
  saveToDisk();
}

export function getAllBooks(): Book[] {
  return [...persistedBooks];
}

export function searchBooksPaged(
  filters: BookFilters,
  page: number,
  pageSize: number
): { results: Book[]; hasNextPage: boolean } {
  const results: Book[] = [];
  let matchedCount = 0;
  const offset = (page - 1) * pageSize;
  let stop = false;

  try {
    bookTree.inorder(book => {
      if (stop) return;
      if (!matchesFilters(book, filters)) return;
      if (matchedCount >= offset) {
        results.push(book);
        if (results.length >= pageSize) {
          stop = true;
          throw new Error('__INORDER_STOP__');
        }
      }
      matchedCount++;
    });
  } catch (err: any) {
    if (err.message !== '__INORDER_STOP__') throw err;
  }

  return { results, hasNextPage: results.length === pageSize };
}