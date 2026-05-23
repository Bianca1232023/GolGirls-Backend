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
      <p>Você foi convidada(o) como professor(a) na plataforma <strong>GoLGirls</strong>.</p>
      <p>Clique no link abaixo para informar seu <strong>nome completo</strong> e criar sua senha de acesso:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>24 horas</strong>.</p>
      <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
    `,
  });
}

export async function sendAdminSetupEmail(to, token) {
  const link = `${process.env.APP_URL}/admin/definir-senha?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'GolGirls – Cadastro de Administrador',
    html: `
      <p>Olá!</p>
      <p>Você foi convidado(a) como <strong>administrador(a)</strong> na plataforma <strong>GoLGirls</strong>.</p>
      <p>Clique no link abaixo para informar seu <strong>nome completo</strong> e criar sua senha de acesso:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>24 horas</strong>.</p>
      <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
    `,
  });
}

export async function sendAlunoSetupEmail(to, token, nome) {
  const link = `${process.env.APP_URL}/aluno/definir-senha?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'GolGirls – Defina sua senha de acesso',
    html: `
      <p>Olá, ${nome}!</p>
      <p>Você foi cadastrada na plataforma <strong>GoLGirls</strong>.</p>
      <p>Clique no link abaixo para criar sua senha de acesso:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>24 horas</strong>.</p>
    `,
  });
}

export async function sendAlunoPasswordResetEmail(to, token) {
  const link = `${process.env.APP_URL}/aluno/redefinir-senha?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'GolGirls – Redefinição de senha (Aluna)',
    html: `
      <p>Olá!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta de aluna na <strong>GoLGirls</strong>.</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>1 hora</strong>.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, token, role) {
  const path = role === 'admin' ? 'admin' : role === 'aluno' ? 'aluno' : 'professor';
  const link = `${process.env.APP_URL}/${path}/redefinir-senha?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'GolGirls – Redefinição de senha',
    html: `
      <p>Olá!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta na plataforma <strong>GoLGirls</strong>.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em <strong>1 hora</strong>.</p>
      <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
    `,
  });
}
