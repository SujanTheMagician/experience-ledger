const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register -> create account with hashed password
// POST /api/auth/login    -> authenticate, returns a JWT
// GET  /api/auth/me       -> current authenticated user (requires Bearer token)
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
