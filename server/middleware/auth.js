const jwt = require('jsonwebtoken');

// Verifies the Bearer token on protected routes and attaches { id, role } to req.user
const protect = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
};

// Restricts a route to the given roles, read from the JWT payload set by `protect`.
// Must run after `protect` so req.user is already populated.
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }
  return next();
};

module.exports = { protect, authorize };
