import { describe, it, expect } from 'vitest';
import { formatMoney, parseMoney, sumItems } from './money.js';

describe('formatMoney', () => {
  it('formats cents to dollars', () => {
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(1099)).toBe('$10.99');
    expect(formatMoney(100000)).toBe('$1,000.00');
  });
  it('handles negative', () => {
    expect(formatMoney(-500)).toBe('-$5.00');
  });
});

describe('parseMoney', () => {
  it('parses dollar strings to cents', () => {
    expect(parseMoney('10.99')).toBe(1099);
    expect(parseMoney('$1,000.00')).toBe(100000);
    expect(parseMoney('5')).toBe(500);
  });
  it('returns 0 for garbage', () => {
    expect(parseMoney('garbage')).toBe(0);
    expect(parseMoney('')).toBe(0);
  });
});

describe('sumItems', () => {
  it('sums item amounts', () => {
    expect(sumItems([{ amount_cents: 1000 }, { amount_cents: 2500 }])).toBe(3500);
  });
  it('returns 0 for empty', () => {
    expect(sumItems([])).toBe(0);
  });
});
