const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const BillingCycle = require('../models/BillingCycle');
const CreditCard=require('../models/CreditCard')

// @desc    Get current bill
// @route   GET /api/billing/current-bill
// @access  Private
router.get('/current-bill', protect, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const bill = await BillingCycle.findOne({
      user: req.user.id,
      cycleMonth: currentMonth,
      cycleYear: currentYear
    }).populate('transactions');

    if (!bill) {
      return res.status(200).json({ 
        success: false, 
        message: 'No bill found for current month',
        bill: null
      });
    }

    res.json({ 
      success: true, 
      bill 
    });
  } catch (error) {
    console.error('Get current bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Get billing history
// @route   GET /api/billing/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const bills = await BillingCycle.find({ user: req.user.id })
      .sort({ cycleYear: -1, cycleMonth: -1 })
      .limit(12);

    res.json({ 
      success: true, 
      bills 
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;