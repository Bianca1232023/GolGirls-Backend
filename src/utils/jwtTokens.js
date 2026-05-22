import jwt from 'jsonwebtoken';

const MAX_REFRESH_AFTER_EXPIRY_SEC = 7 * 24 * 60 * 60;

export function issueToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

/** Renova JWT se ainda dentro da janela de refresh (7 dias após expirar). */
export function refreshAccessToken(oldToken) {
  const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && now - decoded.exp > MAX_REFRESH_AFTER_EXPIRY_SEC) {
    const err = new Error('Sessão expirada. Faça login novamente.');
    err.status = 403;
    throw err;
  }
  if (!decoded.id || !decoded.role) {
    const err = new Error('Token inválido');
    err.status = 403;
    throw err;
  }
  return issueToken({ id: decoded.id, role: decoded.role });
}
