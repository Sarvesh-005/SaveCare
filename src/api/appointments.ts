import { apiFetch } from './client';
import type { Appointment } from '../types';

export const appointmentsApi = {
  list: (params: { doctor_id?: string; date?: string; status?: string } = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/api/appointments?${qs}`) as Promise<{
      items: (Appointment & { patient_name?: string; doctor_name?: string })[];
    }>;
  },
  get: (id: string) => apiFetch(`/api/appointments?id=${id}`) as Promise<Appointment>,
  create: (data: Partial<Appointment>) =>
    apiFetch('/api/appointments', { method: 'POST', body: JSON.stringify(data) }) as Promise<Appointment>,
  update: (id: string, data: Partial<Appointment>) =>
    apiFetch(`/api/appointments?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<
      Appointment
    >,
  remove: (id: string) => apiFetch(`/api/appointments?id=${id}`, { method: 'DELETE' }),
};
