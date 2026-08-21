const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeColor, getColorAnalysisHistory } = require('../controllers/colorAnalysisController');

const router = express.Router();

router.use(requireAuth);

router.post('/', upload.single('photo'), analyzeColor);
router.get('/', getColorAnalysisHistory);

module.exports = router;
