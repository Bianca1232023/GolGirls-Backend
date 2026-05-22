# Dados fictícios para teste local

Gerar/atualizar no banco:

```bash
cd ~/Documentos/GoGirls-Backend
docker compose exec api node prisma/seed.js
# ou, no host:
node prisma/seed.js
```

## Credenciais

| Perfil | Acesso | Dado |
|--------|--------|------|
| **Admin** | E-mail + senha | `admin.teste@gogirls.local` / `SenhaTeste123` |
| **Professor** | E-mail + senha | `prof.ana@gogirls.local` / `SenhaTeste123` |
| **Aluna 1** | Só matrícula | `2026001` — Julia Santos |
| **Aluna 2** | Só matrícula | `2026002` — Beatriz Oliveira |
| **Aluna 3** | Só matrícula | `2026003` — Larissa Costa |

## Estrutura criada

- Núcleo: **Núcleo Centro**
- Escola: **EM GolGirls**
- Turma: **Turma Futebol 2026** (vinculada à professora Ana)
- Presenças de exemplo em maio/2026 (para testar jornada e relatórios)

## URLs

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Swagger: http://localhost:3001/api-docs
