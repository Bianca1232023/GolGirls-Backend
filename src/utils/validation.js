const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    const err = new Error(`${field} é obrigatório`);
    err.status = 400;
    throw err;
  }
  return value.trim();
}

export function assertEmail(email) {
  const e = assertNonEmptyString(email, 'email');
  if (!EMAIL_RE.test(e)) {
    const err = new Error('email inválido');
    err.status = 400;
    throw err;
  }
  return e;
}

export function assertPassword(password) {
  const p = assertNonEmptyString(password, 'password');
  if (p.length < 8) {
    const err = new Error('password deve ter no mínimo 8 caracteres');
    err.status = 400;
    throw err;
  }
  return p;
}
