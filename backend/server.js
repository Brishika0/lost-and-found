// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const superadminRoutes = require('./routes/superadmin');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'FYP Lost & Found Backend is Running!' });
});

// Test API Route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend + MongoDB connected!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET /api/auth/me');
  console.log('- GET /api/admin/dashboard');
  console.log('- GET /api/superadmin/dashboard');
});