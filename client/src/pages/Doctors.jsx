// client/src/pages/Doctors.jsx
import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdEdit, MdPhone, MdEmail, MdToggleOn, MdToggleOff } from 'react-icons/md';
import Header from '../components/Header';
import Modal  from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';

const SPECS = ['Cardiology','Neurology','General Medicine','Orthopedics','Dermatology','Pediatrics','Oncology','Radiology','Psychiatry','Emergency Medicine','Endocrinology','Gastroenterology','Urology','Rheumatology'];
const SPEC_COLOR = { Cardiology:'#EF4444', Neurology:'#8B5CF6', 'General Medicine':'#00D4B4', Orthopedics:'#F59E0B', Dermatology:'#EC4899', Pediatrics:'#22C55E', Oncology:'#6366F1', Radiology:'#3B82F6', Psychiatry:'#14B8A6', 'Emergency Medicine':'#F97316', Endocrinology:'#84CC16', Gastroenterology:'#06B6D4', Urology:'#A78BFA', Rheumatology:'#FB923C' };
const EMPTY = { firstName:'', lastName:'', specialization:'Cardiology', department:'', phone:'', email:'', licenseNumber:'', available:true };

export default function Doctors() {
  const { doctors, appointments, loading, refresh } = useApp();
  const [search,    setSearch]    = useState('');
  const [specF,     setSpecF]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const filtered = useMemo(() => doctors.filter(d => {
    const name = `${d.firstName} ${d.lastName}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase()) || d.department?.toLowerCase().includes(search.toLowerCase()))
        && (!specF || d.specialization === specF);
  }), [doctors, search, specF]);

  const patientCount = (doctorId) => appointments.filter(a => (a.doctorId?._id || a.doctorId) === doctorId && a.status === 'scheduled').length;

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function openAdd() { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); }
  function openEdit(d) {
    setEditing(d._id);
    setForm({ firstName:d.firstName, lastName:d.lastName, specialization:d.specialization, department:d.department, phone:d.phone, email:d.email, licenseNumber:d.licenseNumber, available:d.available });
    setError(''); setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.licenseNumber || !form.department) {
      setError('Please fill all required fields.'); return;
    }
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/api/doctors/${editing}`, form);
      else await api.post('/api/doctors', form);
      await refresh('doctors');
      setShowModal(false);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function toggleAvailable(d) {
    await api.put(`/api/doctors/${d._id}`, { available: !d.available });
    await refresh('doctors');
  }

  return (
    <div>
      <Header title="Doctors" subtitle={`${doctors.length} total · ${doctors.filter(d => d.available).length} available for appointments`} />
      <div className="page-container">
        {/* Toolbar */}
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:240 }}>
            <MdSearch size={18} />
            <input placeholder="Search doctors or department…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={specF} onChange={e => setSpecF(e.target.value)} style={{ width:200 }}>
            <option value="">All Specializations</option>
            {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Doctor</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : filtered.length === 0
          ? <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>No doctors found</div>
          : <div className="grid-3">
              {filtered.map(d => {
                const color = SPEC_COLOR[d.specialization] || 'var(--accent-teal)';
                const pts = patientCount(d._id);
                return (
                  <div key={d._id} className="card card-body animate-in" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                        <div className="avatar" style={{ width:52, height:52, fontSize:18, background: color+'22', color }}>
                          {d.firstName[0]}{d.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15 }}>Dr. {d.firstName} {d.lastName}</div>
                          <span className="badge" style={{ background:color+'22', color, marginTop:4, fontSize:11 }}>{d.specialization}</span>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}><MdEdit size={16}/></button>
                    </div>

                    <div style={{ borderTop:'1px solid var(--border-color)', paddingTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                      <div style={{ fontSize:13, color:'var(--text-muted)' }}>
                        <strong style={{ color:'var(--text-secondary)' }}>Dept:</strong> {d.department}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-muted)' }}>
                        <MdPhone size={14} /> {d.phone}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-muted)' }}>
                        <MdEmail size={14} /> {d.email}
                      </div>
                      <div style={{ fontSize:13 }}>
                        <span className="badge badge-info">{pts} scheduled appt{pts !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-color)', paddingTop:12 }}>
                      <span className={`badge badge-${d.available ? 'success' : 'danger'}`}>
                        {d.available ? '● Available' : '● Unavailable'}
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleAvailable(d)} title="Toggle availability" style={{ padding: '4px 8px' }}>
                        {d.available
                          ? <MdToggleOn size={30} color="var(--success)" />
                          : <MdToggleOff size={30} color="var(--text-muted)" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        }

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Doctor'}</button>
          </>}
        >
          {error && <div className="alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e => setField('firstName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e => setField('lastName', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Specialization *</label>
              <select className="form-control" value={form.specialization} onChange={e => setField('specialization', e.target.value)}>
                {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Department *</label><input className="form-control" value={form.department} onChange={e => setField('department', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setField('email', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">License Number *</label><input className="form-control" placeholder="MD-XXX" value={form.licenseNumber} onChange={e => setField('licenseNumber', e.target.value)} /></div>
        </Modal>
      </div>
    </div>
  );
}
