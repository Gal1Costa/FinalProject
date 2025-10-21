/* eslint-disable */
// This file controls who can access what - checks user permissions
/**
 * Creates a permission checker for specific user roles
 * - visitor: can only view public content
 * - hiker: can book hikes and leave reviews  
 * - guide: can create hikes and manage bookings
 * - admin: can do everything
 * @param {('visitor'|'hiker'|'guide'|'admin')[]} roles - list of allowed roles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return (req, res, next) => {
    // Get user's role (default to visitor if not logged in)
    const role = (req.user && req.user.role) || 'visitor';
    
    // Check if user's role is in the allowed list
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole };
