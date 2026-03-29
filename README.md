# ⚽ Gol Girls Backend
A iniciativa Gol Girls existe para promover o empoderamento de meninas negras, usando o esporte como uma ferramenta poderosa para abrir portas e realizar sonhos. Focamos em meninas negras e periféricas, pois queremos fortalecê-las em seu caminho de descoberta do mundo, construção da autoestima e ocupação de todos os espaços.

API backend do projeto GoGirls, construída com Node.js e Express, com persistência em SQLite.

## Requisitos

- Node.js 20.x (recomendado para compatibilidade com sqlite3)
- npm 9+

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. (Opcional) Crie um arquivo .env na raiz do projeto para definir variáveis de ambiente.

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

### sqlite

- Função: camada de acesso assíncrono ao banco SQLite.
- Onde é útil: simplificar operações de banco (abertura de conexão e execução de queries) usando promises.

### sqlite3

- Função: driver nativo do SQLite para Node.js.
- Onde é útil: comunicação direta com o arquivo de banco local.
- Observação de compatibilidade: para Node 20, recomenda-se usar sqlite3 na linha 5.x (por exemplo, 5.1.7).

