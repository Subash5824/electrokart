const express = require('express');
const router = express.Router();
const {
  registerBanker,
  loginBanker,
  getPendingTransactions,
  approveTransaction,
  declineTransaction,
  getCustomers,
  getCustomerDetails,
  approveCreditCard,
  blockCustomerCard,
  getBankerStats
} = require('../controllers/bankerController');
const { protectBanker, authorize, hasPermission } = require('../middleware/bankerAuth');

// Public routes
router.post('/login', loginBanker);

// Protected routes - all require banker authentication
router.use(protectBanker);

// Admin only routes
router.post('/register', authorize('admin'), registerBanker);

// Routes for admin and manager
router.get('/stats', authorize('admin', 'manager'), getBankerStats);
router.get('/customers', authorize('admin', 'manager', 'officer'), getCustomers);
router.get('/customer/:id', authorize('admin', 'manager'), getCustomerDetails);
router.get('/pending-transactions', authorize('admin', 'manager', 'officer'), getPendingTransactions);

// Transaction approval routes (require specific permissions)
router.post('/approve-transaction', 
  authorize('admin', 'manager'), 
  hasPermission('approve_transactions'),
  approveTransaction
);

router.post('/decline-transaction', 
  authorize('admin', 'manager'), 
  hasPermission('approve_transactions'),
  declineTransaction
);

// Card management routes
router.put('/approve-card/:userId', 
  authorize('admin'), 
  hasPermission('block_cards'),
  approveCreditCard
);

router.put('/block-card/:userId', 
  authorize('admin', 'manager'), 
  hasPermission('block_cards'),
  blockCustomerCard
);

module.exports = router;