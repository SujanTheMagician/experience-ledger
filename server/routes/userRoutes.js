const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, updateUserRole } = require('../controllers/userController');

// GET   /api/users          -> list all users (admin only)
// PATCH /api/users/:id/role -> change a user's role (admin only)
router.get('/', protect, authorize('admin'), getUsers);
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
