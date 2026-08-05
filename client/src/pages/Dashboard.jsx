// client/src/pages/Dashboard.jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MdPeople, MdLocalHospital, MdCalendarToday, MdReceipt, MdArrowForward } from 'react-icons/md';
import Header   from '../components/Header';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';

function buildRevenueData(invoices) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthInvoices = invoices.filter(inv => {
      const issued = new Date(inv.issuedAt);
      return issued.getMonth() === d.getMonth() && issued.getFullYear() === d.getFullYear();
    });
    const revenue = monthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const pending = monthInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);
    return { month: months[d.getMonth()], revenue, pending };
  });
}

const STATUS_BADGE = { scheduled:'badge-info', completed:'badge-success', cancelled:'badge-danger' };
const TYPE_BADGE   = { consultation:'badge-teal', followup:'badge-info', emergency:'badge-danger' };

export default function Dashboard() {
  const { patients, doctors, appointments, invoices, loading } = useApp();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const todayAppts    = appointments.filter(a => new Date(a.date).toDateString() === today);
  const pendingCount  = invoices.filter(i => i.status === 'pending').length;
  const totalRevenue  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const revenueData   = useMemo(() => buildRevenueData(invoices), [invoices]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome back · ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`}
      />
      <div className="page-container">

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <StatCard icon={<MdPeople size={26} />}        label="Total Patients"        value={patients.length}                             color="var(--accent-teal)" bg="rgba(15,185,129,0.12)" />
          <StatCard icon={<MdLocalHospital size={26} />} label="Available Doctors"     value={doctors.filter(d => d.available).length}     color="var(--accent-blue)" bg="rgba(37,99,235,0.12)" />
          <StatCard icon={<MdCalendarToday size={26} />} label="Today's Appointments"  value={todayAppts.length}                           color="var(--warning)" bg="rgba(217,119,6,0.12)" />
          <StatCard icon={<MdReceipt size={26} />}       label="Pending Invoices"      value={pendingCount}                                color="var(--danger)" bg="rgba(220,38,38,0.12)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, marginBottom: 32 }}>
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Poppins', sans-serif" }}>Revenue Overview</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>Last 6 months · Paid invoices</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-teal)', fontFamily: "'Poppins', sans-serif" }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 700 }}>Total collected</div>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-teal)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="var(--border-color)" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:12, fontFamily: "'Plus Jakarta Sans'" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:12, fontFamily: "'Plus Jakarta Sans'" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', color:'var(--text-primary)', fontFamily: "'Plus Jakarta Sans'" }}
                    formatter={v => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--accent-teal)" strokeWidth={3} fill="url(#revGrad)" dot={{ fill:'var(--accent-teal)', r:5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 800, marginBottom: 18, fontSize: 16, fontFamily: "'Poppins', sans-serif" }}>Quick Actions</div>
              {[
                { label: 'Book Appointment', to: '/appointments', color: 'var(--accent-teal)' },
                { label: 'Add New Patient',  to: '/patients',    color: 'var(--accent-blue)' },
                { label: 'Add Doctor',       to: '/doctors',     color: 'var(--accent-purple)' },
                { label: 'Create Invoice',   to: '/billing',     color: 'var(--warning)' },
                { label: 'AI Diagnosis',     to: '/ai',          color: 'var(--success)' },
                { label: 'Medical Records',  to: '/records',     color: 'var(--info)' },
              ].map(({ label, to, color }) => (
                <button key={to} onClick={() => navigate(to)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '12px 14px', marginBottom: 8,
                    background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = color + '10'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, boxShadow: `0 0 8px ${color}40` }} />
                    {label}
                  </span>
                  <MdArrowForward color="var(--text-muted)" size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Poppins', sans-serif" }}>Today's Appointments
              <span className="badge badge-info" style={{ marginLeft: 12, fontSize: 11 }}>{todayAppts.length}</span>
            </div>
          </div>
          {todayAppts.length === 0
            ? <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled for today</div>
            : (
              <div className="table-scroll">
                <table>
                  <thead><tr>
                    <th>Patient</th><th>Doctor</th><th>Time</th><th>Type</th><th>Reason</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {todayAppts.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 700 }}>{a.patientId?.firstName} {a.patientId?.lastName}</td>
                        <td>Dr. {a.doctorId?.lastName}<div style={{ fontSize:11, color:'var(--text-muted)', marginTop: 2 }}>{a.doctorId?.specialization}</div></td>
                        <td style={{ fontWeight: 700 }}>{a.time}</td>
                        <td><span className={`badge ${TYPE_BADGE[a.type]}`}>{a.type}</span></td>
                        <td style={{ color:'var(--text-muted)', maxWidth:160, fontSize: 13 }}>{a.reason || '—'}</td>
                        <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

      </div>
    </div>
  );
}
