// client/src/pages/MedicalRecords.jsx
import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdExpandMore, MdExpandLess, MdFolderOpen } from 'react-icons/md';
import Header from '../components/Header';
import Modal  from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';

const EMPTY = {
  patientId:'', doctorId:'', diagnosis:'',
  symptoms:'', prescription:'', labResults:'', notes:'',
  vitalSigns:{ bloodPressure:'', heartRate:'', temperature:'', weight:'', height:'' }
};

export default function MedicalRecords() {
  const { records, patients, doctors, loading, refresh } = useApp();
  const [search,      setSearch]      = useState('');
  const [selectedPat, setSelectedPat] = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [expanded,    setExpanded]    = useState({});

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setVS(k, v)    { setForm(f => ({ ...f, vitalSigns: { ...f.vitalSigns, [k]: v } })); }
  function toggleExpand(id) { setExpanded(e => ({ ...e, [id]: !e[id] })); }

  const filtered = useMemo(() => records.filter(r => {
    const patName = `${r.patientId?.firstName || ''} ${r.patientId?.lastName || ''}`.toLowerCase();
    const patId   = r.patientId?._id || r.patientId;
    return (!search || r.diagnosis?.toLowerCase().includes(search.toLowerCase()) || patName.includes(search.toLowerCase()))
        && (!selectedPat || patId === selectedPat);
  }), [records, search, selectedPat]);

  async function handleSubmit() {
    if (!form.patientId || !form.doctorId || !form.diagnosis) {
      setError('Patient, doctor, and diagnosis are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        symptoms:     form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        prescription: form.prescription ? [{ medication: form.prescription, dosage:'As prescribed', duration:'See notes' }] : [],
        labResults:   form.labResults   ? [{ test: form.labResults, result:'See notes', unit:'', normalRange:'' }] : []
      };
      await api.post('/api/records', payload);
      await refresh('records');
      setShowModal(false); setForm(EMPTY);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  return (
    <div>
      <Header title="Medical Records" subtitle={`${records.length} clinical records · Patient history & diagnoses`} />
      <div className="page-container">
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ flex:1, minWidth:240 }}>
            <MdSearch size={18} />
            <input placeholder="Search by diagnosis or patient…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" value={selectedPat} onChange={e => setSelectedPat(e.target.value)} style={{ width:220 }}>
            <option value="">All Patients</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(''); setShowModal(true); }}><MdAdd /> Add Record</button>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : filtered.length === 0
          ? <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
              <MdFolderOpen size={56} style={{ marginBottom:12, opacity:0.3 }} />
              <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>No records found</div>
              <div style={{ fontSize:13 }}>Add a medical record to get started</div>
            </div>
          : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filtered.map(r => {
                const open = expanded[r._id];
                return (
                  <div key={r._id} className="card">
                    <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }} onClick={() => toggleExpand(r._id)}>
                      <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                        <div className="avatar" style={{ background:'rgba(0,212,180,0.15)', color:'var(--accent-teal)', width:40, height:40, fontSize:14 }}>
                          {r.patientId?.firstName?.[0]}{r.patientId?.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:700 }}>{r.diagnosis}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                            {r.patientId?.firstName} {r.patientId?.lastName} &nbsp;·&nbsp; Dr. {r.doctorId?.lastName} &nbsp;·&nbsp; {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        {(r.symptoms || []).slice(0,3).map(s => <span key={s} className="badge badge-muted" style={{ fontSize:11 }}>{s}</span>)}
                        {open ? <MdExpandLess size={20} color="var(--text-muted)" /> : <MdExpandMore size={20} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {open && (
                      <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border-color)', paddingTop:16 }}>
                        <div className="grid-2" style={{ gap:20 }}>
                          <div>
                            <div style={{ fontWeight:600, marginBottom:8, fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Symptoms</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                              {(r.symptoms || []).length
                                ? r.symptoms.map(s => <span key={s} className="badge badge-warning">{s}</span>)
                                : <span style={{ color:'var(--text-muted)', fontSize:13 }}>None recorded</span>}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontWeight:600, marginBottom:8, fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Prescription</div>
                            {(r.prescription || []).length
                              ? r.prescription.map((p, i) => <div key={i} style={{ fontSize:13 }}>💊 {p.medication} — {p.dosage} ({p.duration})</div>)
                              : <span style={{ color:'var(--text-muted)', fontSize:13 }}>None</span>}
                          </div>

                          {r.notes && (
                            <div style={{ gridColumn:'1/-1' }}>
                              <div style={{ fontWeight:600, marginBottom:6, fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Notes</div>
                              <div style={{ fontSize:13, color:'var(--text-secondary)', background:'var(--bg-secondary)', padding:'10px 14px', borderRadius:8 }}>{r.notes}</div>
                            </div>
                          )}

                          {r.labResults && r.labResults.length > 0 && (
                            <div>
                              <div style={{ fontWeight:600, marginBottom:8, fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Lab Results</div>
                              {r.labResults.map((l, i) => (
                                <div key={i} style={{ fontSize:13 }}>🧪 {l.test}: <strong>{l.result}</strong> {l.unit} <span style={{ color:'var(--text-muted)' }}>(Normal: {l.normalRange})</span></div>
                              ))}
                            </div>
                          )}

                          {r.vitalSigns && (r.vitalSigns.bloodPressure || r.vitalSigns.heartRate || r.vitalSigns.temperature) && (
                            <div>
                              <div style={{ fontWeight:600, marginBottom:8, fontSize:12, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Vital Signs</div>
                              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                {r.vitalSigns.bloodPressure && <span className="badge badge-info">BP: {r.vitalSigns.bloodPressure}</span>}
                                {r.vitalSigns.heartRate     && <span className="badge badge-info">HR: {r.vitalSigns.heartRate} bpm</span>}
                                {r.vitalSigns.temperature   && <span className="badge badge-info">Temp: {r.vitalSigns.temperature}°C</span>}
                                {r.vitalSigns.weight        && <span className="badge badge-info">Wt: {r.vitalSigns.weight} kg</span>}
                                {r.vitalSigns.height        && <span className="badge badge-info">Ht: {r.vitalSigns.height} cm</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        }

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medical Record"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Add Record'}</button>
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
              {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Diagnosis *</label><input className="form-control" placeholder="Primary diagnosis…" value={form.diagnosis} onChange={e => setField('diagnosis', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Symptoms (comma-separated)</label><input className="form-control" placeholder="Fever, Cough, Fatigue…" value={form.symptoms} onChange={e => setField('symptoms', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Prescription</label><input className="form-control" placeholder="Medication name and dosage…" value={form.prescription} onChange={e => setField('prescription', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Lab Results</label><input className="form-control" placeholder="Test name and result…" value={form.labResults} onChange={e => setField('labResults', e.target.value)} /></div>
          <div style={{ fontWeight:600, fontSize:12, color:'var(--text-muted)', marginBottom:8, marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Vital Signs</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Blood Pressure</label><input className="form-control" placeholder="120/80" value={form.vitalSigns.bloodPressure} onChange={e => setVS('bloodPressure', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Heart Rate (bpm)</label><input type="number" className="form-control" value={form.vitalSigns.heartRate} onChange={e => setVS('heartRate', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Temperature (°C)</label><input type="number" step="0.1" className="form-control" value={form.vitalSigns.temperature} onChange={e => setVS('temperature', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Weight (kg)</label><input type="number" className="form-control" value={form.vitalSigns.weight} onChange={e => setVS('weight', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} /></div>
        </Modal>
      </div>
    </div>
  );
}
