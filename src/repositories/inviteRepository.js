import prisma from '../models/prisma.js';

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function create(email, role) {
  const invite = await prisma.invite.create({ data: { email, role } });
  return invite.id;
}

export async function findAll() {
  const invites = await prisma.invite.findMany({ orderBy: { created_at: 'desc' } });

  return Promise.all(
    invites.map(async (invite) => {
      let status = 'pendente';
      if (invite.role === 'professor') {
        const p = await prisma.professor.findFirst({
          where: { email: invite.email },
          select: { ativo: true },
        });
        if (p) status = p.ativo ? 'aceito' : 'pendente';
      } else if (invite.role === 'admin') {
        const a = await prisma.admin.findFirst({
          where: { email: invite.email },
          select: { ativo: true },
        });
        if (a) status = a.ativo ? 'aceito' : 'pendente';
      }
      return { ...invite, status };
    })
  );
}
