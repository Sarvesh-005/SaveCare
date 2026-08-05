// server/models/Doctor.js
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  specialization: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  available: { type: Boolean, default: true },
  schedule: {
    monday:    { type: Boolean, default: true },
    tuesday:   { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday:  { type: Boolean, default: true },
    friday:    { type: Boolean, default: true },
    saturday:  { type: Boolean, default: false },
    sunday:    { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
