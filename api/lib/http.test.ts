import { describe, it, expect } from 'vitest';
import { ApiError, errorBody } from './http.js';

describe('ApiError', () => {
  it('carries status, code, message', () => {
    const e = new ApiError(404, 'NOT_FOUND', 'nope');
    expect(e.status).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
    expect(e.message).toBe('nope');
  });
});

describe('errorBody', () => {
  it('shapes the error response', () => {
    expect(errorBody('VALIDATION', 'bad input')).toEqual({ error: { code: 'VALIDATION', message: 'bad input' } });
  });
});
