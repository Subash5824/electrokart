const BillingCycle = require('../models/BillingCycle');
const CreditCard = require('../models/CreditCard');

// Get current bill
const getCurrentBill = async (req, res) => {
  try {
    const now = new Date();
    const bill = await BillingCycle.findOne({
      user: req.user.id,
      cycleMonth: now.getMonth(),
      cycleYear: now.getFullYear()
    }).populate('transactions');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'No bill found for current month' });
    }

    res.json({ success: true, bill });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get billing history
const getBillingHistory = async (req, res) => {
  try {
    const bills = await BillingCycle.find({ user: req.user.id })
      .sort({ cycleYear: -1, cycleMonth: -1 })
      .limit(12);

    res.json({ success: true, bills });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCurrentBill, getBillingHistory };