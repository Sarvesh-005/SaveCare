// client/src/utils/diagnosisEngine.js

const CONDITIONS = [
  { condition:'Influenza (Flu)', severity:'moderate', specialist:'General Medicine', tests:['Rapid Influenza Test','CBC','Chest X-ray if severe'], description:'Viral respiratory infection causing fever, body aches, and fatigue.',
    symptoms:{ fever:0.9,chills:0.8,bodyAches:0.9,fatigue:0.8,cough:0.7,soreThroat:0.6,headache:0.7,nasalCongestion:0.5,lossOfAppetite:0.5 } },
  { condition:'Common Cold', severity:'mild', specialist:'General Medicine', tests:['Clinical examination only'], description:'Viral upper respiratory tract infection, milder than flu.',
    symptoms:{ nasalCongestion:0.9,runnyNose:0.9,soreThroat:0.8,sneezing:0.9,cough:0.6,mildFever:0.5,fatigue:0.5 } },
  { condition:'COVID-19', severity:'moderate', specialist:'Infectious Disease', tests:['RT-PCR Test','Rapid Antigen Test','Chest CT scan','Pulse Oximetry'], description:'SARS-CoV-2 infection with broad spectrum of symptoms.',
    symptoms:{ fever:0.8,cough:0.8,fatigue:0.8,lossOfSmell:0.9,lossOfTaste:0.9,shortnessOfBreath:0.7,bodyAches:0.6,headache:0.6,soreThroat:0.5,chills:0.5 } },
  { condition:'Pneumonia', severity:'severe', specialist:'Pulmonology', tests:['Chest X-ray','CBC','Sputum Culture','Blood Culture','Pulse Oximetry'], description:'Infection causing inflammation in the air sacs of one or both lungs.',
    symptoms:{ cough:0.9,fever:0.8,shortnessOfBreath:0.9,chestPain:0.7,fatigue:0.8,chills:0.7,rapidBreathing:0.8,bluishLips:0.6 } },
  { condition:'Hypertension', severity:'moderate', specialist:'Cardiology', tests:['Blood Pressure Monitoring','ECG','Renal Function Tests','Lipid Profile','Urinalysis'], description:'Persistently elevated blood pressure in the arteries.',
    symptoms:{ headache:0.7,dizziness:0.7,blurredVision:0.6,nosebleeds:0.5,chestPain:0.6,shortnessOfBreath:0.5,heartPalpitations:0.5 } },
  { condition:'Myocardial Infarction (Heart Attack)', severity:'severe', specialist:'Cardiology (Emergency)', tests:['ECG','Troponin levels','Cardiac Enzymes','Echocardiogram','Coronary Angiography'], description:'Blockage of blood flow to the heart muscle — requires immediate emergency care.',
    symptoms:{ chestPain:0.95,leftArmPain:0.8,jawPain:0.7,shortnessOfBreath:0.8,sweating:0.7,nausea:0.6,dizziness:0.6,fatigue:0.7 } },
  { condition:'Type 2 Diabetes', severity:'moderate', specialist:'Endocrinology', tests:['Fasting Blood Glucose','HbA1c','Oral Glucose Tolerance Test','Insulin Level'], description:'Metabolic disorder affecting blood sugar regulation.',
    symptoms:{ frequentUrination:0.9,excessiveThirst:0.9,blurredVision:0.7,fatigue:0.8,slowHealingWounds:0.7,frequentInfections:0.6,numbnessInFeet:0.7,unexplainedWeightLoss:0.7 } },
  { condition:'Migraine', severity:'moderate', specialist:'Neurology', tests:['Clinical Diagnosis','MRI Brain if atypical','CT Scan to rule out other causes'], description:'Recurrent severe headaches often with nausea and light sensitivity.',
    symptoms:{ severeHeadache:0.95,nausea:0.8,vomiting:0.7,lightSensitivity:0.9,soundSensitivity:0.8,aura:0.7,dizziness:0.5 } },
  { condition:'Appendicitis', severity:'severe', specialist:'General Surgery (Emergency)', tests:['Abdominal Ultrasound','CT Abdomen','CBC','CRP','Urinalysis'], description:'Inflammation of the appendix requiring urgent surgical evaluation.',
    symptoms:{ rightLowerAbdominalPain:0.95,nausea:0.7,vomiting:0.6,fever:0.7,lossOfAppetite:0.8,reboundTenderness:0.9 } },
  { condition:'Urinary Tract Infection (UTI)', severity:'mild', specialist:'Urology / General Medicine', tests:['Urinalysis','Urine Culture & Sensitivity','Renal Ultrasound if recurrent'], description:'Bacterial infection of the urinary system, more common in women.',
    symptoms:{ burningUrination:0.95,frequentUrination:0.85,cloudyUrine:0.7,pelvicPain:0.6,fever:0.5,lowerBackPain:0.6,bloodInUrine:0.7 } },
  { condition:'Gastroenteritis', severity:'mild', specialist:'Gastroenterology / General Medicine', tests:['Stool Culture','CBC','Electrolytes','Renal Function'], description:'Inflammation of the stomach and intestines, usually from infection.',
    symptoms:{ nausea:0.9,vomiting:0.9,diarrhea:0.9,abdominalCramps:0.8,fever:0.6,lossOfAppetite:0.7,dehydration:0.7 } },
  { condition:'Anemia', severity:'moderate', specialist:'Hematology', tests:['CBC with Differential','Iron Studies','Serum Ferritin','Vitamin B12 / Folate','Peripheral Blood Smear'], description:'Deficiency of red blood cells or hemoglobin reducing oxygen delivery.',
    symptoms:{ fatigue:0.9,weakness:0.8,paleSkin:0.8,shortnessOfBreath:0.7,dizziness:0.7,coldHandsFeet:0.6,headache:0.5,heartPalpitations:0.6 } },
  { condition:'Depression', severity:'moderate', specialist:'Psychiatry', tests:['PHQ-9 Screening','Thyroid Function Tests','CBC','Vitamin D Level'], description:'Mood disorder causing persistent sadness and loss of interest.',
    symptoms:{ persistentSadness:0.95,lossOfInterest:0.9,fatigue:0.8,sleepDisturbance:0.8,lossOfAppetite:0.7,concentrationDifficulty:0.8,hopelessness:0.9,socialWithdrawal:0.8 } },
  { condition:'Asthma', severity:'moderate', specialist:'Pulmonology', tests:['Spirometry','Peak Flow Measurement','Allergy Testing','Chest X-ray'], description:'Chronic airway inflammation causing breathing difficulties.',
    symptoms:{ wheezing:0.9,shortnessOfBreath:0.9,chestTightness:0.85,cough:0.8,nighttimeCough:0.8,exerciseInducedBreathing:0.7 } },
  { condition:'Kidney Stones', severity:'severe', specialist:'Urology', tests:['CT KUB','Renal Ultrasound','Urinalysis','Serum Creatinine','Urine Culture'], description:'Hard mineral deposits forming in the kidneys causing severe pain.',
    symptoms:{ severeSidePain:0.9,lowerBackPain:0.8,bloodInUrine:0.8,nausea:0.7,vomiting:0.6,frequentUrination:0.7,burningUrination:0.6,fever:0.5 } },
  { condition:'Rheumatoid Arthritis', severity:'moderate', specialist:'Rheumatology', tests:['Rheumatoid Factor','Anti-CCP','ESR','CRP','X-ray Joints','MRI Joints'], description:'Autoimmune disease causing chronic joint inflammation.',
    symptoms:{ jointPain:0.9,jointSwelling:0.9,morningStiffness:0.9,fatigue:0.7,fever:0.4,weightLoss:0.5,symmetricJointInvolvement:0.8 } },
  { condition:'Hypothyroidism', severity:'moderate', specialist:'Endocrinology', tests:['TSH','Free T4','Free T3','Thyroid Antibodies','Thyroid Ultrasound'], description:'Underactive thyroid gland producing insufficient thyroid hormone.',
    symptoms:{ fatigue:0.9,weightGain:0.8,coldIntolerance:0.8,constipation:0.7,drySkin:0.7,hairLoss:0.7,slowHeartRate:0.6,depression:0.6,memoryProblems:0.6 } },
  { condition:'Irritable Bowel Syndrome (IBS)', severity:'mild', specialist:'Gastroenterology', tests:['Clinical Diagnosis','Colonoscopy to rule out IBD','Stool Tests','Food Intolerance Tests'], description:'Functional GI disorder causing chronic abdominal symptoms.',
    symptoms:{ abdominalCramps:0.9,bloating:0.9,diarrhea:0.7,constipation:0.6,alternatingBowelHabits:0.8,gasPassing:0.7,urgency:0.7 } },
  { condition:'Skin Allergy / Urticaria', severity:'mild', specialist:'Dermatology / Allergy & Immunology', tests:['Skin Prick Test','IgE Levels','CBC','Patch Test'], description:'Allergic skin reaction causing hives, itching, and redness.',
    symptoms:{ skinRash:0.9,itching:0.95,hives:0.9,redness:0.8,swelling:0.7,warmSkin:0.6 } },
  { condition:'Stroke', severity:'severe', specialist:'Neurology (Emergency)', tests:['CT Brain','MRI Brain','Carotid Ultrasound','ECG','Blood Coagulation Tests'], description:'Brain attack due to blood clot or bleed — requires immediate emergency care.',
    symptoms:{ suddenWeakness:0.9,facialDroop:0.9,slurredSpeech:0.9,visionProblems:0.8,severeHeadache:0.7,confusion:0.8,lossOfBalance:0.8 } },
];

export const SYMPTOM_OPTIONS = [
  { key:'fever',                    label:'Fever' },
  { key:'chills',                   label:'Chills' },
  { key:'bodyAches',                label:'Body Aches' },
  { key:'fatigue',                  label:'Fatigue / Tiredness' },
  { key:'cough',                    label:'Cough' },
  { key:'soreThroat',               label:'Sore Throat' },
  { key:'headache',                 label:'Headache' },
  { key:'severeHeadache',           label:'Severe Headache' },
  { key:'nasalCongestion',          label:'Nasal Congestion' },
  { key:'runnyNose',                label:'Runny Nose' },
  { key:'sneezing',                 label:'Sneezing' },
  { key:'mildFever',                label:'Mild Fever' },
  { key:'lossOfSmell',              label:'Loss of Smell' },
  { key:'lossOfTaste',              label:'Loss of Taste' },
  { key:'shortnessOfBreath',        label:'Shortness of Breath' },
  { key:'chestPain',                label:'Chest Pain' },
  { key:'leftArmPain',              label:'Left Arm Pain' },
  { key:'jawPain',                  label:'Jaw Pain' },
  { key:'sweating',                 label:'Excessive Sweating' },
  { key:'nausea',                   label:'Nausea' },
  { key:'vomiting',                 label:'Vomiting' },
  { key:'dizziness',                label:'Dizziness' },
  { key:'blurredVision',            label:'Blurred Vision' },
  { key:'nosebleeds',               label:'Nosebleeds' },
  { key:'heartPalpitations',        label:'Heart Palpitations' },
  { key:'frequentUrination',        label:'Frequent Urination' },
  { key:'excessiveThirst',          label:'Excessive Thirst' },
  { key:'slowHealingWounds',        label:'Slow Healing Wounds' },
  { key:'frequentInfections',       label:'Frequent Infections' },
  { key:'numbnessInFeet',           label:'Numbness in Feet' },
  { key:'unexplainedWeightLoss',    label:'Unexplained Weight Loss' },
  { key:'lightSensitivity',         label:'Light Sensitivity' },
  { key:'soundSensitivity',         label:'Sound Sensitivity' },
  { key:'aura',                     label:'Visual Aura' },
  { key:'rightLowerAbdominalPain',  label:'Right Lower Abdominal Pain' },
  { key:'reboundTenderness',        label:'Rebound Tenderness' },
  { key:'lossOfAppetite',           label:'Loss of Appetite' },
  { key:'burningUrination',         label:'Burning Urination' },
  { key:'cloudyUrine',              label:'Cloudy / Dark Urine' },
  { key:'pelvicPain',               label:'Pelvic Pain' },
  { key:'bloodInUrine',             label:'Blood in Urine' },
  { key:'lowerBackPain',            label:'Lower Back Pain' },
  { key:'diarrhea',                 label:'Diarrhea' },
  { key:'abdominalCramps',          label:'Abdominal Cramps' },
  { key:'dehydration',              label:'Dehydration' },
  { key:'weakness',                 label:'Muscle Weakness' },
  { key:'paleSkin',                 label:'Pale Skin' },
  { key:'coldHandsFeet',            label:'Cold Hands / Feet' },
  { key:'persistentSadness',        label:'Persistent Sadness' },
  { key:'lossOfInterest',           label:'Loss of Interest' },
  { key:'sleepDisturbance',         label:'Sleep Disturbance' },
  { key:'concentrationDifficulty',  label:'Difficulty Concentrating' },
  { key:'hopelessness',             label:'Hopelessness' },
  { key:'socialWithdrawal',         label:'Social Withdrawal' },
  { key:'wheezing',                 label:'Wheezing' },
  { key:'chestTightness',           label:'Chest Tightness' },
  { key:'nighttimeCough',           label:'Nighttime Cough' },
  { key:'exerciseInducedBreathing', label:'Exercise-Induced Breathlessness' },
  { key:'severeSidePain',           label:'Severe Side / Flank Pain' },
  { key:'jointPain',                label:'Joint Pain' },
  { key:'jointSwelling',            label:'Joint Swelling' },
  { key:'morningStiffness',         label:'Morning Stiffness (>1 hr)' },
  { key:'symmetricJointInvolvement',label:'Symmetric Joint Involvement' },
  { key:'weightGain',               label:'Unexplained Weight Gain' },
  { key:'coldIntolerance',          label:'Cold Intolerance' },
  { key:'constipation',             label:'Constipation' },
  { key:'drySkin',                  label:'Dry Skin' },
  { key:'hairLoss',                 label:'Hair Loss' },
  { key:'slowHeartRate',            label:'Slow Heart Rate' },
  { key:'depression',               label:'Low Mood / Depression' },
  { key:'memoryProblems',           label:'Memory Problems' },
  { key:'bloating',                 label:'Bloating' },
  { key:'alternatingBowelHabits',   label:'Alternating Diarrhea / Constipation' },
  { key:'gasPassing',               label:'Excessive Gas' },
  { key:'urgency',                  label:'Bladder / Bowel Urgency' },
  { key:'skinRash',                 label:'Skin Rash' },
  { key:'itching',                  label:'Itching' },
  { key:'hives',                    label:'Hives / Urticaria' },
  { key:'redness',                  label:'Skin Redness' },
  { key:'swelling',                 label:'Swelling' },
  { key:'warmSkin',                 label:'Warm / Hot Skin' },
  { key:'suddenWeakness',           label:'Sudden Weakness / Paralysis' },
  { key:'facialDroop',              label:'Facial Drooping' },
  { key:'slurredSpeech',            label:'Slurred Speech' },
  { key:'visionProblems',           label:'Sudden Vision Problems' },
  { key:'confusion',                label:'Confusion / Disorientation' },
  { key:'lossOfBalance',            label:'Loss of Balance' },
  { key:'rapidBreathing',           label:'Rapid Breathing' },
  { key:'bluishLips',               label:'Bluish Lips / Fingertips' },
  { key:'weightLoss',               label:'Weight Loss' },
];

/**
 * Run the rule-based diagnosis engine.
 * @param {string[]} selectedSymptoms
 * @param {number}   age
 * @param {string}   gender
 * @returns {{ condition, confidence, severity, tests, specialist, description }[]}
 */
export function diagnose(selectedSymptoms, age, gender) {
  if (!selectedSymptoms || selectedSymptoms.length === 0) return [];

  const symptomSet = new Set(selectedSymptoms);

  const scored = CONDITIONS.map(cond => {
    let matchScore  = 0;
    let maxPossible = 0;
    for (const [sym, weight] of Object.entries(cond.symptoms)) {
      maxPossible += weight;
      if (symptomSet.has(sym)) matchScore += weight;
    }
    const matchCount = selectedSymptoms.filter(s => cond.symptoms[s]).length;
    if (matchCount === 0) return null;

    const coverage   = matchCount / selectedSymptoms.length;
    const rawScore   = (matchScore / maxPossible) * 0.6 + coverage * 0.4;
    const confidence = Math.round(rawScore * 100);
    return { ...cond, confidence };
  }).filter(Boolean);

  return scored
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .filter(r => r.confidence > 5);
}
