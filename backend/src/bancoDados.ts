import fs from 'fs';
import path from 'path';
import { Book, BookFilters } from './interfaces';
import { BTree } from './bTree';

// Caminho do arquivo JSON de persistência
const DATA_FILE = path.resolve(__dirname, 'data', 'books.json');
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

// Inicializa a B-Tree com grau mínimo (ajuste conforme necessidade)
const bookTree = new BTree(3);
let persistedBooks: Book[] = [];

/**
 * Carrega do disco (JSON) e popula a B-Tree e o array em memória.
 */
function loadFromDisk() {
  if (!fs.existsSync(DATA_FILE)) return;
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  persistedBooks = JSON.parse(raw) as Book[];
  for (const book of persistedBooks) {
    const key = `${book.titulo}|${book.isbn13}`;
    bookTree.insert(key, book);
  }
}

/**
 * Persiste o array de livros em disco (JSON).
 */
function saveToDisk() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(persistedBooks, null, 2));
}

// Carrega ao iniciar
loadFromDisk();

/**
 * Verifica se um livro satisfaz os filtros fornecidos.
 */
function matchesFilters(book: Book, filters: BookFilters): boolean {
  if (filters.isbn13 && book.isbn13 !== filters.isbn13) return false;
  if (filters.isbn10 && book.isbn10 !== filters.isbn10) return false;
  if (filters.titulo && !book.titulo.toLowerCase().startsWith(filters.titulo.toLowerCase())) return false;
  if (filters.autor && !book.autor.toLowerCase().startsWith(filters.autor.toLowerCase())) return false;
  if (filters.idioma && book.idioma !== filters.idioma) return false;
  if (filters.editora && book.editora !== filters.editora) return false;
  if (filters.genero && book.genero !== filters.genero) return false;
  if (filters.descricao && !book.descricao.toLowerCase().includes(filters.descricao.toLowerCase())) return false;

  if (filters.anoMin !== undefined && book.ano < filters.anoMin) return false;
  if (filters.anoMax !== undefined && book.ano > filters.anoMax) return false;
  if (filters.paginasMin !== undefined && book.paginas < filters.paginasMin) return false;
  if (filters.paginasMax !== undefined && book.paginas > filters.paginasMax) return false;
  if (filters.ratingMin !== undefined && book.rating < filters.ratingMin) return false;
  if (filters.ratingMax !== undefined && book.rating > filters.ratingMax) return false;
  if (filters.avaliacaoMin !== undefined && book.avaliacao < filters.avaliacaoMin) return false;
  if (filters.avaliacaoMax !== undefined && book.avaliacao > filters.avaliacaoMax) return false;
  if (filters.resenhaMin !== undefined && book.resenha < filters.resenhaMin) return false;
  if (filters.resenhaMax !== undefined && book.resenha > filters.resenhaMax) return false;
  if (filters.abandonosMin !== undefined && book.abandonos < filters.abandonosMin) return false;
  if (filters.abandonosMax !== undefined && book.abandonos > filters.abandonosMax) return false;
  if (filters.relendoMin !== undefined && book.relendo < filters.relendoMin) return false;
  if (filters.relendoMax !== undefined && book.relendo > filters.relendoMax) return false;
  if (filters.queremLerMin !== undefined && book.queremLer < filters.queremLerMin) return false;
  if (filters.queremLerMax !== undefined && book.queremLer > filters.queremLerMax) return false;
  if (filters.lendoMin !== undefined && book.lendo < filters.lendoMin) return false;
  if (filters.lendoMax !== undefined && book.lendo > filters.lendoMax) return false;
  if (filters.leramMin !== undefined && book.leram < filters.leramMin) return false;
  if (filters.leramMax !== undefined && book.leram > filters.leramMax) return false;
  if (filters.maleMin !== undefined && book.male < filters.maleMin) return false;
  if (filters.maleMax !== undefined && book.male > filters.maleMax) return false;
  if (filters.femaleMin !== undefined && book.female < filters.femaleMin) return false;
  if (filters.femaleMax !== undefined && book.female > filters.femaleMax) return false;

  return true;
}

/**
 * Insere ou atualiza um livro na B-Tree e persiste em disco.
 */
export function insertBook(book: Book): void {
  const key = `${book.titulo}|${book.isbn13}`;
  bookTree.insert(key, book);

  const idx = persistedBooks.findIndex(b => b.isbn13 === book.isbn13);
  if (idx >= 0) persistedBooks[idx] = book;
  else persistedBooks.push(book);

  saveToDisk();
}

/**
 * Busca livros na B-Tree aplicando filtros em memória.
 */
export function searchBooks(filters: BookFilters): Book[] {
  const results: Book[] = [];
  bookTree.inorder(book => {
    if (matchesFilters(book, filters)) {
      results.push(book);
    }
  });
  return results;
}

/**
 * Retorna todos os livros persistidos.
 */
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
  let stop  = false;

  // Variante de inorder que permite parar precoce via exceção
  try {
    bookTree.inorder((book) => {
      if (stop) return;                  // já atingimos pageSize
      if (!matchesFilters(book, filters)) return;

      // só começamos a coletar após o offset  
      if (matchedCount >= offset) {
        results.push(book);
        if (results.length >= pageSize) {
          stop = true;
          // lançar pra interromper imediatamente
          throw new Error('__INORDER_STOP__');
        }
      }
      matchedCount++;
    });
  } catch (err: any) {
    if (err.message !== '__INORDER_STOP__') throw err;
  }

  // se coletamos pageSize itens, provavelmente há próxima página
  const hasNextPage = results.length === pageSize;
  return { results, hasNextPage };
}