// client/src/pages/AIDiagnosis.jsx
import { useState, useMemo } from 'react';
import { MdSearch, MdPsychology, MdScience, MdClose, MdWarning, MdSave } from 'react-icons/md';
import Header from '../components/Header';
import Modal  from '../components/Modal';
import { useApp } from '../context/AppContext';
import { api }    from '../utils/api';
import { diagnose, SYMPTOM_OPTIONS } from '../utils/diagnosisEngine';

const SEVERITY_BADGE = { mild:'badge-success', moderate:'badge-warning', severe:'badge-danger' };
const SEVERITY_COLOR = { mild:'var(--success)', moderate:'var(--warning)', severe:'var(--danger)' };

export default function AIDiagnosis() {
  const { patients, doctors, refresh } = useApp();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomSearch,    setSymptomSearch]    = useState('');
  const [age,              setAge]              = useState('');
  const [gender,           setGender]           = useState('');
  const [results,          setResults]          = useState(null);
  const [animated,         setAnimated]         = useState(false);
  const [saveModal,        setSaveModal]        = useState(false);
  const [saveForm,         setSaveForm]         = useState({ patientId:'', doctorId:'', resultIndex:0 });
  const [saving,           setSaving]           = useState(false);
  const [saved,            setSaved]            = useState(false);

  const filteredSymptoms = useMemo(() =>
    SYMPTOM_OPTIONS.filter(s =>
      !selectedSymptoms.includes(s.key) &&
      (!symptomSearch || s.label.toLowerCase().includes(symptomSearch.toLowerCase()))
    ),
  [selectedSymptoms, symptomSearch]);

  function addSymptom(key) {
    setSelectedSymptoms(s => [...s, key]);
    setSymptomSearch('');
    setResults(null);
  }
  function removeSymptom(key) {
    setSelectedSymptoms(s => s.filter(k => k !== key));
    setResults(null);
  }

  function runDiagnosis() {
    const res = diagnose(selectedSymptoms, Number(age), gender);
    setResults(res);
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
    setSaved(false);
  }

  async function handleSave() {
    if (!saveForm.patientId || !saveForm.doctorId) return;
    setSaving(true);
    const result = results[saveForm.resultIndex];
    try {
      await api.post('/api/records', {
        patientId:  saveForm.patientId,
        doctorId:   saveForm.doctorId,
        diagnosis:  `[AI Assistant] ${result.condition} (${result.confidence}% confidence)`,
        symptoms:   selectedSymptoms.map(getLabel),
        notes:      `AI Diagnosis Assistant — Severity: ${result.severity.toUpperCase()}. Recommended tests: ${result.tests.join(', ')}. Specialist: ${result.specialist}. Description: ${result.description}`
      });
      await refresh('records');
      setSaveModal(false); setSaved(true);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  const getLabel = key => SYMPTOM_OPTIONS.find(s => s.key === key)?.label || key;

  return (
    <div>
      <Header title="AI Diagnosis Assistant" subtitle="Clinical decision support · Symptom analysis & recommendations" />
      <div className="page-container">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

          {/* LEFT: Input Panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Patient Context */}
            <div className="card card-body">
              <div style={{ fontWeight:700, marginBottom:14, fontSize:15, display:'flex', alignItems:'center', gap:8 }}>
                <MdPsychology size={22} color="var(--accent-teal)" /> Patient Context
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" min={0} max={120} placeholder="e.g. 35" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Symptom Input */}
            <div className="card card-body">
              <div style={{ fontWeight:700, marginBottom:14, fontSize:15 }}>Select Symptoms ({selectedSymptoms.length})</div>

              {selectedSymptoms.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14, padding:'10px 12px', background:'var(--bg-secondary)', borderRadius:8, border:'1px solid var(--border-color)' }}>
                  {selectedSymptoms.map(key => (
                    <span key={key} className="tag active" onClick={() => removeSymptom(key)}>
                      {getLabel(key)} <MdClose size={12} style={{ opacity:0.8 }} />
                    </span>
                  ))}
                </div>
              )}

              <div className="search-bar" style={{ marginBottom:10 }}>
                <MdSearch size={18} />
                <input placeholder="Search 80+ symptoms…" value={symptomSearch} onChange={e => setSymptomSearch(e.target.value)} />
              </div>

              <div style={{ maxHeight:240, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                {filteredSymptoms.slice(0, 20).map(s => (
                  <button key={s.key} className="tag" onClick={() => addSymptom(s.key)} style={{ justifyContent:'flex-start', borderRadius:6, padding:'6px 12px' }}>
                    + {s.label}
                  </button>
                ))}
                {filteredSymptoms.length === 0 && <div style={{ color:'var(--text-muted)', fontSize:13, padding:'8px 0' }}>No symptoms match term</div>}
              </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={runDiagnosis} disabled={selectedSymptoms.length === 0} style={{ width:'100%', justifyContent:'center' }}>
              <MdPsychology size={20} /> Analyse Symptoms
            </button>
          </div>

          {/* RIGHT: Results Panel */}
          <div>
            {!results && (
              <div className="card card-body" style={{ textAlign:'center', padding:60 }}>
                <MdPsychology size={64} style={{ color:'var(--border-color)', marginBottom:16 }} />
                <div style={{ color:'var(--text-muted)', fontSize:15, marginBottom:6, fontWeight:600 }}>Select symptoms &amp; click Analyse</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>The engine will evaluate 20+ conditions and return confidence scores</div>
              </div>
            )}

            {results && results.length === 0 && (
              <div className="card card-body" style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:44, marginBottom:12 }}>🤔</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>No strong matches found</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>Try adding more symptoms for a more detailed analysis.</div>
              </div>
            )}

            {results && results.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>Diagnosis Results ({results.length})</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {saved && <span className="badge badge-success">✓ Saved to Medical Records</span>}
                    <button className="btn btn-secondary btn-sm" onClick={() => setSaveModal(true)}>
                      <MdSave size={16} /> Save to Record
                    </button>
                  </div>
                </div>

                {results.map((r, i) => (
                  <div key={r.condition} className="card card-body animate-in" style={{ animationDelay:`${i * 80}ms` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{r.condition}</div>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <span className={`badge ${SEVERITY_BADGE[r.severity]}`} style={{ textTransform:'capitalize' }}>{r.severity}</span>
                          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Specialist: <strong>{r.specialist}</strong></span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:24, fontWeight:800, color: SEVERITY_COLOR[r.severity], lineHeight:1.1 }}>{r.confidence}%</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>confidence</div>
                      </div>
                    </div>

                    <div className="progress-bar" style={{ marginBottom:12 }}>
                      <div className="progress-fill" style={{ width: animated ? `${r.confidence}%` : '0%', background:`linear-gradient(90deg, ${SEVERITY_COLOR[r.severity]}, var(--accent-blue))` }} />
                    </div>

                    <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>{r.description}</div>

                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:4 }}>
                        <MdScience size={14} /> Recommended Diagnostic Tests
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {r.tests.map(t => <span key={t} className="badge badge-info" style={{ fontSize:11 }}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display:'flex', gap:10, padding:'12px 16px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, alignItems:'flex-start' }}>
                  <MdWarning color="var(--warning)" size={20} style={{ flexShrink:0, marginTop:2 }} />
                  <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
                    <strong style={{ color:'var(--warning)' }}>Clinical Decision Support Only:</strong> These results are produced by a rule-based algorithm. They are intended for assistance only and must be validated by a licensed medical practitioner.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Modal */}
        <Modal isOpen={saveModal} onClose={() => setSaveModal(false)} title="Save AI Diagnosis to Patient Record"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setSaveModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !saveForm.patientId || !saveForm.doctorId}>{saving ? 'Saving…' : 'Save Record'}</button>
          </>}
        >
          <div className="form-group"><label className="form-label">Select Diagnosis</label>
            <select className="form-control" value={saveForm.resultIndex} onChange={e => setSaveForm(f => ({ ...f, resultIndex:Number(e.target.value) }))}>
              {results?.map((r, i) => <option key={i} value={i}>{r.condition} ({r.confidence}% confidence)</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Patient *</label>
            <select className="form-control" value={saveForm.patientId} onChange={e => setSaveForm(f => ({ ...f, patientId:e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Attending Doctor *</label>
            <select className="form-control" value={saveForm.doctorId} onChange={e => setSaveForm(f => ({ ...f, doctorId:e.target.value }))}>
              <option value="">Select doctor…</option>
              {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>)}
            </select>
          </div>
        </Modal>
      </div>
    </div>
  );
}
