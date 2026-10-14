import { describe, it, expect, beforeEach } from 'vitest';
import { readJSON, writeJSON } from '../src/lib/storage.js';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('devuelve el fallback cuando no hay valor', () => {
    expect(readJSON('inexistente', [])).toEqual([]);
    expect(readJSON('inexistente')).toBeNull();
  });

  it('guarda y recupera JSON', () => {
    writeJSON('clave', { a: 1 });
    expect(readJSON('clave')).toEqual({ a: 1 });
  });

  it('devuelve el fallback si el contenido es inválido', () => {
    localStorage.setItem('corrupto', '{no-json');
    expect(readJSON('corrupto', 'fallback')).toBe('fallback');
  });
});
