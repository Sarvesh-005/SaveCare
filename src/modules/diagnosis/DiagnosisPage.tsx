import { useState } from 'react';
import { diagnosisApi } from '../../api/diagnosis';
import { ChipSelect } from '../../components/Form';
import { useToast } from '../../context/ToastContext';
import type { MatchResult } from '../../types';

const SYMPTOMS = [
  'fever',
  'cough',
  'body_ache',
  'fatigue',
  'sore_throat',
  'headache',
  'runny_nose',
  'sneezing',
  'nausea',
  'vomiting',
  'diarrhea',
  'shortness_of_breath',
  'dizziness',
  'chest_pain',
  'blurred_vision',
  'wheezing',
];

const URGENCY_COLOR: Record<string, string> = { routine: 'var(--teal)', soon: '#e0a500', urgent: 'var(--coral)' };

export function DiagnosisPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const toggle = (s: string) =>
    setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const analyze = async () => {
    if (selected.length === 0) {
      toast('Select at least one symptom', 'error');
      return;
    }
    setBusy(true);
    try {
      const r = await diagnosisApi.analyze(selected);
      setResults(r.conditions);
      setDisclaimer(r.disclaimer);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>AI Diagnosis Assistant</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <ChipSelect label="Select symptoms" options={SYMPTOMS} selected={selected} onToggle={toggle} />
        <button className="btn" disabled={busy} style={{ marginTop: 12 }} onClick={analyze}>
          {busy ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
      {disclaimer && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--coral)', fontStyle: 'italic' }}>
          {disclaimer}
        </div>
      )}
      {results && (
        <div style={{ display: 'grid', gap: 12 }}>
          {results.length === 0 && <div className="card">No matching conditions found.</div>}
          {results.map((c) => (
            <div key={c.name} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{c.name}</h3>
                <span
                  className="mono"
                  style={{
                    background: URGENCY_COLOR[c.urgency],
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  {c.urgency}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${c.matchScore * 100}%`, height: '100%', background: 'var(--teal)' }} />
                </div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Match score: {Math.round(c.matchScore * 100)}%
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Matched:</strong>{' '}
                {c.matchedSymptoms.map((s) => (
                  <span
                    key={s}
                    className="mono"
                    style={{
                      background: 'rgba(14,124,123,0.1)',
                      padding: '2px 8px',
                      borderRadius: 8,
                      marginRight: 4,
                      fontSize: 12,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p style={{ marginTop: 8, marginBottom: 0, color: 'var(--text-muted)' }}>{c.advice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
