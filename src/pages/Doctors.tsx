import React from 'react';
import { doctors } from '../data/mock';

export default function Doctors() {
  return (
    <div className="page">
      <h2>Doctors</h2>
      <div className="cards grid">
        {doctors.map(d => (
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
