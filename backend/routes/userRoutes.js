const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserStatus
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.patch('/:id/status', protect, adminOnly, updateUserStatus);

module.exports = router;

