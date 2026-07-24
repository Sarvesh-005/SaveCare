import { describe, it, expect } from 'vitest';
import { matchSymptoms } from './matcher.js';

describe('matchSymptoms', () => {
  it('includes a disclaimer', () => {
    const r = matchSymptoms(['fever']);
    expect(r.disclaimer).toMatch(/not a medical diagnosis/i);
  });
  it('ranks flu above common cold for fever+cough+body_ache', () => {
    const r = matchSymptoms(['fever', 'cough', 'body_ache']);
    expect(r.conditions[0].name).toMatch(/influenza|flu/i);
    expect(r.conditions[0].matchScore).toBeGreaterThan(r.conditions[1].matchScore);
  });
  it('returns matched symptoms per condition', () => {
    const r = matchSymptoms(['fever', 'cough']);
    expect(r.conditions[0].matchedSymptoms).toContain('fever');
  });
  it('caps results at 5', () => {
    const r = matchSymptoms(['fever', 'cough', 'headache', 'fatigue', 'sore_throat', 'body_ache']);
    expect(r.conditions.length).toBeLessThanOrEqual(5);
  });
  it('filters out low-score matches', () => {
    const r = matchSymptoms(['fever']);
    for (const c of r.conditions) expect(c.matchScore).toBeGreaterThan(0);
  });
  it('is deterministic', () => {
    const a = matchSymptoms(['fever', 'cough']);
    const b = matchSymptoms(['fever', 'cough']);
    expect(a).toEqual(b);
  });
});
