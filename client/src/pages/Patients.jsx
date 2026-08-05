// client/src/pages/Patients.jsx
import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import Header from '../components/Header';
import Modal  from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';

const EMPTY_FORM = {
  firstName:'', lastName:'', dateOfBirth:'', gender:'male',
  bloodType:'Unknown', phone:'', email:'', address:'',
  allergies:'',
  emergencyContact: { name:'', phone:'', relation:'' }
};
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'];
const GENDER_COLOR = { male:'var(--accent-blue)', female:'var(--accent-teal)', other:'var(--accent-purple)' };

const ageFromDOB = dob => dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : '?';

export default function Patients() {
  const { patients, loading, refresh } = useApp();
  const [search,    setSearch]    = useState('');
  const [genderF,   setGenderF]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const filtered = useMemo(() => patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase()) || p.phone?.includes(search))
        && (!genderF || p.gender === genderF);
  }), [patients, search, genderF]);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setEC(k, v)    { setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [k]: v } })); }

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); }
  function openEdit(p) {
    setEditing(p._id);
    setForm({
      firstName: p.firstName, lastName: p.lastName,
      dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
      gender: p.gender, bloodType: p.bloodType || 'Unknown',
      phone: p.phone, email: p.email || '', address: p.address || '',
      allergies: (p.allergies || []).join(', '),
      emergencyContact: p.emergencyContact || { name:'', phone:'', relation:'' }
    });
    setError(''); setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.phone || !form.dateOfBirth || !form.gender) {
      setError('Please fill all required fields.'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form, allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean) };
      if (editing) await api.put(`/api/patients/${editing}`, payload);
      else await api.post('/api/patients', payload);
      await refresh('patients');
      setShowModal(false);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Deactivate this patient?')) return;
    await api.del(`/api/patients/${id}`);
    await refresh('patients');
  }

  return (
    <div>
      <Header title="Patients" subtitle={`${patients.length} patients · Comprehensive care database`} />
      <div className="page-container">
        {/* Toolbar */}
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:240 }}>
            <MdSearch size={18} />
            <input placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={genderF} onChange={e => setGenderF(e.target.value)} style={{ width:150 }}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Patient</button>
        </div>

        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead><tr>
                <th>Patient</th><th>Age</th><th>Gender</th><th>Blood Type</th>
                <th>Phone</th><th>Allergies</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
                  : filtered.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No patients found</td></tr>
                  : filtered.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar" style={{ width:36, height:36, fontSize:13, background: GENDER_COLOR[p.gender]+'22', color: GENDER_COLOR[p.gender] }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{ageFromDOB(p.dateOfBirth)} yrs</td>
                      <td><span className="badge badge-info" style={{ textTransform:'capitalize' }}>{p.gender}</span></td>
                      <td><span className="badge badge-teal">{p.bloodType}</span></td>
                      <td>{p.phone}</td>
                      <td>
                        {(p.allergies || []).length === 0
                          ? <span style={{ color:'var(--text-muted)' }}>None</span>
                          : (p.allergies || []).map(a => <span key={a} className="badge badge-danger" style={{ marginRight:4 }}>{a}</span>)
                        }
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit"><MdEdit size={16} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p._id)} title="Deactivate" style={{ color:'var(--danger)' }}><MdDelete size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Patient' : 'Add New Patient'}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Patient'}</button>
          </>}
        >
          {error && <div className="alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={form.firstName} onChange={e => setField('firstName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={form.lastName} onChange={e => setField('lastName', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date of Birth *</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Gender *</label>
              <select className="form-control" value={form.gender} onChange={e => setField('gender', e.target.value)}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Blood Type</label>
              <select className="form-control" value={form.bloodType} onChange={e => setField('bloodType', e.target.value)}>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={e => setField('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e => setField('address', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Allergies (comma-separated)</label><input className="form-control" placeholder="Penicillin, Sulfa…" value={form.allergies} onChange={e => setField('allergies', e.target.value)} /></div>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8, marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Emergency Contact</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.emergencyContact.name} onChange={e => setEC('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.emergencyContact.phone} onChange={e => setEC('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Relation</label><input className="form-control" placeholder="Spouse, Parent…" value={form.emergencyContact.relation} onChange={e => setEC('relation', e.target.value)} /></div>
        </Modal>
      </div>
    </div>
  );
}
