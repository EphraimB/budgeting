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
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        body("priority").isInt().withMessage("Priority must be a number"),
        validateRequest,
    ],
    createWishlist);
router.put('/:id',
    [
        param("id").isInt({ min: 1 }).withMessage("ID must be a number"),
        body("amount").isNumeric().withMessage("Amount must be a number"),
        body("title").isString().withMessage("Title must be a string"),
        body("description").isString().withMessage("Description must be a string"),
        body("priority").isInt().withMessage("Priority must be a number"),
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