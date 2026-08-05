import { apiFetch } from './client';
import type { MedicalRecord } from '../types';

export const recordsApi = {
  list: (patientId?: string) =>
    apiFetch(`/api/records${patientId ? `?patient_id=${patientId}` : ''}`) as Promise<{
      items: (MedicalRecord & { patient_name?: string; doctor_name?: string })[];
    }>,
  create: (data: Partial<MedicalRecord>) =>
    apiFetch('/api/records', { method: 'POST', body: JSON.stringify(data) }) as Promise<MedicalRecord>,
  update: (id: string, data: Partial<MedicalRecord>) =>
    apiFetch(`/api/records?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<MedicalRecord>,
};
