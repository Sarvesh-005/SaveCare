// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Sidebar        from './components/Sidebar';
import Dashboard      from './pages/Dashboard';
import Patients       from './pages/Patients';
import Doctors        from './pages/Doctors';
import Appointments   from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Billing        from './pages/Billing';
import AIDiagnosis    from './pages/AIDiagnosis';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/patients"     element={<Patients />} />
          <Route path="/doctors"      element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/records"      element={<MedicalRecords />} />
          <Route path="/billing"      element={<Billing />} />
          <Route path="/ai"           element={<AIDiagnosis />} />
        </Routes>
      </main>
    </div>
  );
}
