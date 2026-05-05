console.log('Starting server');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Loaded dependencies');
const authRoutes = require('./src/routes/auth');
const medicationRoutes = require('./src/routes/medications');
const reminderRoutes = require('./src/routes/reminders');

console.log('Loaded routes');
const { runReminderLoop } = require('./src/workers/reminderWorker');
const app = express();
const PORT = process.env.PORT || 3004;
const HOST = process.env.HOST || '0.0.0.0';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

// Middleware
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running with database!' });
});

console.log('Before listen');
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT} with database integration`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  runReminderLoop();
});

module.exports = app;