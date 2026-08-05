// client/src/components/StatCard.jsx
export default function StatCard({ icon, label, value, change, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change ${change.startsWith('+') ? 'up' : 'down'}`}>
            {change} this month
          </div>
        )}
      </div>
    </div>
  );
}
