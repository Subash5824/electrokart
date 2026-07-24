const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CreditCard = require('../models/CreditCard');
const User = require('../models/User');

// @desc    Get user's credit card details
// @route   GET /api/cards/my-card
// @access  Private
router.get('/my-card', protect, async (req, res) => {
  try {
    const card = await CreditCard.findOne({ user: req.user.id });
    
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Credit card not found' 
      });
    }

    const cardData = card.toObject();
    delete cardData.cvv;

    res.json({ 
      success: true, 
      card: cardData 
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;