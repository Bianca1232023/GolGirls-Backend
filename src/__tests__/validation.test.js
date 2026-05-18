import { describe, it, expect } from 'vitest';
import {
  assertNonEmptyString,
  assertEmail,
  assertPassword,
} from '../utils/validation.js';

describe('assertNonEmptyString', () => {
  it('retorna o valor trimado quando válido', () => {
    expect(assertNonEmptyString('  João  ', 'name')).toBe('João');
  });

  it('lança erro 400 quando vazio', () => {
    expect(() => assertNonEmptyString('', 'name')).toThrowError('name é obrigatório');
  });

  it('lança erro 400 quando só espaços', () => {
    expect(() => assertNonEmptyString('   ', 'name')).toThrowError('name é obrigatório');
  });

  it('lança erro 400 quando não é string', () => {
    expect(() => assertNonEmptyString(null, 'name')).toThrowError('name é obrigatório');
    expect(() => assertNonEmptyString(42, 'name')).toThrowError('name é obrigatório');
  });
});

describe('assertEmail', () => {
  it('retorna o e-mail válido', () => {
    expect(assertEmail('aluno@golgirls.org')).toBe('aluno@golgirls.org');
  });

  it('lança erro 400 para e-mail sem @', () => {
    expect(() => assertEmail('invalido')).toThrowError('email inválido');
  });

  it('lança erro 400 para e-mail sem domínio', () => {
    expect(() => assertEmail('sem@')).toThrowError('email inválido');
  });

  it('lança erro 400 quando vazio', () => {
    expect(() => assertEmail('')).toThrowError('email é obrigatório');
  });
});

describe('assertPassword', () => {
  it('aceita senha com 8 ou mais caracteres', () => {
    expect(assertPassword('SenhaOk1')).toBe('SenhaOk1');
  });

  it('lança erro 400 para senha com menos de 8 caracteres', () => {
    expect(() => assertPassword('curta')).toThrowError('password deve ter no mínimo 8 caracteres');
  });

  it('lança erro 400 quando vazio', () => {
    expect(() => assertPassword('')).toThrowError('password é obrigatório');
  });
});
