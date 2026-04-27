// middleware/auth.js
// JWT Authentication Middleware - protects routes from unauthorized access

const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  // Verify the token using our secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }

    // Attach decoded user data to request object for use in route handlers
    req.user = user;
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = authenticateToken;
