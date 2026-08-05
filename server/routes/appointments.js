// server/routes/appointments.js
import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, status, date } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId)  query.doctorId = doctorId;
    if (status)    query.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end   = new Date(date); end.setHours(23,59,59,999);
      query.date = { $gte: start, $lte: end };
    }
    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName phone')
      .populate('doctorId',  'firstName lastName specialization')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const appt = new Appointment(req.body);
    const saved = await appt.save();
    const populated = await Appointment.findById(saved._id)
      .populate('patientId', 'firstName lastName phone')
      .populate('doctorId',  'firstName lastName specialization');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId', 'firstName lastName phone')
      .populate('doctorId',  'firstName lastName specialization');
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
