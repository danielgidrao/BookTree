/**
 * Representa um livro com todos os seus dados.
 */
export interface Book {
  /** Identificador único (UUID) */
  id: string;
  /** Título do livro */
  titulo: string;
  /** Autor ou autores */
  autor: string;
  /** ISBN-13 */
  isbn13: string;
  /** ISBN-10 */
  isbn10: string;
  /** Ano de publicação */
  ano: number;
  /** Número de páginas */
  paginas: number;
  /** Idioma (ex: "português") */
  idioma: string;
  /** Editora */
  editora: string;
  /** Gênero(s) */
  genero: string;
  /** Descrição ou sinopse */
  descricao: string;
  /** Avaliação média (ex: 4.1) */
  rating: number;
  /** Quantidade de avaliações */
  avaliacao: number;
  /** Quantidade de resenhas */
  resenha: number;
  /** Quantos abandonaram a leitura */
  abandonos: number;
  /** Quantos estão relendo */
  relendo: number;
  /** Quantos querem ler */
  queremLer: number;
  /** Quantos estão lendo */
  lendo: number;
  /** Quantos já leram */
  leram: number;
  /** % de leitores do sexo masculino */
  male: number;
  /** % de leitores do sexo feminino */
  female: number;
}

/**
 * Define todos os possíveis filtros opcionais para busca de livros.
 */
export interface BookFilters {
  isbn13?: string;
  isbn10?: string;
  titulo?: string;
  autor?: string;
  idioma?: string;
  editora?: string;
  genero?: string;
  descricao?: string;
  anoMin?: number;
  anoMax?: number;
  paginasMin?: number;
  paginasMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  avaliacaoMin?: number;
  avaliacaoMax?: number;
  resenhaMin?: number;
  resenhaMax?: number;
  abandonosMin?: number;
  abandonosMax?: number;
  relendoMin?: number;
  relendoMax?: number;
  queremLerMin?: number;
  queremLerMax?: number;
  lendoMin?: number;
  lendoMax?: number;
  leramMin?: number;
  leramMax?: number;
  maleMin?: number;
  maleMax?: number;
  femaleMin?: number;
  femaleMax?: number;
}
