import { apiFetch } from './client';
import type { Patient } from '../types';

export const patientsApi = {
  list: (search = '', page = 1) =>
    apiFetch(`/api/patients?search=${encodeURIComponent(search)}&page=${page}`) as Promise<{
      items: Patient[];
      page: number;
      limit: number;
    }>,
  get: (id: string) => apiFetch(`/api/patients?id=${id}`) as Promise<Patient>,
  create: (data: Partial<Patient>) =>
    apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) }) as Promise<Patient>,
  update: (id: string, data: Partial<Patient>) =>
    apiFetch(`/api/patients?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Patient>,
  remove: (id: string) => apiFetch(`/api/patients?id=${id}`, { method: 'DELETE' }),
};
