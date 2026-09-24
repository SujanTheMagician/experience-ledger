const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register -> create account with hashed password
// POST /api/auth/login    -> authenticate, returns a JWT
// POST /api/auth/google   -> authenticate with a Google ID token, returns our own JWT
// GET  /api/auth/me       -> current authenticated user (requires Bearer token)
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
