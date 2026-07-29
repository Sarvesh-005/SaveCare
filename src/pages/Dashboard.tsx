import React from 'react';
import { patients, doctors, appointments } from '../data/mock';

export default function Dashboard() {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">
          <div className="card-title">Patients</div>
          <div className="card-value">{patients.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Doctors</div>
          <div className="card-value">{doctors.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Appointments</div>
          <div className="card-value">{appointments.length}</div>
        </div>
      </div>
      <section>
        <h3>Recent Patients</h3>
        <ul className="list">
          {patients.slice(0,5).map(p => (
            <li key={p.id}>{p.name} — {p.phone} — {p.email}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
