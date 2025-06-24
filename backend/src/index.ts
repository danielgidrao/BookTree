// src/index.ts
import express from 'express';
import cors from 'cors';
import { Book, BookFilters } from './interfaces';
import { insertBook, getAllBooks, searchBooksPaged } from './bancoDados';

// configura servidor
const app = express();
app.use(cors());            // habilita CORS
app.use(express.json());    // parse JSON bodies

// Loga quantidade de livros carregados
const allBooks = getAllBooks();
console.log(`📚 Carregados ${allBooks.length} livros do JSON.`);

/**
 * Helper para verificar e transformar filtros de query
 */
function buildFilters(q: any): BookFilters {
  return {
    isbn13:       q.isbn13    as string,
    isbn10:       q.isbn10    as string,
    titulo:       q.titulo    as string,
    autor:        q.autor     as string,
    idioma:       q.idioma    as string,
    editora:      q.editora   as string,
    genero:       q.genero    as string,
    descricao:    q.descricao as string,
    anoMin:       q.anoMin    ? Number(q.anoMin)    : undefined,
    anoMax:       q.anoMax    ? Number(q.anoMax)    : undefined,
    paginasMin:   q.paginasMin? Number(q.paginasMin): undefined,
    paginasMax:   q.paginasMax? Number(q.paginasMax): undefined,
    ratingMin:    q.ratingMin ? Number(q.ratingMin) : undefined,
    ratingMax:    q.ratingMax ? Number(q.ratingMax) : undefined,
    avaliacaoMin: q.avaliacaoMin ? Number(q.avaliacaoMin) : undefined,
    avaliacaoMax: q.avaliacaoMax ? Number(q.avaliacaoMax) : undefined,
    resenhaMin:   q.resenhaMin   ? Number(q.resenhaMin)   : undefined,
    resenhaMax:   q.resenhaMax   ? Number(q.resenhaMax)   : undefined,
    abandonosMin: q.abandonosMin ? Number(q.abandonosMin) : undefined,
    abandonosMax: q.abandonosMax ? Number(q.abandonosMax) : undefined,
    relendoMin:   q.relendoMin   ? Number(q.relendoMin)   : undefined,
    relendoMax:   q.relendoMax   ? Number(q.relendoMax)   : undefined,
    queremLerMin: q.queremLerMin ? Number(q.queremLerMin) : undefined,
    queremLerMax: q.queremLerMax ? Number(q.queremLerMax) : undefined,
    lendoMin:     q.lendoMin     ? Number(q.lendoMin)     : undefined,
    lendoMax:     q.lendoMax     ? Number(q.lendoMax)     : undefined,
    leramMin:     q.leramMin     ? Number(q.leramMin)     : undefined,
    leramMax:     q.leramMax     ? Number(q.leramMax)     : undefined,
    maleMin:      q.maleMin      ? Number(q.maleMin)      : undefined,
    maleMax:      q.maleMax      ? Number(q.maleMax)      : undefined,
    femaleMin:    q.femaleMin    ? Number(q.femaleMin)    : undefined,
    femaleMax:    q.femaleMax    ? Number(q.femaleMax)    : undefined,
  };
}

/** Rota para inserir/atualizar um livro */
app.post('/books', (req, res) => {
  const book = req.body as Book;
  insertBook(book);            // persiste no JSON e na B-Tree interna
  res.status(201).json({ message: 'Livro inserido/atualizado.' });
});

/** Rota para buscar todos os livros */
app.get('/books', (req, res) => {
  res.json(allBooks);
});

/** Rota para buscar livros com filtros e paginação */
app.get('/books/search', (req, res) => {
  const filters = buildFilters(req.query);
  const page     = Math.max(1, parseInt(String(req.query.page  || '1'),  10));
  const pageSize = Math.max(1, parseInt(String(req.query.pageSize || '20'), 10));

  const { results, hasNextPage } = searchBooksPaged(filters, page, pageSize);
  res.json({ page, pageSize, results, hasNextPage });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
