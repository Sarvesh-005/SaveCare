import { apiFetch } from './client';
import type { Bill } from '../types';

export const billingApi = {
  list: (params: { patient_id?: string; status?: string } = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/api/bills?${qs}`) as Promise<{ items: (Bill & { patient_name?: string })[] }>;
  },
  get: (id: string) => apiFetch(`/api/bills?id=${id}`) as Promise<Bill & { patient_name?: string }>,
  create: (data: Partial<Bill>) =>
    apiFetch('/api/bills', { method: 'POST', body: JSON.stringify(data) }) as Promise<Bill>,
  update: (id: string, data: Partial<Bill>) =>
    apiFetch(`/api/bills?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Bill>,
  pay: (id: string, paid_amount_cents: number, method: string) =>
    apiFetch(`/api/bills/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paid_amount_cents, method }),
    }) as Promise<Bill>,
};
