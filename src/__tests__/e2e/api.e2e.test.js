import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../createApp.js';
import prisma from '../../models/prisma.js';
import { createTestClient } from './httpClient.js';

const app = createApp();
const client = createTestClient(app);

const NEW_ROUTES = [
  '/aluno/me',
  '/aluno/jornada',
  '/aluno/refresh',
  '/professor/chamada',
  '/professor/relatorios',
  '/professor/refresh',
  '/admin/refresh',
  '/admin/relatorios',
  '/admin/send-invite',
  '/admin/invites',
  '/admin/team',
  '/admin/professors',
];

beforeAll(async () => {
  await client.start();
});

afterAll(async () => {
  await client.stop();
});

describe('E2E — rotas públicas', () => {
  it('GET / retorna status da API', async () => {
    const res = await client.get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 200, service: 'golgirls-backend' });
  });

  it('GET /api-docs.json expõe especificação OpenAPI', async () => {
    const res = await client.get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths['/']).toBeDefined();
  });

  it('documentação Swagger inclui rotas novas', async () => {
    const res = await client.get('/api-docs.json');
    for (const route of NEW_ROUTES) {
      expect(res.body.paths[route], `path ${route} ausente no swagger`).toBeDefined();
    }
  });

  it('Swagger não documenta rotas removidas (ex.: /professor/createturma)', async () => {
    const res = await client.get('/api-docs.json');
    expect(res.body.paths['/professor/createturma']).toBeUndefined();
  });

  it('POST /professor/createturma retorna 404 (rota removida)', async () => {
    const res = await client.post('/professor/createturma', { nome: 'Turma E2E' });
    expect(res.status).toBe(404);
  });

  it('POST /aluno/login com matrícula inválida retorna 401', async () => {
    const res = await client.post('/aluno/login', { matricula: 'matricula-inexistente-e2e-000' });
    expect(res.status).toBe(401);
  });

  it('POST /admin/login com credenciais inválidas retorna 401', async () => {
    const res = await client.post('/admin/login', {
      email: 'naoexiste@teste.local',
      password: 'SenhaInvalida123',
    });
    expect(res.status).toBe(401);
  });
});

describe('E2E — rotas protegidas sem token', () => {
  it('GET /aluno/me sem token retorna 401', async () => {
    const res = await client.get('/aluno/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  it('GET /admin/relatorios sem token retorna 401', async () => {
    const res = await client.get('/admin/relatorios');
    expect(res.status).toBe(401);
  });

  it('POST /professor/chamada sem token retorna 401', async () => {
    const res = await client.post('/professor/chamada', {
      turma_id: 1,
      data_aula: '2026-01-01',
      registros: [],
    });
    expect(res.status).toBe(401);
  });
});

describe('E2E — integração com banco (E2E_INTEGRATION=1)', () => {
  const runIntegration = process.env.E2E_INTEGRATION === '1';
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  beforeAll(async () => {
    if (!runIntegration) return;
    await prisma.$connect();
  });

  afterAll(async () => {
    if (!runIntegration) return;
    await prisma.$disconnect();
  });

  it.skipIf(!runIntegration)('conecta ao MySQL via Prisma', async () => {
    const r = await prisma.$queryRaw`SELECT 1 AS ok`;
    expect(Number(r[0].ok)).toBe(1);
  });

  it.skipIf(!runIntegration || !adminEmail || !adminPassword)(
    'fluxo admin: login → relatórios → refresh',
    async () => {
      const login = await client.post('/admin/login', { email: adminEmail, password: adminPassword });
      expect(login.status).toBe(200);
      expect(login.body.token).toBeTruthy();

      const token = login.body.token;

      const rel = await client.get('/admin/relatorios', { token });
      expect(rel.status).toBe(200);
      expect(rel.body.relatorio).toBeDefined();

      const refreshed = await client.post('/admin/refresh', {}, { token });
      expect(refreshed.status).toBe(200);
      expect(refreshed.body.token).toBeTruthy();
    }
  );

  it.skipIf(!runIntegration || !adminEmail || !adminPassword)(
    'fluxo admin: team e invites',
    async () => {
      const login = await client.post('/admin/login', { email: adminEmail, password: adminPassword });
      const token = login.body.token;

      const team = await client.get('/admin/team', { token });
      expect(team.status).toBe(200);
      expect(Array.isArray(team.body.members)).toBe(true);

      const invites = await client.get('/admin/invites', { token });
      expect(invites.status).toBe(200);
      expect(Array.isArray(invites.body.invites)).toBe(true);
    }
  );
});
