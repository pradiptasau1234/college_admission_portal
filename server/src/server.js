const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded documents statically if stored locally
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Cached database connection for both local server and serverless functions
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI && (process.env.NETLIFY || process.env.VERCEL)) {
    throw new Error('MONGODB_URI is not configured in Netlify Environment Variables.');
  }

  const uri = MONGODB_URI || 'mongodb://127.0.0.1:27017/college_admission_db';
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });
  isConnected = true;
  console.log(' Connected to MongoDB database.');
};

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  // Allow health check endpoint to always respond immediately
  if (req.path.includes('/health')) {
    try { await connectDB(); } catch (e) {}
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    const detail = process.env.MONGODB_URI
      ? 'Unable to connect to MongoDB Atlas. Ensure Network Access has 0.0.0.0/0 allowed and password is correct.'
      : 'MONGODB_URI is missing in Netlify Environment Variables. Please add your MongoDB Atlas connection string.';
    return res.status(503).json({
      success: false,
      message: `Database Error: ${detail}`
    });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');

const apiRouter = express.Router();

// Health check endpoint (Public)
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'College Admission Portal Backend API',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    hasMongoUri: Boolean(process.env.MONGODB_URI)
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', courseRoutes);
apiRouter.use('/', applicationRoutes);

// Bind to standard /api AND Netlify Functions /.netlify/functions/api
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start local server when not in serverless environment (Vercel, Netlify, AWS Lambda)
if (!process.env.VERCEL && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` College Admission Portal Backend API Server`);
    console.log(` Listening on: http://localhost:${PORT}`);
    console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
