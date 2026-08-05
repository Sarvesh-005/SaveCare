import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { billingApi } from '../../api/billing';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/date';
import { Select } from '../../components/Form';
import { useAuth } from '../../context/AuthContext';
import type { Bill } from '../../types';

export function BillingList() {
  const [items, setItems] = useState<(Bill & { patient_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = user?.role !== 'doctor';

  const load = async () => {
    setLoading(true);
    try {
      const r = await billingApi.list(status ? { status } : {});
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
        <h1 style={{ margin: 0 }}>Billing</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 180 }}>
            <Select
              label=""
              value={status}
              onChange={setStatus}
              options={[
                ['', 'All'],
                ['unpaid', 'Unpaid'],
                ['partial', 'Partial'],
                ['paid', 'Paid'],
                ['refunded', 'Refunded'],
              ].map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          {canWrite && <button className="btn" onClick={() => navigate('/billing/new')}>+ New bill</button>}
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'patient_name', header: 'Patient' },
          {
            key: 'total_cents',
            header: 'Total',
            render: (r) => <span className="mono">{formatMoney(r.total_cents)}</span>,
          },
          { key: 'status', header: 'Status', render: (r) => <span className="mono">{r.status}</span> },
          { key: 'method', header: 'Method' },
          { key: 'created_at', header: 'Created', render: (r) => formatDate(r.created_at) },
        ]}
        rows={items}
        loading={loading}
        onRowClick={(r) => navigate(`/billing/${r.id}`)}
      />
    </div>
  );
}
