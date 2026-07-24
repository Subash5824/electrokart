const CreditCard = require('../models/CreditCard');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../utils/notificationSender');

// @desc    Get user's credit card details
// @route   GET /api/cards/my-card
// @access  Private
const getMyCard = async (req, res) => {
  try {
    const card = await CreditCard.findOne({ user: req.user.id })
      .populate('user', 'businessName email');
    
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Credit card not found' 
      });
    }

    // Don't send CVV
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
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Apply for credit card
// @route   POST /api/cards/apply
// @access  Private
const applyForCard = async (req, res) => {
  try {
    // Check if user already has a card
    const existingCard = await CreditCard.findOne({ user: req.user.id });
    if (existingCard) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a credit card application' 
      });
    }

    const user = await User.findById(req.user.id);
    
    // Create new credit card (pending approval)
    const card = new CreditCard({
      user: req.user.id,
      creditLimit: 70000,
      availableBalance: 70000,
      status: 'active' // Card is active but approval needed for usage
    });

    await card.save();

    // Update user with card reference
    user.creditCard = card._id;
    user.isCreditApproved = false;
    user.accountStatus = 'pending';
    await user.save();

    // Notify bankers about new application (you'd implement this)

    res.status(201).json({ 
      success: true, 
      message: 'Credit card application submitted successfully. Awaiting banker approval.',
      card: {
        id: card._id,
        status: card.status,
        creditLimit: card.creditLimit
      }
    });

  } catch (error) {
    console.error('Apply for card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Block credit card
// @route   PUT /api/cards/block
// @access  Private
const blockCard = async (req, res) => {
  try {
    const { reason } = req.body;

    const card = await CreditCard.findOne({ user: req.user.id });
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card not found' 
      });
    }

    if (card.status === 'blocked') {
      return res.status(400).json({ 
        success: false, 
        message: 'Card is already blocked' 
      });
    }

    card.status = 'blocked';
    await card.save();

    // Update user status
    await User.findByIdAndUpdate(req.user.id, { accountStatus: 'blocked' });

    // Send notification
    await sendNotification({
      user: req.user.id,
      type: 'card_blocked',
      title: 'Card Blocked',
      message: `Your credit card has been blocked. Reason: ${reason || 'User request'}`,
      priority: 'high',
      channel: { email: true, sms: true, inApp: true }
    });

    res.json({ 
      success: true, 
      message: 'Card blocked successfully' 
    });

  } catch (error) {
    console.error('Block card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Unblock credit card (requires banker approval)
// @route   PUT /api/cards/unblock
// @access  Private
const requestUnblock = async (req, res) => {
  try {
    const card = await CreditCard.findOne({ user: req.user.id });
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card not found' 
      });
    }

    // Create notification for bankers
    // This would be implemented with a banker notification system

    res.json({ 
      success: true, 
      message: 'Unblock request submitted. A banker will review your request.' 
    });

  } catch (error) {
    console.error('Request unblock error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get card statement
// @route   GET /api/cards/statement
// @access  Private
const getCardStatement = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const query = { user: req.user.id };
    if (month && year) {
      query.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });

    const card = await CreditCard.findOne({ user: req.user.id });

    const totalSpent = transactions
      .filter(t => t.type === 'purchase' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      statement: {
        period: month && year ? `${month}/${year}` : 'Current',
        openingBalance: card?.lastStatementBalance || 0,
        totalSpent,
        totalPayments,
        closingBalance: (card?.lastStatementBalance || 0) + totalSpent - totalPayments,
        transactions
      }
    });

  } catch (error) {
    console.error('Get statement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = { 
  getMyCard, 
  applyForCard, 
  blockCard,
  requestUnblock,
  getCardStatement
};