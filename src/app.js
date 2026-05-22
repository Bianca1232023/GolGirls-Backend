import 'dotenv/config';
import prisma from './models/prisma.js';
import { createApp } from './createApp.js';

const PORT = Number(process.env.PORT) || 3001;

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
  await prisma.$connect();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
