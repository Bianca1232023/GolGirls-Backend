import http from 'node:http';

/**
 * Cliente HTTP leve para E2E sem dependência de supertest.
 */
export function createTestClient(app) {
  let server;
  let baseUrl;

  async function start() {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }

  async function stop() {
    if (!server) return;
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    server = null;
  }

  async function req(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return { status: res.status, body: data };
  }

  return {
    start,
    stop,
    get: (path, opts) => req('GET', path, opts),
    post: (path, body, opts) => req('POST', path, { ...opts, body }),
  };
}
