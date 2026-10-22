const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initCronJobs } = require('./utils/cronJobs');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const publicRoutes = require('./routes/publicRoutes');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares (MANDATORY)
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express Body Parser (Extended limit to support high-res Base64 UPI QR uploads)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// NoSQL Injection Protection
app.use(mongoSanitize());

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'GymFlow SaaS REST API',
    status: 'ACTIVE 🟢',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth (register [Step 1: OTP], verify-otp [Step 2], login, demo-login)',
      dashboard: '/api/dashboard/stats',
      members: '/api/members (GET, POST, PUT renew, PUT clear-due)',
      plans: '/api/plans',
      publicPortal: '/api/public/member/:phone',
      publicDiet: '/api/public/member/:id/diet',
    },
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

// Start Automated Nightly Cron (12:00 AM)
initCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ═══════════════════════════════════════════════════════════════ 🚀
     GymFlow SaaS Shared REST API running at: http://localhost:${PORT}
     Environment: ${process.env.NODE_ENV || 'development'}
     ⚡ 1-Click Demo Login: POST /api/auth/demo-login
     📱 Public Member Portal: GET /api/public/member/:phone
     🥗 Gemini Indian Diet: POST /api/public/member/:id/diet
  🚀 ═══════════════════════════════════════════════════════════════ 🚀
  `);
});

module.exports = app;
