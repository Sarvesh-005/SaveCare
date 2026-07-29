import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const loc = useLocation();
  return (
    <nav className="nav">
      <div className="nav-brand">CareSave HMS</div>
      <div className="nav-links">
        <Link className={loc.pathname === '/' ? 'active' : ''} to="/">Dashboard</Link>
        <Link className={loc.pathname === '/patients' ? 'active' : ''} to="/patients">Patients</Link>
        <Link className={loc.pathname === '/doctors' ? 'active' : ''} to="/doctors">Doctors</Link>
      </div>
    </nav>
  );
}
