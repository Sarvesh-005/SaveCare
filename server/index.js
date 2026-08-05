// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes (mounted after models are defined in later tasks)
import patientsRouter    from './routes/patients.js';
import doctorsRouter     from './routes/doctors.js';
import appointmentsRouter from './routes/appointments.js';
import recordsRouter     from './routes/records.js';
import billingRouter     from './routes/billing.js';

app.use('/api/patients',     patientsRouter);
app.use('/api/doctors',      doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/records',      recordsRouter);
app.use('/api/billing',      billingRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SaveCare server running on port ${PORT}`));

export default app;
