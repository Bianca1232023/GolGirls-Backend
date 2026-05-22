import 'dotenv/config';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-characters-long';
}
process.env.NODE_ENV = 'test';
