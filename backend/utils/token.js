const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret_for_development_only',
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
