# ⚽ Gol Girls Backend

A iniciativa Gol Girls existe para promover o empoderamento de meninas negras, usando o esporte como uma ferramenta poderosa para abrir portas e realizar sonhos. Focamos em meninas negras e periféricas, pois queremos fortalecê-las em seu caminho de descoberta do mundo, construção da autoestima e ocupação de todos os espaços.

API backend do projeto Gol Girls, construída com Node.js, Express e Prisma, com persistência em MySQL.

## Stack

- Node.js 22 (LTS)
- Express 5
- Prisma 5 (ORM e migrations)
- MySQL 8.4 (LTS)
- Vitest (testes)

## Requisitos

- Node.js 20.19+ ou 22+
- npm 10+
- MySQL 8.4+ (ou Docker)

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta da API (padrão `3001`) |
| `JWT_SECRET` | Segredo do JWT, mínimo 32 caracteres (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | Expiração do token (padrão `1h`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o MySQL |
| `MYSQL_ROOT_PASSWORD` | Senha root do MySQL (usada somente pelo Docker Compose) |
| `MYSQL_PORT` | Porta do MySQL exposta no host pelo Docker Compose (padrão `3307`; a porta interna continua `3306`) |
| `DATABASE_URL` | URL de conexão usada pelo Prisma. Caracteres especiais na senha precisam ser codificados (URL-encoded) |
| `BCRYPT_ROUNDS` | Custo do hash de senha (padrão `12`) |
| `ADMIN_SEED_PASSWORD` | Senha usada pelo seed do administrador inicial; defina localmente e não a envie ao Git |
| `CORS_ORIGIN` | Origem permitida do frontend (ex.: `http://localhost:5173`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envio de e-mails (convites e recuperação de senha) |
| `APP_URL` | URL do frontend, usada nos links enviados por e-mail |

3. Gere o Prisma Client e aplique as migrations:

```bash
npm run prisma:generate
npm run migrate:deploy
```

## Executar em desenvolvimento

```bash
npm run dev

```

A API fica disponível em `http://localhost:3001`.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API com nodemon |
| `npm test` | Executa os testes com Vitest |
| `npm run test:watch` | Testes em modo watch |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run migrate:dev` | Cria/aplica migrations em desenvolvimento |
| `npm run migrate:deploy` | Aplica migrations existentes (produção/Docker) |
| `npm run db:push` | Sincroniza o schema sem criar migration |
| `npm run seed:admin` | Cria ou atualiza o admin inicial `GolAdmin` |

Para criar o administrador inicial, defina `ADMIN_SEED_PASSWORD` no `.env` local e execute `npm run seed:admin` depois de aplicar as migrations. O seed usa o e-mail `santanabianca447@gmail.com`, ativa a conta e armazena apenas o hash bcrypt da senha. É seguro executar novamente: o registro desse e-mail será atualizado com os dados do seed.

## Primeira execução com Docker Compose

1. Instale e inicie o Docker Desktop ou outro runtime compatível com Docker Compose.
2. Na raiz do backend, crie o arquivo de configuração local:

```bash
cp .env.example .env
```

3. Edite o `.env` e substitua os valores de exemplo. Defina `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `MYSQL_ROOT_PASSWORD`; gere um segredo forte para `JWT_SECRET` com `openssl rand -hex 32`. Para criar o administrador inicial, também defina `ADMIN_SEED_PASSWORD`. SMTP só é necessário para testar os fluxos de envio de e-mail. Não compartilhe nem envie o `.env` ao Git.
4. Construa e inicie o MySQL, as migrations e a API:

```bash
docker compose up --build -d
```

O serviço `migrate` aplica as migrations e encerra. O Compose não cria contas automaticamente; para criar o admin inicial após a primeira subida, execute `npm run seed:admin` na pasta do backend.

Se você usa Rancher Desktop no macOS e o contexto padrão não aponta para ele, use `docker --context rancher-desktop compose` no lugar de `docker compose` nos comandos desta seção.

O Compose sobe três serviços:

- `db`: MySQL 8.4 com volume persistente (`mysql_data`), disponível no host em `127.0.0.1:3307` por padrão (a API acessa o banco pela porta interna `3306`). Se a porta `3307` também estiver ocupada, defina outro valor em `MYSQL_PORT` no `.env`.
- `migrate`: executa `prisma migrate deploy` e encerra.
- `api`: inicia somente após as migrations concluírem, em `http://localhost:3001`.

Confira a API em `http://localhost:3001/` e a documentação em `http://localhost:3001/api-docs`.

Para parar:

```bash
docker compose down        # mantém os dados
docker compose down -v     # remove também o volume do banco
```

Se estiver usando o frontend via Docker (`http://localhost:8080`), defina `CORS_ORIGIN=http://localhost:8080` e `APP_URL=http://localhost:8080` no `.env`.

> Atualizando de uma versão anterior com MySQL 8.0: o MySQL 8.4 migra o volume existente automaticamente, mas faça um backup antes.

## Documentação da API

Swagger disponível em `http://localhost:3001/api-docs`.

## Principais dependências

| Pacote | Uso |
| --- | --- |
| `express` | Framework HTTP, rotas e middlewares |
| `@prisma/client` / `prisma` | Acesso ao banco e migrations |
| `mysql2` | Driver MySQL |
| `jsonwebtoken` | Autenticação e autorização via JWT |
| `bcryptjs` | Hash de senhas |
| `helmet` | Headers HTTP de segurança |
| `express-rate-limit` | Limite de requisições (mitiga brute-force) |
| `nodemailer` | Envio de e-mails via SMTP |
| `swagger-jsdoc` / `swagger-ui-express` | Documentação da API |
| `dotenv` | Carregamento de variáveis de ambiente |
