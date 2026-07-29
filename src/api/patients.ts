import { request } from './client';
import { Patient } from '../types';

export async function listPatients(): Promise<Patient[]> {
  return request('/api/patients') as Promise<Patient[]>;
}

export async function getPatient(id: string): Promise<Patient> {
  return request(`/api/patients/${id}`) as Promise<Patient>;
}

export async function createPatient(payload: Partial<Patient>): Promise<Patient> {
  return request('/api/patients', { method: 'POST', body: JSON.stringify(payload) }) as Promise<Patient>;
}
