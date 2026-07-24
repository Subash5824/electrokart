const express = require('express');
const router = express.Router();
const { createPurchase, getMyTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/purchase', protect, createPurchase);
router.get('/my-transactions', protect, getMyTransactions);

module.exports = router;