import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import constraintRoutes from './routes/constraintRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

const corsOrigins = env.FRONTEND_ORIGIN.includes(',')
  ? env.FRONTEND_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : env.FRONTEND_ORIGIN;
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/time-off', timeOffRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

export default app;
