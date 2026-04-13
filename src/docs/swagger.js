import swaggerJsdoc from 'swagger-jsdoc';

const PORT = Number(process.env.PORT) || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoGirls Backend API',
      version: '1.0.0',
      description: 'Documentacao da API do projeto GoGirls Backend.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'teste.admin@example.com' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
        RegisterAdminInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Admin Teste' },
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
      },
    },
    paths: {
      '/': {
        get: {
          tags: ['Health'],
          summary: 'Verifica status da API',
          responses: {
            200: { description: 'API online' },
          },
        },
      },
      '/register': {
        post: {
          tags: ['Auth'],
          summary: 'Cadastra admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterAdminInput' },
              },
            },
          },
          responses: {
            201: { description: 'Admin registrado' },
            409: { description: 'Email já cadastrado' },
          },
        },
      },
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login de admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
              },
            },
          },
          responses: {
            200: { description: 'Token JWT retornado' },
            401: { description: 'Credenciais inválidas' },
          },
        },
      },
      '/admins': {
        get: {
          tags: ['Admins'],
          summary: 'Lista admins',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'id',
              schema: { type: 'integer' },
              required: false,
            },
          ],
          responses: {
            200: { description: 'Lista de admins' },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/admins/{id}': {
        put: {
          tags: ['Admins'],
          summary: 'Atualiza admin completo',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterAdminInput' },
              },
            },
          },
          responses: {
            200: { description: 'Admin atualizado' },
          },
        },
        patch: {
          tags: ['Admins'],
          summary: 'Atualiza admin parcial',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            200: { description: 'Admin atualizado parcialmente' },
          },
        },
        delete: {
          tags: ['Admins'],
          summary: 'Remove admin',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Admin removido' },
          },
        },
      },
      '/participants/register': {
        post: {
          tags: ['Participants'],
          summary: 'Cadastra participante',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['matricula', 'nucleo', 'funcao'],
                  properties: {
                    matricula: { type: 'string' },
                    nucleo: { type: 'string' },
                    funcao: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Participante cadastrado' },
          },
        },
      },
      '/participants': {
        get: {
          tags: ['Participants'],
          summary: 'Lista participantes',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de participantes' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
