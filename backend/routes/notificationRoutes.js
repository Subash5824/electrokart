const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, getAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { protectBanker, authorize } = require('../middleware/bankerAuth');

// User routes
router.get('/my-notifications', protect, getMyNotifications);
router.put('/read/:id', protect, markAsRead);

// Banker routes
router.get('/all', protectBanker, authorize('admin'), getAllNotifications);

module.exports = router;