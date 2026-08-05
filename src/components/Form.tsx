import { ReactNode } from 'react';

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MoneyInput({
  label,
  cents,
  onChange,
}: {
  label: string;
  cents: number;
  onChange: (cents: number) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={(cents / 100).toFixed(2)}
        onChange={(e) => onChange(Math.round(parseFloat(e.target.value || '0') * 100))}
      />
    </div>
  );
}

export function ChipSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className="btn"
            style={{
              background: selected.includes(o) ? 'var(--teal)' : 'transparent',
              color: selected.includes(o) ? '#fff' : 'var(--text)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              fontSize: 12,
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Field({ children }: { children: ReactNode }) {
  return <div style={{ marginBottom: 8 }}>{children}</div>;
}
