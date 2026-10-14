import { describe, it, expect } from 'vitest';
import { roundMoney, formatPrice } from '../src/lib/money.js';

describe('roundMoney', () => {
  it('redondea a 2 decimales', () => {
    expect(roundMoney(3.456)).toBe(3.46);
    expect(roundMoney(10)).toBe(10);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

describe('formatPrice', () => {
  it('usa coma decimal y símbolo €', () => {
    expect(formatPrice(3.8)).toBe('3,80€');
    expect(formatPrice(10)).toBe('10,00€');
    expect(formatPrice(0)).toBe('0,00€');
  });
});
