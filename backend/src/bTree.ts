import { Book } from './interfaces';

/**
 * Estruturas para serialização de nós e da árvore
 */
interface SerializedNode {
  keys: string[];
  values: Book[];
  leaf: boolean;
  children: SerializedNode[];
}

interface SerializedBTree {
  t: number;
  root: SerializedNode;
}

class BTreeNode {
  keys: string[] = [];
  values: Book[] = [];
  children: BTreeNode[] = [];
  leaf: boolean;

  constructor(leaf: boolean) {
    this.leaf = leaf;
  }
}

/**
 * B-Tree de grau mínimo t com serialização
 */
export class BTree {
  private root: BTreeNode;
  private t: number;

  constructor(t: number = 3) {
    this.t = t;
    this.root = new BTreeNode(true);
  }

  // --- Serialização / Desserialização ---
  serialize(): SerializedBTree {
    return { t: this.t, root: BTree._serializeNode(this.root) };
  }

  private static _serializeNode(node: BTreeNode): SerializedNode {
    return {
      keys: [...node.keys],
      values: [...node.values],
      leaf: node.leaf,
      children: node.children.map(child => BTree._serializeNode(child))
    };
  }

  static deserialize(data: SerializedBTree): BTree {
    const tree = new BTree(data.t);
    tree.root = BTree._deserializeNode(data.root);
    return tree;
  }

  private static _deserializeNode(obj: SerializedNode): BTreeNode {
    const node = new BTreeNode(obj.leaf);
    node.keys = [...obj.keys];
    node.values = [...obj.values];
    node.children = obj.children.map(child => BTree._deserializeNode(child));
    return node;
  }

  // --- Busca exata ---
  searchExact(key: string): Book | null {
    return this._search(this.root, key);
  }

  private _search(node: BTreeNode, key: string): Book | null {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) {
      return node.values[i];
    }
    if (node.leaf) return null;
    return this._search(node.children[i], key);
  }

  // --- Inserção ---
  insert(key: string, value: Book): void {
    const r = this.root;
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

  private _splitChild(node: BTreeNode, i: number): void {
    const t = this.t;
    const y = node.children[i];
    const z = new BTreeNode(y.leaf);

    z.keys = y.keys.splice(t);
    z.values = y.values.splice(t);
    if (!y.leaf) z.children = y.children.splice(t);

    node.children.splice(i + 1, 0, z);
    const medianKey = y.keys.splice(t - 1, 1)[0];
    const medianVal = y.values.splice(t - 1, 1)[0];
    node.keys.splice(i, 0, medianKey);
    node.values.splice(i, 0, medianVal);
  }

  private _insertNonFull(node: BTreeNode, key: string, value: Book): void {
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

  // --- Percurso em ordem ---
  inorder(callback: (book: Book) => void): void {
    this._inorder(this.root, callback);
  }

  private _inorder(node: BTreeNode, callback: (book: Book) => void): void {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) this._inorder(node.children[i], callback);
      callback(node.values[i]);
    }
    if (!node.leaf) this._inorder(node.children[node.keys.length], callback);
  }

  // --- Busca por prefixo ---
  searchByPrefix(prefix: string): Book[] {
    const results: Book[] = [];
    this.inorder(book => {
      if (book.titulo.startsWith(prefix)) results.push(book);
    });
    return results;
  }
}