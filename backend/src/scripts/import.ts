import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Book } from '../interfaces';
import { BTree } from '../bTree';

const CSV_PATH = path.resolve(__dirname, 'dados.csv');
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const TREE_FILE = path.join(DATA_DIR, 'btree.json');

console.log('CSV:', CSV_PATH, '→ existe?', fs.existsSync(CSV_PATH));
fs.mkdirSync(DATA_DIR, { recursive: true });

const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
const records: Record<string, string>[] = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});
console.log(`Linhas lidas do CSV: ${records.length}`);

const allBooks: Book[] = [];
records.forEach((row, idx) => {
  const book: Book = {
    id:        `${row['ISBN_13']}-${idx}`,
    titulo:    row['titulo'],
    autor:     row['autor'],
    isbn13:    row['ISBN_13'],
    isbn10:    row['ISBN_10'],
    ano:       parseInt(row['ano'], 10),
    paginas:   parseInt(row['paginas'], 10),
    idioma:    row['idioma'],
    editora:   row['editora'],
    genero:    row['genero'],
    descricao: row['descricao'],
    rating:    parseFloat(row['rating']),
    avaliacao: parseInt(row['avaliacao'], 10),
    resenha:   parseInt(row['resenha'], 10),
    abandonos: parseInt(row['abandonos'], 10),
    relendo:   parseInt(row['relendo'], 10),
    queremLer: parseInt(row['querem_ler'], 10),
    lendo:     parseInt(row['lendo'], 10),
    leram:     parseInt(row['leram'], 10),
    male:      parseFloat(row['male']),
    female:    parseFloat(row['female']),
  };
  allBooks.push(book);
});

console.log(`Vou gravar ${allBooks.length} registros no JSON.`);
fs.writeFileSync(BOOKS_FILE, JSON.stringify(allBooks, null, 2), 'utf8');
console.log(`Gravados ${allBooks.length} livros em ${BOOKS_FILE}.`);

// Constrói e persiste a árvore separadamente
const tree = new BTree(3);
allBooks.forEach(book => {
  const key = `${book.titulo}|${book.isbn13}`;
  tree.insert(key, book);
});
fs.writeFileSync(TREE_FILE, JSON.stringify(tree.serialize(), null, 2), 'utf8');
console.log(`Árvore B-Tree serializada em ${TREE_FILE}.`);
