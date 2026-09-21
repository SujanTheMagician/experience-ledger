const { pool } = require('../config/db');

const ALLOWED_ROLES = ['student', 'mentor', 'placement_officer', 'admin'];

// @desc   List every user (id, name, email, role)
// @route  GET /api/users
const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
};

// @desc   Change a user's role
// @route  PATCH /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    return res.status(500).json({ success: false, message: 'Server error while updating user role' });
  }
};

module.exports = { getUsers, updateUserRole };
