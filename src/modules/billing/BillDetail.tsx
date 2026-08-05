import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billingApi } from '../../api/billing';
import { formatMoney, sumItems } from '../../lib/money';
import { formatDate } from '../../lib/date';
import { TextField, Select, Field } from '../../components/Form';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { Bill, BillItem } from '../../types';

export function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = user?.role !== 'doctor';
  const [bill, setBill] = useState<(Bill & { patient_name?: string }) | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'insurance'>('cash');
  const [paid, setPaid] = useState(0);
  const { toast } = useToast();

  const load = async () => {
    if (!id) return;
    try {
      const b = await billingApi.get(id);
      setBill(b);
      setItems(b.items || []);
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };
  useEffect(() => {
    load();
  }, [id]);

  const addItem = () => {
    if (!desc || amount <= 0) {
      toast('Description and amount required', 'error');
      return;
    }
    setItems((it) => [...it, { desc, amount_cents: amount }]);
    setDesc('');
    setAmount(0);
  };
  const removeItem = (i: number) => setItems((it) => it.filter((_, idx) => idx !== i));
  const saveItems = async () => {
    if (!id) return;
    try {
      const b = await billingApi.update(id, { items, method });
      setBill(b);
      toast('Bill updated', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };
  const pay = async () => {
    if (!id) return;
    try {
      const b = await billingApi.pay(id, paid || bill!.total_cents, method);
      setBill(b);
      toast('Payment recorded', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  if (!bill) return <div className="card">Loading…</div>;
  const total = sumItems(items);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Bill · {bill.patient_name}</h1>
        <button className="btn secondary" onClick={() => navigate('/billing')}>
          Back
        </button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div>
          <strong>Status:</strong> <span className="mono">{bill.status}</span> · <strong>Paid:</strong>{' '}
          {formatMoney(bill.paid_amount_cents)} / {formatMoney(bill.total_cents)} · <strong>Created:</strong> {formatDate(bill.created_at)}
        </div>
      </div>
      {canWrite && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Line items</h3>
          {items.map((it, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span>{it.desc}</span>
              <span className="mono">
                {formatMoney(it.amount_cents)}{' '}
                <button className="btn secondary" style={{ padding: '2px 8px' }} onClick={() => removeItem(i)}>
                  ✕
                </button>
              </span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, marginTop: 12 }}>
            <TextField label="Description" value={desc} onChange={setDesc} />
            <TextField
              label="Amount ($)"
              type="number"
              value={String((amount / 100).toFixed(2))}
              onChange={(v) => setAmount(Math.round(parseFloat(v || '0') * 100))}
            />
            <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={addItem}>
              Add
            </button>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Total: {formatMoney(total)}</strong>
            <button className="btn" onClick={saveItems}>
              Save items
            </button>
          </div>
        </div>
      )}
      {canWrite && (
        <div className="card">
          <h3>Record payment</h3>
          <Field>
            <TextField
              label="Amount ($)"
              type="number"
              value={String((paid / 100).toFixed(2))}
              onChange={(v) => setPaid(Math.round(parseFloat(v || '0') * 100))}
            />
          </Field>
          <Field>
            <Select
              label="Method"
              value={method}
              onChange={(v) => setMethod(v as 'cash' | 'card' | 'insurance')}
              options={[
                ['cash', 'Cash'],
                ['card', 'Card'],
                ['insurance', 'Insurance'],
              ].map(([v, l]) => ({ value: v, label: l }))}
            />
          </Field>
          <button className="btn" onClick={pay}>
            Record payment
          </button>
        </div>
      )}
    </div>
  );
}
