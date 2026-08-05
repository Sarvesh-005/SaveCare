// server/models/MedicalRecord.js
import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  symptoms: [{ type: String }],
  prescription: [{ medication: String, dosage: String, duration: String }],
  labResults: [{ test: String, result: String, unit: String, normalRange: String }],
  notes: { type: String },
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  }
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
