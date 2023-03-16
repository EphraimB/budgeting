const express = require('express');
const { query, param, body } = require('express-validator');
const router = express.Router();
const { getWishlists, createWishlist, updateWishlist, deleteWishlist } = require('../queries.js');
const validateRequest = require('../validateRequest.js');

router.get('/:account_id',
    [
        param('account_id').isInt({ min: 1 }).withMessage('Account ID must be a number'),
        query('id').optional().isInt({ min: 1 }).withMessage('ID must be a number'),
        validateRequest,
    ],
    getWishlists);
router.post('/',
    [
        body("name").isString().withMessage("Name must be a string"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    createWishlist);
router.put('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("name").isString().withMessage("Name must be a string"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("description").isString().withMessage("Description must be a string"),
        validateRequest,
    ],
    updateWishlist);
router.delete('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        validateRequest,
    ],
    deleteWishlist);

module.exports = router;