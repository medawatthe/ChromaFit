const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeBody, getBodyAnalysisHistory } = require('../controllers/bodyAnalysisController');

const router = express.Router();

router.use(requireAuth);

router.post('/', upload.single('photo'), analyzeBody);
router.get('/', getBodyAnalysisHistory);

module.exports = router;
