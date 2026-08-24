const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
  listContactMessages,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/contact-messages', listContactMessages);

module.exports = router;
