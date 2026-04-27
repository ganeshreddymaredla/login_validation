// server.js
// Main entry point for the Express backend server

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/auth');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// Enable CORS so the frontend (different port) can talk to this backend
app.use(cors({
  origin: '*', // In production, replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the "frontend" folder
app.use(express.static(path.join(__dirname, 'frontend')));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Authentication routes (register & login)
app.use('/api/auth', authRoutes);

// ─────────────────────────────────────────────
// Protected Route Example: /dashboard
// Only accessible with a valid JWT token
// ─────────────────────────────────────────────
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const [users] = await db.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Welcome to your dashboard, ${req.user.name}!`,
      user: users[0]
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// Serve frontend HTML for all other routes
// ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from /frontend`);
});
