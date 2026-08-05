import { apiFetch } from './client';
import type { Doctor } from '../types';

export const doctorsApi = {
  list: () => apiFetch('/api/doctors') as Promise<{ items: Doctor[] }>,
  get: (id: string) => apiFetch(`/api/doctors?id=${id}`) as Promise<Doctor>,
  create: (data: Partial<Doctor>) =>
    apiFetch('/api/doctors', { method: 'POST', body: JSON.stringify(data) }) as Promise<Doctor>,
  update: (id: string, data: Partial<Doctor>) =>
    apiFetch(`/api/doctors?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Doctor>,
  remove: (id: string) => apiFetch(`/api/doctors?id=${id}`, { method: 'DELETE' }),
};
