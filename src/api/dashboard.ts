import { apiFetch } from './client';
import { appointmentsApi } from './appointments';

export const dashboardApi = {
  stats: () =>
    apiFetch('/api/stats') as Promise<{
      patient_count: number;
      upcoming_appointments: number;
      pending_bills_cents: number;
      todays_appointments: number;
    }>,
  recentAppointments: () => appointmentsApi.list(),
};
