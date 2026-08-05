import { useState, useEffect } from 'react';
import { StatCard, BarChart, DonutChart } from '../../components/charts';
import { dashboardApi } from '../../api/dashboard';
import { formatMoney } from '../../lib/money';
import { formatDateTime } from '../../lib/date';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    patient_count: number;
    upcoming_appointments: number;
    pending_bills_cents: number;
    todays_appointments: number;
  } | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(() => {});
    dashboardApi.recentAppointments().then((r) => setRecent(r.items.slice(0, 6))).catch(() => {});
  }, []);

  const byDay = Object.entries(
    recent.reduce(
      (acc: Record<string, number>, a) => {
        const d = new Date(a.scheduled_at).toLocaleDateString(undefined, { weekday: 'short' });
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      },
      {}
    )
  ).map(([label, value]) => ({ label, value }));

  const statusCounts = ['scheduled', 'completed', 'cancelled', 'no_show'].map((s, i) => ({
    label: s,
    value: recent.filter((a) => a.status === s).length,
    color: ['var(--teal)', '#0a5d5c', '#9aa6ad', 'var(--coral)'][i],
  }));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Welcome, {user?.name}</h1>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          <StatCard label="Patients" value={stats.patient_count} />
          <StatCard label="Today's appts" value={stats.todays_appointments} />
          <StatCard label="Upcoming" value={stats.upcoming_appointments} />
          <StatCard label="Pending bills" value={formatMoney(stats.pending_bills_cents)} />
        </div>
      ) : (
        <div className="card">Loading…</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <BarChart data={byDay.length ? byDay : [{ label: '—', value: 0 }]} />
        <DonutChart segments={statusCounts} />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Recent appointments</h3>
        {recent.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            <span>
              {a.patient_name} · {a.doctor_name}
            </span>
            <span className="mono">{formatDateTime(a.scheduled_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
