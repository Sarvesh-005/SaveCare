interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}
interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  onRowClick,
  emptyLabel = 'No records',
}: Props<T>) {
  if (loading) return <div className="card">Loading…</div>;
  if (rows.length === 0) return <div className="card" style={{ color: 'var(--text-muted)' }}>{emptyLabel}</div>;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
            {columns.map((c) => (
              <th key={String(c.key)} style={{ padding: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              style={{ borderTop: '1px solid var(--border)', cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((c) => (
                <td key={String(c.key)} style={{ padding: 12 }}>
                  {c.render ? c.render(row) : String((row as any)[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
