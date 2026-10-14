import { describe, it, expect } from 'vitest';
import { matchesFilters, compareBySort } from '../src/lib/filters.js';

const attrs = { category: 'jabones', price: 5, name: 'Jabón de Lavanda', stock: true };

describe('matchesFilters', () => {
  it('muestra todo con filtros por defecto', () => {
    expect(matchesFilters(attrs, {})).toBe(true);
  });

  it('filtra por categoría', () => {
    expect(matchesFilters(attrs, { category: 'jabones' })).toBe(true);
    expect(matchesFilters(attrs, { category: 'cremas' })).toBe(false);
    expect(matchesFilters(attrs, { category: 'all' })).toBe(true);
  });

  it('filtra por precio máximo', () => {
    expect(matchesFilters(attrs, { maxPrice: 5 })).toBe(true);
    expect(matchesFilters(attrs, { maxPrice: 4.99 })).toBe(false);
  });

  it('filtra por stock', () => {
    expect(matchesFilters(attrs, { stockOnly: true })).toBe(true);
    expect(matchesFilters({ ...attrs, stock: false }, { stockOnly: true })).toBe(false);
  });

  it('busca por nombre sin distinguir mayúsculas', () => {
    expect(matchesFilters(attrs, { query: 'lavanda' })).toBe(true);
    expect(matchesFilters(attrs, { query: 'cacao' })).toBe(false);
  });

  it('combina varios filtros', () => {
    expect(matchesFilters(attrs, { category: 'jabones', query: 'lavanda', maxPrice: 6 })).toBe(true);
    expect(matchesFilters(attrs, { category: 'jabones', query: 'lavanda', maxPrice: 4 })).toBe(false);
  });
});

describe('compareBySort', () => {
  const a = { price: 10, name: 'Zumo', featured: false };
  const b = { price: 5, name: 'Aceite', featured: true };

  it('ordena por precio ascendente', () => {
    expect(compareBySort(a, b, 'price-asc')).toBeGreaterThan(0);
  });

  it('ordena por precio descendente', () => {
    expect(compareBySort(a, b, 'price-desc')).toBeLessThan(0);
  });

  it('ordena por nombre', () => {
    expect(compareBySort(a, b, 'name-asc')).toBeGreaterThan(0);
  });

  it('destacados primero en modo featured', () => {
    expect(compareBySort(a, b, 'featured')).toBeGreaterThan(0);
  });
});
