// server/routes/billing.js
import express from 'express';
import Invoice from '../models/Invoice.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, patientId } = req.query;
    const query = {};
    if (status)    query.status = status;
    if (patientId) query.patientId = patientId;
    const invoices = await Invoice.find(query)
      .populate('patientId',     'firstName lastName phone')
      .populate('appointmentId', 'date time type')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId',     'firstName lastName phone email address')
      .populate('appointmentId', 'date time type');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.status === 'paid' && !req.body.paidAt) {
      req.body.paidAt = new Date();
    }
    const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId', 'firstName lastName');
    if (!updated) return res.status(404).json({ message: 'Invoice not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
