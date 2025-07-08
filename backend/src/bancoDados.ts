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
  if (fs.existsSync(BOOKS_FILE)) {
    persistedBooks = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf-8'));
  }

  if (fs.existsSync(TREE_FILE)) {
    bookTree = BTree.deserialize(JSON.parse(fs.readFileSync(TREE_FILE, 'utf-8')));
    console.log(`✅ Árvore B-Tree desserializada de ${TREE_FILE}.`);
  } else {
    console.log(`ℹ️ Arquivo de árvore não encontrado em ${TREE_FILE}, reconstruindo.`);
    bookTree = new BTree(3);
    for (const book of persistedBooks) {
      const key = `${book.titulo}|${book.isbn13}`;
      bookTree.insert(key, book);
    }
  }
}

function saveToDisk() {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(persistedBooks, null, 2));
  fs.writeFileSync(TREE_FILE, JSON.stringify(bookTree.serialize(), null, 2));
}

loadFromDisk();

/**
 * Verifica se um valor numérico está entre min e max (se definidos).
 */
function between(val: number, min?: number, max?: number) {
  return (min === undefined || val >= min) && (max === undefined || val <= max);
}

/**
 * Checa se o livro atende a todos os filtros passados.
 */
function matchesFilters(book: Book, filters: BookFilters): boolean {
  if (filters.isbn13 && !book.isbn13.includes(filters.isbn13)) return false;
  if (filters.isbn10 && !book.isbn10.includes(filters.isbn10)) return false;
  if (filters.titulo && !book.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) return false;
  if (filters.autor && !book.autor.toLowerCase().includes(filters.autor.toLowerCase())) return false;
  if (filters.idioma && !book.idioma.toLowerCase().includes(filters.idioma.toLowerCase())) return false;
  if (filters.editora && !book.editora.toLowerCase().includes(filters.editora.toLowerCase())) return false;
  if (filters.genero && !book.genero.toLowerCase().includes(filters.genero.toLowerCase())) return false;
  if (filters.descricao && !book.descricao.toLowerCase().includes(filters.descricao.toLowerCase())) return false;

  if (!between(book.ano, filters.anoMin, filters.anoMax)) return false;
  if (!between(book.paginas, filters.paginasMin, filters.paginasMax)) return false;
  if (!between(book.rating, filters.ratingMin, filters.ratingMax)) return false;
  if (!between(book.avaliacao, filters.avaliacaoMin, filters.avaliacaoMax)) return false;
  if (!between(book.resenha, filters.resenhaMin, filters.resenhaMax)) return false;
  if (!between(book.abandonos, filters.abandonosMin, filters.abandonosMax)) return false;
  if (!between(book.relendo, filters.relendoMin, filters.relendoMax)) return false;
  if (!between(book.queremLer, filters.queremLerMin, filters.queremLerMax)) return false;
  if (!between(book.lendo, filters.lendoMin, filters.lendoMax)) return false;
  if (!between(book.leram, filters.leramMin, filters.leramMax)) return false;
  if (!between(book.male, filters.maleMin, filters.maleMax)) return false;
  if (!between(book.female, filters.femaleMin, filters.femaleMax)) return false;

  return true;
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
