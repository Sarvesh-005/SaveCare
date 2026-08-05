// client/src/pages/Billing.jsx
import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdCheckCircle, MdReceipt } from 'react-icons/md';
import Header    from '../components/Header';
import Modal     from '../components/Modal';
import StatCard  from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';

const STATUS_BADGE = { pending:'badge-warning', paid:'badge-success', overdue:'badge-danger', cancelled:'badge-muted' };
const EMPTY_ITEM   = { description:'', quantity:1, unitPrice:0, total:0 };
const EMPTY_FORM   = { patientId:'', appointmentId:'', items:[{ ...EMPTY_ITEM }], tax:0 };

export default function Billing() {
  const { invoices, patients, appointments, loading, refresh } = useApp();
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0), [invoices]);
  const totalPending = useMemo(() => invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0), [invoices]);

  const filtered = useMemo(() => invoices.filter(i => {
    const name = `${i.patientId?.firstName || ''} ${i.patientId?.lastName || ''}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase()) || i.invoiceNumber?.includes(search))
        && (!statusF || i.status === statusF);
  }), [invoices, search, statusF]);

  function setItem(idx, key, val) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: key === 'description' ? val : Number(val) };
      items[idx].total = items[idx].quantity * items[idx].unitPrice;
      return { ...f, items };
    });
  }
  function addItem()       { setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] })); }
  function removeItem(idx) { setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) })); }

  const subtotal = form.items.reduce((s, item) => s + item.total, 0);
  const total    = subtotal + (subtotal * form.tax / 100);

  async function handleSubmit() {
    if (!form.patientId || form.items.length === 0 || form.items.some(i => !i.description)) {
      setError('Select a patient and fill all line item descriptions.'); return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/api/billing', { ...form, subtotal, total });
      await refresh('invoices');
      setShowModal(false); setForm(EMPTY_FORM);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function markPaid(inv) {
    await api.put(`/api/billing/${inv._id}`, { status:'paid', paymentMethod:'cash' });
    await refresh('invoices');
  }

  const fmt = n => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  return (
    <div>
      <Header title="Billing" subtitle="Invoice management · Revenue tracking & payment status" />
      <div className="page-container">
        {/* Summary */}
        <div className="grid-3" style={{ marginBottom:28 }}>
          <StatCard icon={<MdReceipt size={24} />} label="Total Revenue"   value={fmt(totalRevenue)} color="var(--success)" bg="rgba(34,197,94,0.15)" />
          <StatCard icon={<MdReceipt size={24} />} label="Pending Amount"  value={fmt(totalPending)} color="var(--warning)" bg="rgba(245,158,11,0.15)" />
          <StatCard icon={<MdReceipt size={24} />} label="Overdue Amount"  value={fmt(totalOverdue)} color="var(--danger)"  bg="rgba(239,68,68,0.15)" />
        </div>

        {/* Toolbar */}
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:240 }}>
            <MdSearch size={18} />
            <input placeholder="Search patient or invoice #…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={statusF} onChange={e => setStatusF(e.target.value)} style={{ width:160 }}>
            <option value="">All Statuses</option>
            {['pending','paid','overdue','cancelled'].map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }}><MdAdd /> New Invoice</button>
        </div>

        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Invoice #</th><th>Patient</th><th>Date</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
                  : filtered.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No invoices found</td></tr>
                  : filtered.map(inv => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight:700, color:'var(--accent-teal)' }}>{inv.invoiceNumber}</td>
                      <td style={{ fontWeight:500 }}>{inv.patientId?.firstName} {inv.patientId?.lastName}</td>
                      <td>{new Date(inv.issuedAt).toLocaleDateString()}</td>
                      <td>{fmt(inv.subtotal)}</td>
                      <td>{inv.tax || 0}%</td>
                      <td style={{ fontWeight:700 }}>{fmt(inv.total)}</td>
                      <td><span className={`badge ${STATUS_BADGE[inv.status]}`} style={{ textTransform:'capitalize' }}>{inv.status}</span></td>
                      <td>
                        {inv.status === 'pending' && (
                          <button onClick={() => markPaid(inv)}
                            style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background:'rgba(34,197,94,0.15)', color:'var(--success)', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:500 }}>
                            <MdCheckCircle size={16} /> Mark Paid
                          </button>
                        )}
                        {inv.status === 'paid' && <span style={{ fontSize:12, color:'var(--success)' }}>✓ {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : 'Paid'}</span>}
                        {inv.status === 'overdue' && <span style={{ fontSize:12, color:'var(--danger)' }}>Overdue</span>}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Invoice"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Create Invoice'}</button>
          </>}
        >
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Patient *</label>
            <select className="form-control" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId:e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Linked Appointment (optional)</label>
            <select className="form-control" value={form.appointmentId} onChange={e => setForm(f => ({ ...f, appointmentId:e.target.value }))}>
              <option value="">None</option>
              {appointments.filter(a => (a.patientId?._id || a.patientId) === form.patientId).map(a => (
                <option key={a._id} value={a._id}>{new Date(a.date).toLocaleDateString()} {a.time} — {a.type}</option>
              ))}
            </select>
          </div>

          <div style={{ fontWeight:600, fontSize:12, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Line Items</div>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display:'grid', gridTemplateColumns:'1fr 60px 90px auto', gap:8, marginBottom:8, alignItems:'end' }}>
              <div className="form-group" style={{ margin:0 }}>
                {idx === 0 && <label className="form-label">Description</label>}
                <input className="form-control" placeholder="Service or item…" value={item.description} onChange={e => setItem(idx,'description',e.target.value)} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                {idx === 0 && <label className="form-label">Qty</label>}
                <input type="number" min={1} className="form-control" value={item.quantity} onChange={e => setItem(idx,'quantity',e.target.value)} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                {idx === 0 && <label className="form-label">Price ($)</label>}
                <input type="number" min={0} step="0.01" className="form-control" value={item.unitPrice} onChange={e => setItem(idx,'unitPrice',e.target.value)} />
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)', alignSelf:'flex-end', paddingBottom:10 }} onClick={() => removeItem(idx)}>✕</button>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom:16 }}><MdAdd /> Add Line</button>

          <div className="form-row">
            <div className="form-group"><label className="form-label">Tax (%)</label>
              <input type="number" min={0} max={100} className="form-control" value={form.tax} onChange={e => setForm(f => ({ ...f, tax:Number(e.target.value) }))} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:16, gap:4 }}>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>Subtotal: <strong>{fmt(subtotal)}</strong></div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--accent-teal)' }}>Total: {fmt(total)}</div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
