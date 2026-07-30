const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendMessage, getHistory } = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

router.post('/', sendMessage);
router.get('/', getHistory);

module.exports = router;
