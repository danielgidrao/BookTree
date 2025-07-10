import fs from 'fs';
import path from 'path';
import { Book, BookFilters } from './interfaces';
import { BTree } from './bTree';

const DATA_DIR = path.resolve(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

// -- 1) Carrega todos os livros da JSON
if (!fs.existsSync(BOOKS_FILE)) {
  console.error(`Arquivo ${BOOKS_FILE} não encontrado!`);
  process.exit(1);
}
const persistedBooks: Book[] = JSON.parse(
  fs.readFileSync(BOOKS_FILE, 'utf8')
);

// -- 2) Define quais campos terão índice e como gerar a chave
type FieldKey = keyof Book;
const indexableFields: FieldKey[] = [
  'id','titulo','autor','isbn13','isbn10','ano','paginas',
  'idioma','editora','genero','descricao','rating','avaliacao',
  'resenha','abandonos','relendo','queremLer','lendo','leram','male','female'
];

// Helper para converter qualquer campo em string ordenável
function makeKey(field: FieldKey, v: any): string {
  if (typeof v === 'number')   return String(v).padStart(10,'0');
  return String(v).toLowerCase();
}

// -- 3) Cria um BTree para cada campo
const indexes = new Map<FieldKey, BTree<Book>>();
for (const f of indexableFields) {
  indexes.set(
    f,
    new BTree<Book>(book => makeKey(f, (book as any)[f]), 3)
  );
}

// -- 4) Popula todos os índices
for (const book of persistedBooks) {
  for (const tree of indexes.values()) {
    tree.insert(book);
  }
}

// -- 5) Funções exportadas

export function getAllBooks(): Book[] {
  return [...persistedBooks];
}

export function insertBook(book: Book): void {
  persistedBooks.push(book);
  for (const tree of indexes.values()) {
    tree.insert(book);
  }
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(persistedBooks, null, 2));
}

function between(n: number, min?: number, max?: number): boolean {
  return (min === undefined || n >= min) && (max === undefined || n <= max);
}

export function searchBooksPaged(
  filters: BookFilters,
  page: number,
  pageSize: number
): { results: Book[]; hasNextPage: boolean } {
  // --- 5.1) encontrar candidatos via índices de intervalo
  let candidateSet: Set<Book> | Book[] = persistedBooks;

  for (const [field, tree] of indexes) {
    const min = (filters as any)[`${field}Min`];
    const max = (filters as any)[`${field}Max`];
    if (min !== undefined || max !== undefined) {
      const keyMin = min  !== undefined ? makeKey(field, min) : '';
      const keyMax = max  !== undefined ? makeKey(field, max) : '\uffff';
      const subset = tree.rangeSearch(keyMin, keyMax);
      // intersecta com candidatos atuais
      const prev: Set<Book> = candidateSet instanceof Set
        ? candidateSet
        : new Set<Book>(candidateSet);
      candidateSet = new Set<Book>(
        subset.filter(b => prev.has(b))
      );
    }
  }

  // --- 5.2) aplica os demais filtros em memória
  const arr = candidateSet instanceof Set
    ? Array.from(candidateSet)
    : candidateSet;

  const filtered = arr.filter(book => {
    // texto/exato
    if (filters.isbn13    && !book.isbn13.includes(filters.isbn13)) return false;
    if (filters.isbn10    && !book.isbn10.includes(filters.isbn10)) return false;
    if (filters.titulo    && !book.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) return false;
    if (filters.autor     && !book.autor.toLowerCase().includes(filters.autor.toLowerCase())) return false;
    // ... mesmo para idioma, editora, genero, descricao

    // numéricos sem índice de intervalo (já tratados pelos índices, mas repetimos pra segurança)
    if (!between(book.ano,       filters.anoMin,       filters.anoMax))       return false;
    if (!between(book.paginas,   filters.paginasMin,   filters.paginasMax))   return false;
    if (!between(book.rating,    filters.ratingMin,    filters.ratingMax))    return false;
    if (!between(book.avaliacao, filters.avaliacaoMin, filters.avaliacaoMax)) return false;
    // ... demais campos
    return true;
  });

  // --- 5.3) paginação
  const start   = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);
  const hasNext = start + pageSize < filtered.length;

  return { results, hasNextPage: hasNext };
}