import cors from 'cors';
import express, { Application } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import analyticsRoutes from './routes/analyticsRoutes';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import permissionRequestRoutes from './routes/permissionRequestRoutes';
import tripEditRequestAdminRoutes from './routes/tripEditRequestAdminRoutes';
import tripEditRequestRoutes from './routes/tripEditRequestRoutes';
import tripRoutes from './routes/tripRoutes';
import userRoutes from './routes/userRoutes';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authRateLimit);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips/:tripId/edit-requests', tripEditRequestRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permission-requests', permissionRequestRoutes);
app.use('/api/trip-edit-requests', tripEditRequestAdminRoutes);

app.use(errorHandler);

export default app;
