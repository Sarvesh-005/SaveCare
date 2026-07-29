import { useEffect, useState } from 'react';
import { doctors as initialDoctors } from '../data/mock';
import { Doctor } from '../types';
import * as api from '../api/doctors';

export default function Doctors() {
  const [list, setList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.listDoctors()
      .then(d => { if (!mounted) return; setList(d); setError(null); })
      .catch(err => {
        console.warn('Could not fetch doctors, using mock', err);
        if (!mounted) return; setList(initialDoctors); setError('Using local mock data');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  return (
    <div className="page">
      <h2>Doctors</h2>
      {loading ? <div>Loading doctors...</div> : null}
      {error ? <div style={{color:'crimson', marginBottom:8}}>{error}</div> : null}
      <div className="cards grid">
        {list.map(d => (
          <div className="card doctor" key={d.id}>
            <div className="doctor-name">{d.name}</div>
            <div className="doctor-spec">{d.specialization}</div>
            <div className="doctor-contact">{d.email} • {d.phone}</div>
            <div className="doctor-fee">Fee: ₹{(d.consultation_fee_cents/100).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
