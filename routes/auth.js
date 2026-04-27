// routes/auth.js
// Authentication routes: Register and Login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ─────────────────────────────────────────────
// Helper: Server-side input validation
// ─────────────────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('at least 1 uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('at least 1 number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('at least 1 special character');
  return errors;
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// Register a new user
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // --- Input presence check ---
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // --- Name validation ---
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    // --- Email validation ---
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // --- Password validation ---
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain: ${pwErrors.join(', ')}.`
      });
    }

    // --- Confirm password match ---
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // --- Check for duplicate email (prepared statement prevents SQL injection) ---
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    // --- Hash password with bcrypt (salt rounds = 12) ---
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Insert user into database ---
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Authenticate user and return JWT token
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // --- Input presence check ---
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // --- Find user by email (prepared statement) ---
    const [users] = await db.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      // Generic message to avoid revealing whether email exists
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // --- Compare provided password with hashed password ---
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // --- Generate JWT token ---
    const tokenExpiry = rememberMe ? '7d' : process.env.JWT_EXPIRES_IN || '1h';

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email }, // Payload
      process.env.JWT_SECRET,                               // Secret key
      { expiresIn: tokenExpiry }                            // Expiry
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

module.exports = router;
