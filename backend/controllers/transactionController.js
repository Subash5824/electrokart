const Transaction = require('../models/Transaction');
const CreditCard = require('../models/CreditCard');
const { sendNotification } = require('../utils/notificationSender');

// Create new purchase transaction
const createPurchase = async (req, res) => {
  try {
    const { amount, productDetails } = req.body;
    
    const creditCard = await CreditCard.findOne({ user: req.user.id });
    if (!creditCard) {
      return res.status(404).json({ success: false, message: 'Credit card not found' });
    }

    if (creditCard.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Card is not active' });
    }

    if (creditCard.availableBalance < amount) {
      const transaction = new Transaction({
        user: req.user.id,
        creditCard: creditCard._id,
        type: 'purchase',
        amount,
        description: `Purchase: ${productDetails.productName}`,
        productDetails,
        status: 'declined',
        remainingBalance: creditCard.availableBalance
      });
      await transaction.save();

      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient credit limit',
        availableBalance: creditCard.availableBalance
      });
    }

    const transaction = new Transaction({
      user: req.user.id,
      creditCard: creditCard._id,
      type: 'purchase',
      amount,
      description: `Purchase: ${productDetails.productName}`,
      productDetails,
      status: 'pending',
      remainingBalance: creditCard.availableBalance - amount
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction pending banker approval',
      transactionId: transaction.transactionId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's transactions
const getMyTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPurchase, getMyTransactions };