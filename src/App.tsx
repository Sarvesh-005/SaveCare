import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/auth/LoginPage';
import { Dashboard } from './modules/dashboard/Dashboard';
import { PatientsList } from './modules/patients/PatientsList';
import { PatientDetail } from './modules/patients/PatientDetail';
import { DoctorsList } from './modules/doctors/DoctorsList';
import { DoctorDetail } from './modules/doctors/DoctorDetail';
import { AppointmentsList } from './modules/appointments/AppointmentsList';
import { RecordsList } from './modules/records/RecordsList';
import { BillingList } from './modules/billing/BillingList';
import { BillDetail } from './modules/billing/BillDetail';
import { DiagnosisPage } from './modules/diagnosis/DiagnosisPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <Protected>
                  <Layout />
                </Protected>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientsList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/doctors/:id" element={<DoctorDetail />} />
              <Route path="/appointments" element={<AppointmentsList />} />
              <Route path="/records" element={<RecordsList />} />
              <Route path="/billing" element={<BillingList />} />
              <Route path="/billing/:id" element={<BillDetail />} />
              <Route path="/diagnosis" element={<DiagnosisPage />} />
              <Route path="*" element={<div className="card">Not found</div>} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
