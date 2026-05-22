import { refreshAccessToken } from '../utils/jwtTokens.js';

export async function refresh(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 401, message: 'Token não fornecido' });
  }
  try {
    const newToken = refreshAccessToken(token);
    res.json({ status: 200, token: newToken });
  } catch (err) {
    res.status(err.status || 403).json({
      status: err.status || 403,
      message: err.message || 'Não foi possível renovar a sessão',
    });
  }
}
