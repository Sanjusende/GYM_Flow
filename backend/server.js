const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initCronJobs, updateMemberStatuses } = require('./utils/cronJobs');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const publicRoutes = require('./routes/publicRoutes');
const dns = require('dns');

// DNS server fallback for MongoDB SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

// Load environment variables
dotenv.config();

// Connect to MongoDB and initialize background cron after connection is established
connectDB()
  .then(() => {
    initCronJobs();
  })
  .catch((err) => {
    console.error('⚠️ Database connection warning during startup:', err.message);
  });

const app = express();

// Security Middlewares (MANDATORY)
app.use(helmet());

// Production & Development CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gymflow-ochre-ten.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, uptime bots, cron-job.org)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production' ||
        !process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Express Body Parser (10mb limit for Base64 UPI QR image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection Protection
app.use(mongoSanitize());

// Ultra-lightweight Keep-alive / Health Check endpoint (Prevents "output too large" in cron-job.org / monitors)
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Ultra-lightweight Manual / External Cron Webhook trigger endpoint for cron-job.org
app.get('/api/cron/run-expiry-check', async (req, res) => {
  try {
    await updateMemberStatuses();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Error in /api/cron/run-expiry-check:', error.message);
    res.status(500).json({ ok: false });
  }
});

// Apply rate limiting to all general /api routes
app.use('/api', apiLimiter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'GymFlow SaaS REST API',
    status: 'ACTIVE 🟢',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      cronWebhook: '/api/cron/run-expiry-check',
      auth: '/api/auth (register [Step 1: OTP], verify-otp [Step 2], login, demo-login)',
      dashboard: '/api/dashboard/stats',
      members: '/api/members (GET, POST, PUT renew, PUT clear-due)',
      plans: '/api/plans',
      publicPortal: '/api/public/member/:phone',
      publicDiet: '/api/public/member/:id/diet',
    },
    istTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/public', publicRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ═══════════════════════════════════════════════════════════════ 🚀
     GymFlow SaaS Shared REST API running at: http://localhost:${PORT}
     Environment: ${process.env.NODE_ENV || 'development'}
     ⚡ Health Check: GET /api/health
     ⏰ Cron Webhook: GET /api/cron/run-expiry-check
     ⚡ 1-Click Demo Login: POST /api/auth/demo-login
     📱 Public Member Portal: GET /api/public/member/:phone
     🥗 Gemini Indian Diet: POST /api/public/member/:id/diet
  🚀 ═══════════════════════════════════════════════════════════════ 🚀
  `);
});

module.exports = app;
