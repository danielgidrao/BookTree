# 📚 BookTree
 **BookTree** é uma aplicação web para cadastro, busca e paginação de livros via índice em memória (B-Tree).  
 Desenvolvida como demonstração na disciplina de Organização e Recuperação da Informação (UFSCar).

---

## 🖥️ Tecnologias

- **Backend**  
  - Node.js + TypeScript  
  - Express.js  
  - B-Tree em memória (implementada em `bTree.ts`), serializa ao importar, deserializa ao rodar.
  - Leitura de CSV (dataset de livros)

- **Frontend**  
  - React + TypeScript  
  - Tailwind CSS  
  - Axios (ou fetch) para comunicação com o backend

---

## 🚀 Pré-requisitos

- Node.js ≥ 16  
- npm ou yarn  
- (Opcional) ts-node-dev para hot-reload no backend  

---

## 🔧 Instalação

1. Clone este repositório  
    ```
    git clone https://github.com/seu-usuario/booktree.git  
    cd booktree  
    ```
2. Instale dependências do backend  
   ```
   cd backend  
   npm install  
   ```
3. Instale dependências do frontend  
    ```
    cd ../frontend  
    npm install  
    ```
---

## ▶️ Como rodar

### 1. Backend

    cd backend
    # em dev com hot-reload
    npm run import
    npm run dev

- A API ficará disponível em `http://localhost:3000`  
- Lê o CSV em `backend/data/books.csv` e carrega todos os livros na B-Tree  
- (Opcional) Serializa o índice em `backend/data/tree.json`

### 2. Frontend

    cd frontend
    npm run dev

- A interface ficará em `http://localhost:5173` (ou porta indicada pelo Vite)

---

## 📝 Uso da API

| Método | Rota            | Descrição                          |
| ------ | --------------- | ---------------------------------- |
| GET    | `/books/search` | Busca livros paginados com filtros |
| POST   | `/books`        | Insere ou atualiza um livro        |

**Exemplo: busca paginada**

    GET /books/search?page=1&pageSize=20&titulo=harry

Resposta:

    {
      "page": 1,
      "pageSize": 20,
      "results": [ /* array de objetos Book */ ],
      "hasNextPage": true
    }

**Exemplo: inserir um novo livro**

    POST /books
    Content-Type: application/json

    {
      "id": "999",
      "titulo": "Novo Livro",
      "autor": "Fulano de Tal",
      "isbn13": "9781234567897"
      // ... demais campos de Book
    }

---

## 📂 Estrutura do projeto

    booktree/
    ├── backend/
    │   ├── data/
    │   │   ├── books.csv
    │   │   └── tree.json       # (opcional) serialização da B-Tree
    │   ├── bTree.ts            # implementação da B-Tree
    │   ├── bancoDados.ts       # I/O com CSV e paginação
    │   ├── interfaces.ts       # definição de `Book` e `BookFilters`
    │   └── index.ts            # servidor Express + rotas
    └── frontend/
        ├── public/
        └── src/
            ├── components/     # inputs, botões, listagens…
            ├── pages/          # telas de busca e cadastro
            ├── App.tsx
            └── main.tsx
