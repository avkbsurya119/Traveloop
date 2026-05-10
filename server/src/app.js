import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tripRoutes from './routes/trip.routes.js';
import cityRoutes from './routes/city.routes.js';
import activityRoutes from './routes/activity.routes.js';
import searchRoutes from './routes/search.routes.js';
import communityRoutes from './routes/community.routes.js';
import adminRoutes from './routes/admin.routes.js';
import checklistTemplateRoutes from './routes/checklist-template.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checklist', checklistTemplateRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
