import { useMemo, useState, useEffect } from 'react';
import { Patient } from '../types';
import { patients as initialPatients } from '../data/mock';
import * as api from '../api/patients';

export default function Patients() {
  const [items, setItems] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', date_of_birth: '', gender: 'other', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.listPatients()
      .then(list => {
        if (!mounted) return;
        setItems(list);
        setError(null);
      })
      .catch(err => {
        console.warn('API patients fetch failed, falling back to mocks', err);
        if (!mounted) return;
        setItems(initialPatients);
        setError('Could not load patients from API — using local mock data');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q));
  }, [items, query]);

  async function addPatient(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Patient> = {
      name: form.name,
      date_of_birth: form.date_of_birth,
      gender: form.gender as 'male'|'female'|'other',
      phone: form.phone,
      email: form.email,
      address: form.address,
    };

    try {
      const created = await api.createPatient(payload);
      setItems(s => [created, ...s]);
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', date_of_birth: '', gender: 'other', address: '' });
      setError(null);
    } catch (err: any) {
      console.error('Create patient failed', err);
      setError(err?.message || 'Failed to create patient.');
      // fallback: still add locally so user isn't blocked
      const newP: Patient = {
        id: (Math.random() * 1e9).toFixed(0),
        name: form.name,
        date_of_birth: form.date_of_birth,
        gender: form.gender as 'male'|'female'|'other',
        phone: form.phone,
        email: form.email,
        address: form.address,
        blood_group: 'Unknown',
        allergies: '',
        emergency_contact: '',
        created_at: new Date().toISOString(),
        created_by: 'local',
      };
      setItems(s => [newP, ...s]);
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', date_of_birth: '', gender: 'other', address: '' });
    }
  }

  return (
    <div className="page">
      <h2>Patients</h2>
      <div className="toolbar">
        <input placeholder="Search patients by name, phone or email" value={query} onChange={e => setQuery(e.target.value)} />
        <button onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : 'Add Patient'}</button>
      </div>

      {loading ? <div>Loading patients...</div> : null}
      {error ? <div style={{color:'crimson', marginBottom:8}}>{error}</div> : null}

      {showForm && (
        <form className="card form" onSubmit={addPatient}>
          <div className="form-row">
            <label>Name<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
            <label>Phone<input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
          </div>
          <div className="form-row">
            <label>Email<input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
            <label>DOB<input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} /></label>
          </div>
          <div className="form-row">
            <label>Gender<select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select></label>
            <label>Address<input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></label>
          </div>
          <div className="form-actions">
            <button type="submit">Create</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Email</th><th>DOB</th></tr>
        </thead>
        <tbody>
          {results.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.email}</td>
              <td>{p.date_of_birth || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
