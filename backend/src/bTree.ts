// src/bTree.ts
import { Book } from './interfaces';

/**
 * Um nó de B-Tree de grau mínimo t:
 * - armazena de t-1 até 2t-1 chaves
 * - tem de t até 2t filhos (exceto folhas)
 */
class BTreeNode {
  // chaves armazenam os índices para os livros (ex: `${titulo}|${id}`)
  keys: string[] = [];
  // valores paralelos às chaves
  values: Book[] = [];
  // filhos (length = keys.length+1 quando não-leaf)
  children: BTreeNode[] = [];
  leaf: boolean;

  constructor(leaf: boolean) {
    this.leaf = leaf;
  }
}

/**
 * B-Tree de grau mínimo t
 */
export class BTree {
  private root: BTreeNode;
  private t: number;

  constructor(t: number = 3) {
    this.t = t;
    this.root = new BTreeNode(true);
  }

  /** Busca um livro pela chave exata */
  searchExact(key: string): Book | null {
    return this._search(this.root, key);
  }

  private _search(node: BTreeNode, key: string): Book | null {
    // encontra o menor i tal que key <= node.keys[i]
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) {
      return node.values[i];
    }
    if (node.leaf) return null;
    return this._search(node.children[i], key);
  }

  /** Insere um par (key, value) na árvore */
  insert(key: string, value: Book): void {
    const r = this.root;
    // se raiz cheia, cresce a altura
    if (r.keys.length === 2 * this.t - 1) {
      const s = new BTreeNode(false);
      s.children.push(r);
      this._splitChild(s, 0);
      this.root = s;
      this._insertNonFull(s, key, value);
    } else {
      this._insertNonFull(r, key, value);
    }
  }

  /** Divide o filho i de node em dois, promovendo a mediana */
  private _splitChild(node: BTreeNode, i: number): void {
    const t = this.t;
    const y = node.children[i];
    const z = new BTreeNode(y.leaf);

    // Move as últimas t-1 chaves/values de y para z
    z.keys = y.keys.splice(t);
    z.values = y.values.splice(t);

    // Se não for folha, move também filhos
    if (!y.leaf) {
      z.children = y.children.splice(t);
    }

    // Insere z como filho de node
    node.children.splice(i + 1, 0, z);
    // Promove a chave mediana de y para node
    const medianKey = y.keys.splice(t - 1, 1)[0];
    const medianVal = y.values.splice(t - 1, 1)[0];
    node.keys.splice(i, 0, medianKey);
    node.values.splice(i, 0, medianVal);
  }

  /** Insere em nó não-cheio */
  private _insertNonFull(node: BTreeNode, key: string, value: Book): void {
    let i = node.keys.length - 1;

    if (node.leaf) {
      // insere na posição correta mantendo ordenação
      while (i >= 0 && key < node.keys[i]) i--;
      node.keys.splice(i + 1, 0, key);
      node.values.splice(i + 1, 0, value);
    } else {
      // desce para o filho apropriado
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      // se o filho estiver cheio, divide-o
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this._splitChild(node, i);
        // após split, a chave no meio sobe e node.keys[i] pode ser menor que key
        if (key > node.keys[i]) i++;
      }
      this._insertNonFull(node.children[i], key, value);
    }
  }

  /** Percorre todos os livros em ordem alfabética de chave */
  inorder(callback: (book: Book) => void): void {
    this._inorder(this.root, callback);
  }

  private _inorder(node: BTreeNode, callback: (book: Book) => void): void {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) {
        this._inorder(node.children[i], callback);
      }
      callback(node.values[i]);
    }
    if (!node.leaf) {
      this._inorder(node.children[node.keys.length], callback);
    }
  }

  /** Busca por prefixo de título */
  searchByPrefix(prefix: string): Book[] {
    const results: Book[] = [];
    // varre tudo em ordem e filtra prefixo
    this.inorder(book => {
      if (book.titulo.startsWith(prefix)) results.push(book);
    });
    return results;
  }
}
