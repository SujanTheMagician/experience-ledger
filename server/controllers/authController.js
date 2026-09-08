const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const ALLOWED_ROLES = ['student', 'mentor', 'placement_officer', 'admin'];

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// @desc   Register a new user with a hashed password
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, and password are required' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, passwordHash, role]
    );

    const user = rows[0];
    return res.status(201).json({ success: true, token: signToken(user), user: toPublicUser(user) });
  } catch (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while registering user' });
  }
};

// @desc   Authenticate with email + password, issue a JWT
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.status(200).json({ success: true, token: signToken(user), user: toPublicUser(user) });
  } catch (error) {
    console.error('Error logging in:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while logging in' });
  }
};

// @desc   Return the currently authenticated user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching current user' });
  }
};

module.exports = { register, login, getMe };
