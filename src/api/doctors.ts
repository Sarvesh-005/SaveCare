import { request } from './client';
import { Doctor } from '../types';

export async function listDoctors(): Promise<Doctor[]> {
  return request('/api/doctors') as Promise<Doctor[]>;
}

export async function getDoctor(id: string): Promise<Doctor> {
  return request(`/api/doctors/${id}`) as Promise<Doctor>;
}
