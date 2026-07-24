import { describe, it, expect } from 'vitest';
import { hasConflict } from './conflict.js';

const base = '2026-07-24T10:00:00.000Z';

describe('hasConflict', () => {
  it('returns false when no existing appointments', () => {
    expect(hasConflict([], base)).toBe(false);
  });
  it('returns false when existing is far away (>30 min)', () => {
    const far = '2026-07-24T11:00:00.000Z';
    expect(hasConflict([{ scheduled_at: far, status: 'scheduled' }], base)).toBe(false);
  });
  it('returns true when existing is within 30 min and active', () => {
    const near = '2026-07-24T10:20:00.000Z';
    expect(hasConflict([{ scheduled_at: near, status: 'scheduled' }], base)).toBe(true);
  });
  it('returns true when existing is exactly at the same time', () => {
    expect(hasConflict([{ scheduled_at: base, status: 'completed' }], base)).toBe(true);
  });
  it('returns false when existing is cancelled/no_show', () => {
    const near = '2026-07-24T10:10:00.000Z';
    expect(hasConflict([{ scheduled_at: near, status: 'cancelled' }], base)).toBe(false);
    expect(hasConflict([{ scheduled_at: near, status: 'no_show' }], base)).toBe(false);
  });
  it('respects a custom window', () => {
    const edge = '2026-07-24T10:45:00.000Z'; // 45 min away
    expect(hasConflict([{ scheduled_at: edge, status: 'scheduled' }], base, 30)).toBe(false);
    expect(hasConflict([{ scheduled_at: edge, status: 'scheduled' }], base, 60)).toBe(true);
  });
  it('ignores invalid dates gracefully', () => {
    expect(hasConflict([{ scheduled_at: 'garbage', status: 'scheduled' }], base)).toBe(false);
  });
});
