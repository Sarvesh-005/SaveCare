export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, margin: '4px 0' }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>}
    </div>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: '100%',
                height: `${(d.value / max) * 140}px`,
                background: 'var(--teal)',
                borderRadius: '6px 6px 0 0',
                minHeight: 2,
              }}
              title={`${d.value}`}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const radius = 60,
    circumference = 2 * Math.PI * radius;
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <g transform="translate(80,80) rotate(-90)">
          {segments.map((s) => {
            const len = (s.value / total) * circumference;
            const el = (
              <circle
                key={s.label}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="24"
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 12, height: 12, background: s.color, borderRadius: 2 }} />
            <span>
              {s.label} ({s.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
