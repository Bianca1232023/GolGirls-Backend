# ⚽ Gol Girls Backend
A iniciativa Gol Girls existe para promover o empoderamento de meninas negras, usando o esporte como uma ferramenta poderosa para abrir portas e realizar sonhos. Focamos em meninas negras e periféricas, pois queremos fortalecê-las em seu caminho de descoberta do mundo, construção da autoestima e ocupação de todos os espaços.

API backend do projeto GoLGirls, construída com Node.js e Express, com persistência em MySQL.

## Requisitos

- Node.js 20.x
- npm 9+
- MySQL 8+

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto baseado nas variáveis abaixo:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=golgirls
DB_PASSWORD=sua_senha
DB_NAME=golgirls

# JWT
JWT_SECRET=gere-com-openssl-rand-hex-32   # mínimo 32 caracteres
JWT_EXPIRES_IN=1h

# E-mail (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_smtp
SMTP_FROM=noreply@example.com

# Frontend (para links nos e-mails)
APP_URL=http://localhost:3001

# CORS (defina a origem permitida em produção)
CORS_ORIGIN=http://localhost:5173
```

## Executar em desenvolvimento

Use o script de desenvolvimento com nodemon:

```bash
npm run dev
```

## Dependências

### dotenv

- Função: carregar variáveis de ambiente a partir de um arquivo .env.
- Onde é útil: configuração de porta, segredos de token e demais credenciais fora do código.

### express

- Função: framework HTTP para criação da API.
- Onde é útil: criação de rotas, middlewares, parsing de JSON e tratamento de requisições/respostas.

### jsonwebtoken

- Função: criação e validação de tokens JWT.
- Onde é útil: autenticação e autorização de usuários na API.

### mysql2

- Função: driver MySQL para Node.js com suporte a promises e prepared statements.
- Onde é útil: todas as queries ao banco de dados, prevenindo SQL injection por padrão.

### nodemailer

- Função: envio de e-mails via SMTP.
- Onde é útil: fluxos de convite, definição de senha e recuperação de senha.

### bcryptjs

- Função: hash seguro de senhas.
- Onde é útil: cadastro e login de admins e professores.

### helmet

- Função: aplica headers HTTP de segurança.
- Onde é útil: proteção contra ataques comuns (XSS, clickjacking etc.).

### express-rate-limit

- Função: limitação de requisições por IP.
- Onde é útil: rotas de autenticação (login, esqueci minha senha) para mitigar brute-force.

## Execução com Docker

```bash
docker compose up --build
```

A API ficará disponível em `http://localhost:3001` e a documentação Swagger em `http://localhost:3001/api-docs`.

## Primeiro acesso

Somente quando o banco estiver vazio é possível criar o primeiro admin via `POST /admin/register`. A partir daí, novos admins devem ser criados pelo fluxo de convite (`POST /admin/invite`).

