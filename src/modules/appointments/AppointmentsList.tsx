import { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { appointmentsApi } from '../../api/appointments';
import { formatDateTime } from '../../lib/date';
import { AppointmentFormModal } from './AppointmentFormModal';
import { Select } from '../../components/Form';
import type { Appointment } from '../../types';

export function AppointmentsList() {
  const [items, setItems] = useState<(Appointment & { patient_name?: string; doctor_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await appointmentsApi.list(status ? { status } : {});
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [status]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Appointments</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 180 }}>
            <Select
              label=""
              value={status}
              onChange={setStatus}
              options={[
                ['', 'All'],
                ['scheduled', 'Scheduled'],
                ['completed', 'Completed'],
                ['cancelled', 'Cancelled'],
                ['no_show', 'No-show'],
              ].map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          <button className="btn" onClick={() => setShowForm(true)}>
            + New appointment
          </button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'scheduled_at', header: 'When', render: (r) => formatDateTime(r.scheduled_at) },
          { key: 'patient_name', header: 'Patient' },
          { key: 'doctor_name', header: 'Doctor' },
          { key: 'reason', header: 'Reason' },
          { key: 'status', header: 'Status', render: (r) => <span className="mono">{r.status}</span> },
        ]}
        rows={items}
        loading={loading}
      />
      {showForm && (
        <AppointmentFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}
