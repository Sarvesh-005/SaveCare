// client/src/pages/Appointments.jsx
import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import Header from '../components/Header';
import Modal  from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';

const TYPES    = ['consultation','followup','emergency'];
const STATUSES = ['scheduled','completed','cancelled'];
const STATUS_BADGE = { scheduled:'badge-info', completed:'badge-success', cancelled:'badge-danger' };
const TYPE_BADGE   = { consultation:'badge-teal', followup:'badge-info', emergency:'badge-danger' };
const EMPTY = { patientId:'', doctorId:'', date:'', time:'09:00', type:'consultation', status:'scheduled', reason:'', notes:'' };

export default function Appointments() {
  const { appointments, patients, doctors, loading, refresh } = useApp();
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const filtered = useMemo(() => appointments.filter(a => {
    const patient = `${a.patientId?.firstName || ''} ${a.patientId?.lastName || ''}`.toLowerCase();
    const doctor  = `${a.doctorId?.lastName || ''}`.toLowerCase();
    return (!search || patient.includes(search.toLowerCase()) || doctor.includes(search.toLowerCase()))
        && (!statusF || a.status === statusF);
  }), [appointments, search, statusF]);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openAdd()  { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); }
  function openEdit(a) {
    setEditing(a._id);
    setForm({
      patientId: a.patientId?._id || a.patientId,
      doctorId:  a.doctorId?._id  || a.doctorId,
      date:   a.date?.split('T')[0] || '',
      time:   a.time,
      type:   a.type,
      status: a.status,
      reason: a.reason || '',
      notes:  a.notes  || ''
    });
    setError(''); setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      setError('Patient, doctor, date, and time are required.'); return;
    }
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/api/appointments/${editing}`, form);
      else await api.post('/api/appointments', form);
      await refresh('appointments');
      setShowModal(false);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return;
    await api.del(`/api/appointments/${id}`);
    await refresh('appointments');
  }

  async function quickStatus(a, status) {
    await api.put(`/api/appointments/${a._id}`, { status });
    await refresh('appointments');
  }

  return (
    <div>
      <Header title="Appointments" subtitle={`${appointments.length} total · ${appointments.filter(a => a.status === 'scheduled').length} scheduled appointments`} />
      <div className="page-container">
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:240 }}>
            <MdSearch size={18} />
            <input placeholder="Search patient or doctor…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={statusF} onChange={e => setStatusF(e.target.value)} style={{ width:160 }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Book Appointment</button>
        </div>

        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
                  : filtered.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No appointments found</td></tr>
                  : filtered.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight:600 }}>{a.patientId?.firstName} {a.patientId?.lastName}</td>
                      <td>Dr. {a.doctorId?.lastName}
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.doctorId?.specialization}</div>
                      </td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight:600 }}>{a.time}</td>
                      <td><span className={`badge ${TYPE_BADGE[a.type]}`}>{a.type}</span></td>
                      <td style={{ maxWidth:160, color:'var(--text-muted)', fontSize:13 }}>{a.reason || '—'}</td>
                      <td>
                        <select value={a.status} onChange={e => quickStatus(a, e.target.value)}
                          className="form-control" style={{ padding:'4px 8px', width:130, fontSize:12 }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}><MdEdit size={16} /></button>
                          <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDelete(a._id)}><MdDelete size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Appointment' : 'Book Appointment'}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Book'}</button>
          </>}
        >
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Patient *</label>
            <select className="form-control" value={form.patientId} onChange={e => setField('patientId', e.target.value)}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Doctor *</label>
            <select className="form-control" value={form.doctorId} onChange={e => setField('doctorId', e.target.value)}>
              <option value="">Select doctor…</option>
              {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} — {d.specialization}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-control" value={form.date} onChange={e => setField('date', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Time *</label><input type="time" className="form-control" value={form.time} onChange={e => setField('time', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => setField('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t} style={{ textTransform:'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Reason</label><input className="form-control" placeholder="Brief reason for visit…" value={form.reason} onChange={e => setField('reason', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} /></div>
        </Modal>
      </div>
    </div>
  );
}
