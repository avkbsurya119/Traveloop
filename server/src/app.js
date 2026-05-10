import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { rateLimit } from 'express-rate-limit';
import passport from 'passport';

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
import placesRoutes from './routes/places.routes.js';
import documentRoutes from './routes/document.routes.js';
import currencyRoutes from './routes/currency.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeInput, preventParamPollution, corsOptions, helmetConfig } from './middleware/security.js';
import { setupSwagger } from './config/swagger.js';
import { initializeSocket } from './config/socket.js';
import './config/passport.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);
app.set('io', io);

// Security middleware
app.use(helmet(helmetConfig));
app.use(cors(corsOptions));

// Initialize Passport
app.use(passport.initialize());

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

// Custom security middleware
app.use(sanitizeInput);
app.use(preventParamPollution);

// Setup Swagger documentation
setupSwagger(app);

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
app.use('/api/places', placesRoutes);
app.use('/api', documentRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api', collaborationRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
});

export default app;
