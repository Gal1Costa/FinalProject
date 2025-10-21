/* eslint-disable */
// This file handles user authentication - checks if user is logged in
const { verifyIdToken } = require('../adapters/firebase.auth');

/**
 * Checks if user has valid login token
 * - Reads the "Authorization: Bearer <token>" header
 * - If token is valid, sets req.user with user info
 * - If no token or invalid, sets user as 'visitor'
 */
async function authMiddleware(req, res, next) {
  try {
    // Get the token from request header
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    
    if (token) {
      // Check if token is valid (stub for now)
      const data = await verifyIdToken(token);
      if (data) {
        // User is logged in - save their info
        req.user = { id: data.uid, email: data.email || null, role: 'visitor' };
        return next();
      }
    }
    // No token or invalid token - treat as visitor
    req.user = { role: 'visitor' };
    next();
  } catch (_e) {
    // Error checking token - treat as visitor
    req.user = { role: 'visitor' };
    next();
  }
}

module.exports = { authMiddleware };
