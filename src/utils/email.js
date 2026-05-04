import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordSetupEmail(to, token) {
  const link = `${process.env.APP_URL}/professor/definir-senha?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'GolGirls – Defina sua senha de acesso',
    html: `
      <p>Olá!</p>
      <p>Você foi convidada(o) como professor(a) na plataforma <strong>GoGirls</strong>.</p>
      <p>Clique no link abaixo para informar seu <strong>nome completo</strong> e criar sua senha de acesso:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>24 horas</strong>.</p>
      <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
    `,
  });
}
