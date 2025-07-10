import { Book } from './interfaces';

/**
 * Estruturas para serialização de nós e da árvore
 */
interface SerializedNode<T> {
  keys: string[];
  values: T[];
  leaf: boolean;
  children: SerializedNode<T>[];
}

interface SerializedBTree<T> {
  t: number;
  root: SerializedNode<T>;
}

class BTreeNode<T> {
  keys: string[] = [];
  values: T[] = [];
  children: BTreeNode<T>[] = [];
  leaf: boolean;

  constructor(leaf: boolean) {
    this.leaf = leaf;
  }
}

/**
 * B-Tree genérica de grau mínimo t, parametrizada por getKey
 */
export class BTree<T> {
  private root: BTreeNode<T>;
  private t: number;
  private getKey: (v: T) => string;

  constructor(getKey: (v: T) => string, t: number = 3) {
    this.getKey = getKey;
    this.t = t;
    this.root = new BTreeNode<T>(true);
  }

  // --- Serialização / Desserialização ---
  serialize(): SerializedBTree<T> {
    return { t: this.t, root: BTree._serializeNode(this.root) };
  }

  private static _serializeNode<U>(node: BTreeNode<U>): SerializedNode<U> {
    return {
      keys: [...node.keys],
      values: [...node.values],
      leaf: node.leaf,
      children: node.children.map(child => BTree._serializeNode(child))
    };
  }

  static deserialize<U>(
    data: SerializedBTree<U>,
    getKey: (v: U) => string
  ): BTree<U> {
    const tree = new BTree<U>(getKey, data.t);
    tree.root = BTree._deserializeNode(data.root);
    return tree;
  }

  private static _deserializeNode<U>(obj: SerializedNode<U>): BTreeNode<U> {
    const node = new BTreeNode<U>(obj.leaf);
    node.keys = [...obj.keys];
    node.values = [...obj.values];
    node.children = obj.children.map(child => BTree._deserializeNode(child));
    return node;
  }

  // --- Busca exata ---
  searchExact(key: string): T | null {
    return this._search(this.root, key);
  }

  private _search(node: BTreeNode<T>, key: string): T | null {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) {
      return node.values[i];
    }
    if (node.leaf) return null;
    return this._search(node.children[i], key);
  }

  // --- Inserção ---
  insert(value: T): void {
    const key = this.getKey(value);
    const r = this.root;
    if (r.keys.length === 2 * this.t - 1) {
      const s = new BTreeNode<T>(false);
      s.children.push(r);
      this._splitChild(s, 0);
      this.root = s;
      this._insertNonFull(s, key, value);
    } else {
      this._insertNonFull(r, key, value);
    }
  }

  private _splitChild(node: BTreeNode<T>, i: number): void {
    const t = this.t;
    const y = node.children[i];
    const z = new BTreeNode<T>(y.leaf);

    z.keys = y.keys.splice(t);
    z.values = y.values.splice(t);
    if (!y.leaf) z.children = y.children.splice(t);

    node.children.splice(i + 1, 0, z);
    const medianKey = y.keys.splice(t - 1, 1)[0];
    const medianVal = y.values.splice(t - 1, 1)[0];
    node.keys.splice(i, 0, medianKey);
    node.values.splice(i, 0, medianVal);
  }

  private _insertNonFull(node: BTreeNode<T>, key: string, value: T): void {
    let i = node.keys.length - 1;
    if (node.leaf) {
      while (i >= 0 && key < node.keys[i]) i--;
      node.keys.splice(i + 1, 0, key);
      node.values.splice(i + 1, 0, value);
    } else {
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this._splitChild(node, i);
        if (key > node.keys[i]) i++;
      }
      this._insertNonFull(node.children[i], key, value);
    }
  }

  // --- Travessia em ordem (generator) ---
  private *inorderGenerator(node: BTreeNode<T> = this.root): IterableIterator<T> {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) yield* this.inorderGenerator(node.children[i]);
      yield node.values[i];
    }
    if (!node.leaf) yield* this.inorderGenerator(node.children[node.keys.length]);
  }

  /**
   * Busca por intervalo [minKey, maxKey]
   */
  rangeSearch(minKey: string, maxKey: string): T[] {
    const resultados: T[] = [];
    for (const value of this.inorderGenerator()) {
      const key = this.getKey(value);
      if (key < minKey) continue;
      if (key > maxKey) break;
      resultados.push(value);
    }
    return resultados;
  }

  // --- Percurso em ordem via callback ---
  inorder(callback: (v: T) => void): void {
    this._inorder(this.root, callback);
  }

  private _inorder(node: BTreeNode<T>, callback: (v: T) => void): void {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) this._inorder(node.children[i], callback);
      callback(node.values[i]);
    }
    if (!node.leaf) this._inorder(node.children[node.keys.length], callback);
  }

  // --- Busca por prefixo ---
  searchByPrefix(prefix: string): T[] {
    const results: T[] = [];
    this.inorder(v => {
      if (this.getKey(v).startsWith(prefix)) results.push(v);
    });
    return results;
  }
}