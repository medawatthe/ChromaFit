const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendMessage, getHistory } = require('../controllers/chatController');

const router = express.Router();

router.use(requireAuth);

router.post('/', upload.single('image'), sendMessage);
router.get('/', getHistory);

module.exports = router;
