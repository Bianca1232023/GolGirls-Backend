import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

// Repositories (para criação de tabelas)
import * as adminRepo from './repositories/adminRepository.js';
import * as professorRepo from './repositories/professorRepository.js';
import * as turmaRepo from './repositories/turmaRepository.js';
import * as nucleoRepo from './repositories/nucleoRepository.js';
import * as escolaRepo from './repositories/escolaRepository.js';
import * as alunoRepo from './repositories/alunoRepository.js';
import * as inviteRepo from './repositories/inviteRepository.js';

// Rotas
import { adminAuthRouter, adminCrudRouter } from './routes/adminRoutes.js';
import professorRoutes from './routes/professorRoutes.js';
import alunoRoutes from './routes/alunoRoutes.js';
import turmaRoutes from './routes/turmaRoutes.js';
import nucleoRoutes from './routes/nucleoRoutes.js';
import escolaRoutes from './routes/escolaRoutes.js';
import adminExtrasRoutes from './routes/adminExtrasRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/', (_req, res) => {
  res.json({ status: 200, service: 'gogirls-backend' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas por domínio
app.use('/admin', adminAuthRouter);
app.use('/admin', adminExtrasRoutes);
app.use('/admins', adminCrudRouter);
app.use('/professor', professorRoutes);
app.use('/aluno', alunoRoutes);
app.use('/alunos', alunoRoutes);
app.use('/admin/turmas', turmaRoutes);
app.use('/turmas', turmaRoutes);
app.use('/admin/nucleos', nucleoRoutes);
app.use('/nucleos', nucleoRoutes);
app.use('/admin/escolas', escolaRoutes);
app.use('/escolas', escolaRoutes);

app.use((_req, res) => {
  res.status(404).json({ status: 404, message: 'Rota não encontrada' });
});

app.use((err, _req, res, _next) => {
  const isDupEntry = err.code === 'ER_DUP_ENTRY';
  const status = err.status || err.statusCode || (isDupEntry ? 409 : 500);
  const message = isDupEntry
    ? 'Dados em conflito com regras do banco (ex.: email duplicado)'
    : err.message || 'Erro interno';

  const body = { status, message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.detail = err.stack;
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(body);
});

const PORT = Number(process.env.PORT) || 3000;

function assertJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || String(s).length < 32) {
    throw new Error(
      'Defina JWT_SECRET com pelo menos 32 caracteres (ex.: openssl rand -hex 32)'
    );
  }
}

async function start() {
  assertJwtSecret();
  await adminRepo.createTable();
  await turmaRepo.createTable();
  await professorRepo.createTable();
  await turmaRepo.createTableProfessorTurmas();
  await nucleoRepo.createTable();
  await escolaRepo.createTable();
  await alunoRepo.createTable();
  await inviteRepo.createTable();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
