# ⚽ Gol Girls Backend

A iniciativa Gol Girls existe para promover o empoderamento de meninas negras, usando o esporte como uma ferramenta poderosa para abrir portas e realizar sonhos. Focamos em meninas negras e periféricas, pois queremos fortalecê-las em seu caminho de descoberta do mundo, construção da autoestima e ocupação de todos os espaços.

Este repositório contém a API backend do projeto Gol Girls, construída com Node.js, Express e MySQL.

## 🧠 O que a API precisa

- Node.js 20.x 
- npm 9+
- MySQL 8 em execução localmente ou via Docker
- Uma variável `JWT_SECRET` com pelo menos 32 caracteres

## Estrutura do backend

- `src/app.js`: inicialização do servidor, middlewares e rotas
- `src/configdb.js`: configuração da conexão com o MySQL
- `src/routes/`: definição das rotas da API
- `src/controller/`: lógica de criação de tabelas e regras da aplicação

## ⚙️ Passo a passo para rodar em desenvolvimento

1. Entre na pasta do backend:

```bash
cd GoGirls-Backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=gogirls
DB_PASSWORD=gogirls
DB_NAME=gogirls
JWT_SECRET=troque-este-segredo-por-um-valor-longo-aleatorio
```

4. Comando para gerar a chave JWT_SECRET
- Depois copie e cole a chave gerada no .env: JWT_SECRET=troque-este-segredo-por-um-valor-longo-aleatorio
- Se `JWT_SECRET` tiver menos de 32 caracteres, a aplicação não inicia.
```bash
openssl rand -hex 32
```

## ☁️ Passo a passo rodar usando Docker

1. Entre na pasta do backend:

```bash
cd GoGirls-Backend
```

2. Suba o banco e a API com Docker Compose:

```bash
docker compose up --build
```

3. Depois para roda em modo normal:

```bash
docker compose up
```

4. Quando quiser parar os containers:

```bash
docker compose down
```

5. Se quiser rodar em background:

```bash
docker compose up --build -d
```

6. Ver status:

```bash
docker compose ps
```

7. Ver logs do backend:

```bash
docker compose logs -f backend
```

8. Limpar cache do Docker:

```bash
docker builder prune -a
```

9. Limpar imagens e volumes:

```bash
docker system prune -a --volumes
```

## 🌐 Como validar se esta funcionando:

```bash
http://localhost:3001
```

A documentação da API está disponível em:

```bash
http://localhost:3001/api-docs
```

## Variáveis de ambiente importantes

- `PORT`: porta da API. No projeto, `3001` facilita a integração com o frontend.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: conexão com o MySQL.
- `JWT_SECRET`: chave usada para assinar e validar tokens.
- `CORS_ORIGIN`: origem permitida para chamadas do frontend, se necessário.
