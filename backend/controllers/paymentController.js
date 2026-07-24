const Payment = require('../models/Payment');
const CreditCard = require('../models/CreditCard');
const Transaction = require('../models/Transaction');
const BillingCycle = require('../models/BillingCycle');
const { sendNotification } = require('../utils/notificationSender');

// @desc    Make a payment
// @route   POST /api/payments/make-payment
// @access  Private
const makePayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment amount' 
      });
    }

    // Get user's credit card
    const creditCard = await CreditCard.findOne({ user: userId });
    if (!creditCard) {
      return res.status(404).json({ 
        success: false, 
        message: 'Credit card not found' 
      });
    }

    // Check if there is any outstanding to pay
    if (creditCard.currentOutstanding <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No outstanding balance to pay' 
      });
    }

    // Check if amount exceeds outstanding (allow paying exact outstanding)
    if (amount > creditCard.currentOutstanding) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount exceeds outstanding balance of ₹${creditCard.currentOutstanding.toLocaleString('en-IN')}` 
      });
    }

    // Update credit card balance
    const oldOutstanding = creditCard.currentOutstanding;
    const newOutstanding = Math.max(0, oldOutstanding - amount);
    // FIXED: Available balance = Credit Limit - New Outstanding (fully restores credit when paid)
    const newAvailable = creditCard.creditLimit - newOutstanding;

    creditCard.currentOutstanding = newOutstanding;
    creditCard.availableBalance = newAvailable;
    await creditCard.save();

    // Determine payment type
    const paymentType = newOutstanding === 0 ? 'full' : 'partial';

    // Create payment record
    const payment = new Payment({
      user: userId,
      creditCard: creditCard._id,
      amount: amount,
      paymentMethod: paymentMethod || 'upi',
      paymentType,
      status: 'completed',
      paymentDate: new Date()
    });
    await payment.save();

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      creditCard: creditCard._id,
      type: 'payment',
      amount: amount,
      description: `Credit card payment of ₹${amount.toLocaleString('en-IN')} via ${paymentMethod || 'UPI'}`,
      status: 'completed',
      remainingBalance: newAvailable,
      previousBalance: oldOutstanding,
      newBalance: newOutstanding
    });
    await transaction.save();

    // Update billing cycle if exists
    const now = new Date();
    
    // Check current month's bill
    let currentBill = await BillingCycle.findOne({
      user: userId,
      cycleMonth: now.getMonth(),
      cycleYear: now.getFullYear(),
      isClosed: false
    });

    if (currentBill) {
      currentBill.totalPayments = (currentBill.totalPayments || 0) + amount;
      // FIXED: Statement balance recalculated correctly with previous balance
      const recalculatedBalance = (currentBill.previousBalance || 0) + (currentBill.totalPurchases || 0) - currentBill.totalPayments + (currentBill.interestCharged || 0);
      currentBill.statementBalance = Math.max(0, recalculatedBalance);
      
      if (currentBill.statementBalance <= 0) {
        currentBill.paymentStatus = 'paid';
        currentBill.statementBalance = 0;
      } else if (currentBill.totalPayments >= currentBill.minimumPayment) {
        currentBill.paymentStatus = 'partial';
      }
      await currentBill.save();
    }

    // Also check previous month's bill
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    let prevBill = await BillingCycle.findOne({
      user: userId,
      cycleMonth: lastMonth.getMonth(),
      cycleYear: lastMonth.getFullYear(),
      paymentStatus: { $in: ['unpaid', 'partial'] }
    });

    if (prevBill && !currentBill) {
      prevBill.totalPayments = (prevBill.totalPayments || 0) + amount;
      const recalcBalance = prevBill.statementBalance - amount;
      prevBill.statementBalance = Math.max(0, recalcBalance);
      
      if (prevBill.statementBalance <= 0) {
        prevBill.paymentStatus = 'paid';
      } else if (prevBill.totalPayments >= prevBill.minimumPayment) {
        prevBill.paymentStatus = 'partial';
      }
      await prevBill.save();
    }

    // Send payment confirmation notification
    try {
      await sendNotification({
        user: userId,
        type: 'payment_received',
        title: 'Payment Successful',
        message: `Your payment of ₹${amount.toLocaleString('en-IN')} has been processed. New outstanding balance: ₹${newOutstanding.toLocaleString('en-IN')}. Available credit: ₹${newAvailable.toLocaleString('en-IN')}`,
        priority: 'medium',
        channel: { email: true, sms: true, inApp: true },
        relatedTo: { payment: payment._id }
      });
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError.message);
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        paymentType,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        previousOutstanding: oldOutstanding,
        newOutstanding: creditCard.currentOutstanding,
        newAvailable: creditCard.availableBalance,
        creditLimit: creditCard.creditLimit
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed',
      error: error.message 
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user.id })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Payment.countDocuments({ user: req.user.id });

    // Calculate totals
    const totalPaid = await Payment.aggregate([
      { $match: { user: req.user._id || req.user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      payments,
      total,
      page,
      pages: Math.ceil(total / limit),
      totalAmountPaid: totalPaid[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  makePayment,
  getPaymentHistory
};