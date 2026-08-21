const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { compareOutfits } = require('../controllers/comparisonController');

const router = express.Router();

router.use(requireAuth);

router.post('/', compareOutfits);

module.exports = router;
