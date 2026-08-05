import { apiFetch } from './client';
import type { DiagnosisResponse } from '../types';

export const diagnosisApi = {
  analyze: (symptoms: string[]) =>
    apiFetch('/api/diagnosis/analyze', { method: 'POST', body: JSON.stringify({ symptoms }) }) as Promise<
      DiagnosisResponse
    >,
};
