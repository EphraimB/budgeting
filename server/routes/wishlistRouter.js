const express = require('express');
const router = express.Router();
const { getWishlists, getWishlist, createWishlist, updateWishlist, deleteWishlist } = require('../queries.js');

router.get('/', getWishlists);
router.get('/:id', getWishlist);
router.post('/', createWishlist);
router.put('/:id', updateWishlist);
router.delete('/:id', deleteWishlist);

module.exports = router;