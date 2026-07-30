const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

module.exports = router;
