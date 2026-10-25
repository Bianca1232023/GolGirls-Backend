import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = 'santanabianca447@gmail.com';
const name = 'GolAdmin';
const password = process.env.ADMIN_SEED_PASSWORD;

if (!password || password.length < 8) {
  throw new Error('Defina ADMIN_SEED_PASSWORD com pelo menos 8 caracteres no ambiente ou no .env.');
}

const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);

try {
  await prisma.admin.upsert({
    where: { email },
    create: { name, email, password: passwordHash, ativo: true },
    update: { name, password: passwordHash, ativo: true },
  });
  console.info(`Administrador ${email} criado/atualizado com sucesso.`);
} finally {
  await prisma.$disconnect();
}
