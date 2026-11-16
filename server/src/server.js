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

// Cached database connection for both local server and Vercel serverless functions
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_admission_db';
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log(' Successfully connected to MongoDB database.');
  } catch (err) {
    console.warn(' MongoDB connection warning:', err.message);
  }
};

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', courseRoutes);
apiRouter.use('/', applicationRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'College Admission Portal Backend API',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

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
