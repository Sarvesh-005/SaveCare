import type { Condition, MatchResult, DiagnosisResponse } from '../../src/types/index.js';

export const CONDITIONS: Condition[] = [
  { name: 'Influenza (Flu)', symptoms: ['fever', 'cough', 'body_ache', 'fatigue', 'sore_throat', 'headache'], advice: 'Rest, fluids, monitor fever. Seek care if breathing difficulty or fever persists beyond 3 days.', urgency: 'routine' },
  { name: 'Common Cold', symptoms: ['runny_nose', 'sore_throat', 'cough', 'sneezing', 'mild_fever'], advice: 'Symptomatic care, hydration, rest. Usually self-limiting within a week.', urgency: 'routine' },
  { name: 'Migraine', symptoms: ['headache', 'nausea', 'light_sensitivity', 'sound_sensitivity'], advice: 'Rest in a dark quiet room. OTC analgesics. Seek care if sudden severe headache or neuro deficits.', urgency: 'soon' },
  { name: 'Gastroenteritis', symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'], advice: 'Hydration with oral rehydration solution. Seek care if signs of dehydration or blood in stool.', urgency: 'soon' },
  { name: 'Strep Throat', symptoms: ['sore_throat', 'fever', 'swollen_glands', 'headache'], advice: 'See a clinician for a throat swab; may require antibiotics.', urgency: 'soon' },
  { name: 'Hypertension (elevated)', symptoms: ['headache', 'dizziness', 'blurred_vision', 'chest_pain'], advice: 'Check blood pressure. Seek urgent care for chest pain or severe symptoms.', urgency: 'urgent' },
  { name: 'Allergic Rhinitis', symptoms: ['sneezing', 'runny_nose', 'itchy_eyes', 'congestion'], advice: 'Avoid allergens; OTC antihistamines may help.', urgency: 'routine' },
  { name: 'Asthma flare', symptoms: ['shortness_of_breath', 'wheezing', 'cough', 'chest_tightness'], advice: 'Use rescue inhaler. Seek urgent care if not improving or severe breathlessness.', urgency: 'urgent' },
  { name: 'COVID-19 (suspected)', symptoms: ['fever', 'cough', 'shortness_of_breath', 'fatigue', 'loss_of_smell'], advice: 'Test and isolate. Seek urgent care for breathing difficulty or persistent chest pain.', urgency: 'soon' },
  { name: 'Dehydration', symptoms: ['dizziness', 'fatigue', 'dry_mouth', 'dark_urine'], advice: 'Increase fluid intake. Seek care if unable to keep fluids down.', urgency: 'routine' },
];

const DISCLAIMER = 'This is a rule-based screening tool, not a medical diagnosis. Consult a licensed clinician.';
const THRESHOLD = 0.0001; // any overlap
const MAX_RESULTS = 5;

export function matchSymptoms(input: string[]): DiagnosisResponse {
  const inputSet = new Set(input.map((s) => s.trim().toLowerCase()).filter(Boolean));
  const results: MatchResult[] = CONDITIONS.map((cond) => {
    const condSet = new Set(cond.symptoms);
    const intersection = [...inputSet].filter((s) => condSet.has(s));
    const union = new Set([...inputSet, ...condSet]);
    const score = union.size === 0 ? 0 : intersection.length / union.size;
    return {
      name: cond.name,
      matchScore: Math.round(score * 100) / 100,
      urgency: cond.urgency,
      matchedSymptoms: intersection,
      advice: cond.advice,
    };
  })
    .filter((r) => r.matchScore > THRESHOLD && r.matchedSymptoms.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore || b.matchedSymptoms.length - a.matchedSymptoms.length)
    .slice(0, MAX_RESULTS);

  return { conditions: results, disclaimer: DISCLAIMER };
}
