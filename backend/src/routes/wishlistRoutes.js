const express = require('express');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createWishlistItem, listWishlistItems, deleteWishlistItem } = require('../controllers/wishlistController');

const router = express.Router();

router.use(requireAuth);

router.post('/', upload.single('image'), createWishlistItem);
router.get('/', listWishlistItems);
router.delete('/:id', deleteWishlistItem);

module.exports = router;
