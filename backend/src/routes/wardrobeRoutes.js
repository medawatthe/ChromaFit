const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createOutfit,
  listOutfits,
  getOutfit,
  updateOutfit,
  deleteOutfit,
  logWear,
  getDashboardStats,
} = require('../controllers/wardrobeController');
const { analyzeOutfit } = require('../controllers/analysisController');

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', getDashboardStats);
router.post('/', upload.single('image'), createOutfit);
router.get('/', listOutfits);
router.get('/:id', getOutfit);
router.put('/:id', upload.single('image'), updateOutfit);
router.delete('/:id', deleteOutfit);
router.post('/:id/wear', logWear);
router.post('/:id/analyze', analyzeOutfit);

module.exports = router;
