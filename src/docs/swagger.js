import swaggerJsdoc from 'swagger-jsdoc';

const PORT = Number(process.env.PORT) || 3001;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoGirls Backend API',
      version: '1.0.0',
      description: 'Documentação da API do projeto GoGirls Backend.',
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
        AdminLoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
        AdminRegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Admin Teste' },
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
        EmailInput: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'usuario@example.com' },
          },
        },
        SetPasswordInput: {
          type: 'object',
          required: ['token', 'name', 'password'],
          properties: {
            token: { type: 'string', example: 'abc123token' },
            name: { type: 'string', example: 'Nome do Usuário' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
        ResetPasswordInput: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string', example: 'abc123token' },
            password: { type: 'string', example: 'NovaSenha123' },
          },
        },
        ProfessorLoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'professor@example.com' },
            password: { type: 'string', example: 'SenhaSegura123' },
          },
        },
        AlunoLoginInput: {
          type: 'object',
          required: ['matricula'],
          properties: {
            matricula: { type: 'string', example: '2024001' },
          },
        },
        CreateAlunoInput: {
          type: 'object',
          required: ['nome', 'matricula', 'nucleo_id', 'escola_id', 'bairro', 'turma_id'],
          properties: {
            nome: { type: 'string', example: 'Maria Silva' },
            matricula: { type: 'string', example: '2024001' },
            nucleo_id: { type: 'integer', example: 1 },
            escola_id: { type: 'integer', example: 2 },
            bairro: { type: 'string', example: 'Centro' },
            turma_id: { type: 'integer', example: 3 },
          },
        },
        CreateTurmaInput: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: { type: 'string', example: 'Turma A' },
          },
        },
        CreateNomeInput: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: { type: 'string', example: 'Nome do item' },
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

      // ── Admin Auth ──────────────────────────────────────────────────────────
      '/admin/register': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Cadastra admin diretamente',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminRegisterInput' },
              },
            },
          },
          responses: {
            201: { description: 'Admin registrado com sucesso' },
            409: { description: 'Email já cadastrado' },
          },
        },
      },
      '/admin/login': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Login de admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminLoginInput' },
              },
            },
          },
          responses: {
            200: { description: 'Token JWT retornado' },
            401: { description: 'Credenciais inválidas' },
          },
        },
      },
      '/admin/invite': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Convida novo admin por e-mail (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmailInput' },
              },
            },
          },
          responses: {
            201: { description: 'Convite enviado com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
            409: { description: 'Email já cadastrado' },
          },
        },
      },
      '/admin/set-password': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Define nome e senha via token de convite (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SetPasswordInput' },
              },
            },
          },
          responses: {
            200: { description: 'Senha definida com sucesso' },
            400: { description: 'Token inválido ou expirado' },
          },
        },
      },
      '/admin/forgot-password': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Solicita redefinição de senha (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmailInput' },
              },
            },
          },
          responses: {
            200: { description: 'Link de redefinição enviado se o e-mail estiver cadastrado' },
          },
        },
      },
      '/admin/reset-password': {
        post: {
          tags: ['Admin — Auth'],
          summary: 'Redefine senha via token (admin)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordInput' },
              },
            },
          },
          responses: {
            200: { description: 'Senha redefinida com sucesso' },
            400: { description: 'Token inválido ou expirado' },
          },
        },
      },

      // ── Admins CRUD ─────────────────────────────────────────────────────────
      '/admins': {
        get: {
          tags: ['Admins'],
          summary: 'Lista admins (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'id',
              schema: { type: 'integer' },
              required: false,
              description: 'Filtra por ID',
            },
          ],
          responses: {
            200: { description: 'Lista de admins' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },
      '/admins/{id}': {
        put: {
          tags: ['Admins'],
          summary: 'Atualiza admin completo (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminRegisterInput' },
              },
            },
          },
          responses: {
            200: { description: 'Admin atualizado com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
        patch: {
          tags: ['Admins'],
          summary: 'Atualiza admin parcialmente (admin)',
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
            400: { description: 'Campo inválido' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
        delete: {
          tags: ['Admins'],
          summary: 'Remove admin (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Admin removido com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },

      // ── Professor Auth ──────────────────────────────────────────────────────
      '/admin/createprofessor': {
        post: {
          tags: ['Professor — Auth'],
          summary: 'Convida professor por e-mail (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmailInput' },
              },
            },
          },
          responses: {
            201: { description: 'Professor convidado com sucesso. E-mail enviado.' },
            403: { description: 'Acesso restrito a administradores' },
            409: { description: 'Email já cadastrado' },
          },
        },
      },
      '/professor/set-password': {
        post: {
          tags: ['Professor — Auth'],
          summary: 'Define nome e senha via token de convite (professor)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SetPasswordInput' },
              },
            },
          },
          responses: {
            200: { description: 'Senha definida com sucesso' },
            400: { description: 'Token inválido ou expirado' },
          },
        },
      },
      '/professor/login': {
        post: {
          tags: ['Professor — Auth'],
          summary: 'Login de professor',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfessorLoginInput' },
              },
            },
          },
          responses: {
            200: { description: 'Token JWT retornado' },
            401: { description: 'Credenciais inválidas' },
            403: { description: 'Conta inativa' },
          },
        },
      },
      '/professor/forgot-password': {
        post: {
          tags: ['Professor — Auth'],
          summary: 'Solicita redefinição de senha (professor)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmailInput' },
              },
            },
          },
          responses: {
            200: { description: 'Link de redefinição enviado se o e-mail estiver cadastrado' },
          },
        },
      },
      '/professor/reset-password': {
        post: {
          tags: ['Professor — Auth'],
          summary: 'Redefine senha via token (professor)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPasswordInput' },
              },
            },
          },
          responses: {
            200: { description: 'Senha redefinida com sucesso' },
            400: { description: 'Token inválido ou expirado' },
          },
        },
      },

      // ── Turmas ──────────────────────────────────────────────────────────────
      '/professor/createturma': {
        post: {
          tags: ['Turmas'],
          summary: 'Cria turma (professor)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTurmaInput' },
              },
            },
          },
          responses: {
            201: { description: 'Turma criada com sucesso' },
            403: { description: 'Acesso restrito a professores' },
          },
        },
      },
      '/professor/turmas': {
        get: {
          tags: ['Turmas'],
          summary: 'Lista turmas do professor autenticado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de turmas do professor' },
            403: { description: 'Acesso restrito a professores' },
          },
        },
      },
      '/admin/turmas': {
        get: {
          tags: ['Turmas'],
          summary: 'Lista todas as turmas (admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de todas as turmas' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },
      '/turmas/{id}/alunos': {
        get: {
          tags: ['Turmas'],
          summary: 'Lista alunos de uma turma (admin ou professor)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID da turma' },
          ],
          responses: {
            200: { description: 'Lista de alunos da turma' },
            403: { description: 'Acesso restrito a administradores e professores' },
          },
        },
      },

      // ── Alunos ──────────────────────────────────────────────────────────────
      '/aluno/login': {
        post: {
          tags: ['Aluno — Auth'],
          summary: 'Login de aluno via matrícula',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AlunoLoginInput' },
              },
            },
          },
          responses: {
            200: { description: 'Token JWT retornado' },
            401: { description: 'Matrícula inválida' },
          },
        },
      },
      '/professor/createaluno': {
        post: {
          tags: ['Alunos'],
          summary: 'Cadastra aluno em uma turma (professor)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAlunoInput' },
              },
            },
          },
          responses: {
            201: { description: 'Cadastro do aluno registrado com sucesso' },
            400: { description: 'Campo obrigatório ausente ou inválido' },
            403: { description: 'Acesso restrito a professores / turma não pertence ao professor' },
          },
        },
      },
      '/professor/alunos/{id}/turma': {
        patch: {
          tags: ['Alunos'],
          summary: 'Move aluno para outra turma (professor)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID do aluno' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['turma_id'],
                  properties: {
                    turma_id: { type: 'integer', example: 2 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Aluno movido para a turma com sucesso' },
            400: { description: 'turma_id é obrigatório' },
            403: { description: 'Acesso restrito a professores / turma não pertence ao professor' },
          },
        },
      },
      '/alunos': {
        get: {
          tags: ['Alunos'],
          summary: 'Lista alunos (admin vê todos; professor vê os seus com filtros)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'turma_id', schema: { type: 'integer' }, required: false },
            { in: 'query', name: 'nucleo_id', schema: { type: 'integer' }, required: false },
            { in: 'query', name: 'escola_id', schema: { type: 'integer' }, required: false },
            { in: 'query', name: 'bairro', schema: { type: 'string' }, required: false },
          ],
          responses: {
            200: { description: 'Lista de alunos' },
            403: { description: 'Acesso restrito a professores e administradores' },
          },
        },
      },

      // ── Núcleos ─────────────────────────────────────────────────────────────
      '/admin/nucleos': {
        post: {
          tags: ['Núcleos'],
          summary: 'Cria núcleo (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateNomeInput' },
              },
            },
          },
          responses: {
            201: { description: 'Núcleo criado com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },
      '/nucleos': {
        get: {
          tags: ['Núcleos'],
          summary: 'Lista núcleos (autenticado)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de núcleos' },
          },
        },
      },
      '/admin/nucleos/{id}': {
        delete: {
          tags: ['Núcleos'],
          summary: 'Remove núcleo (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Núcleo removido com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },

      // ── Escolas ─────────────────────────────────────────────────────────────
      '/admin/escolas': {
        post: {
          tags: ['Escolas'],
          summary: 'Cria escola (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateNomeInput' },
              },
            },
          },
          responses: {
            201: { description: 'Escola criada com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },
      '/escolas': {
        get: {
          tags: ['Escolas'],
          summary: 'Lista escolas (autenticado)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de escolas' },
          },
        },
      },
      '/admin/escolas/{id}': {
        delete: {
          tags: ['Escolas'],
          summary: 'Remove escola (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Escola removida com sucesso' },
            403: { description: 'Acesso restrito a administradores' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
