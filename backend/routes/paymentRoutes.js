const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Payment = require('../models/Payment'); // 👈 ADD THIS
const CreditCard = require('../models/CreditCard'); // 👈 ADD THIS
const Transaction = require('../models/Transaction'); // 👈 ADD THIS
const BillingCycle = require('../models/BillingCycle'); // 👈 ADD THIS

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==================== EXISTING RAZORPAY ROUTES ====================

// @desc    Get Razorpay API Key (for frontend)
// @route   GET /api/payments/get-key
// @access  Private
router.get('/get-key', protect, (req, res) => {
  res.json({ 
    success: true, 
    key: process.env.RAZORPAY_KEY_ID 
  });
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create order' 
    });
  }
});

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = new Order({
        user: req.user.id,
        ...orderDetails,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentStatus: 'paid',
        orderStatus: 'processing'
      });

      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Verification failed' 
    });
  }
});

// @desc    Make UPI payment (mock for testing)
// @route   POST /api/payments/upi
// @access  Private
router.post('/upi', protect, async (req, res) => {
  try {
    const { upiId, amount, orderId } = req.body;
    
    res.json({
      success: true,
      message: 'UPI payment successful',
      paymentId: 'UPI' + Date.now(),
      amount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Make Netbanking payment (mock for testing)
// @route   POST /api/payments/netbanking
// @access  Private
router.post('/netbanking', protect, async (req, res) => {
  try {
    const { bankCode, amount, orderId } = req.body;
    
    res.json({
      success: true,
      message: 'Netbanking payment successful',
      paymentId: 'NB' + Date.now(),
      amount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== NEW CREDIT CARD PAYMENT ROUTE ====================

// @desc    Make a credit card payment (update balance)
// @route   POST /api/payments/make-payment
// @access  Private
router.post('/make-payment', protect, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    console.log('Payment request:', { userId, amount, paymentMethod });

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

    console.log('Credit card found:', {
      currentOutstanding: creditCard.currentOutstanding,
      availableBalance: creditCard.availableBalance
    });

    // Check if amount exceeds outstanding
    if (amount > creditCard.currentOutstanding) {
      return res.status(400).json({ 
        success: false, 
        message: `Payment amount exceeds outstanding balance of ₹${creditCard.currentOutstanding}` 
      });
    }

    // Update credit card balance
    const oldOutstanding = creditCard.currentOutstanding;
    const newOutstanding = oldOutstanding - amount;
    const newAvailable = creditCard.creditLimit - newOutstanding;

    creditCard.currentOutstanding = newOutstanding;
    creditCard.availableBalance = newAvailable;
    await creditCard.save();

    console.log('Credit card updated:', { newOutstanding, newAvailable });

    // Create payment record - paymentId will be auto-generated
    const payment = new Payment({
      user: userId,
      creditCard: creditCard._id,
      amount: amount,
      paymentMethod: paymentMethod || 'card',
      paymentType: amount >= oldOutstanding ? 'full' : 'partial',
      status: 'completed',
      paymentDate: new Date()
      // Don't include paymentId - it will be auto-generated
    });
    await payment.save();

    console.log('Payment saved:', { paymentId: payment.paymentId, amount });

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      creditCard: creditCard._id,
      type: 'payment',
      amount: amount,
      description: `Payment of ₹${amount} via ${paymentMethod}`,
      status: 'completed',
      remainingBalance: newAvailable,
      previousBalance: oldOutstanding,
      newBalance: newOutstanding
    });
    await transaction.save();

    // Update billing cycle if exists
    const now = new Date();
    const currentBill = await BillingCycle.findOne({
      user: userId,
      cycleMonth: now.getMonth(),
      cycleYear: now.getFullYear()
    });

    if (currentBill) {
      currentBill.totalPayments = (currentBill.totalPayments || 0) + amount;
      currentBill.statementBalance = (currentBill.totalPurchases || 0) - currentBill.totalPayments;
      if (currentBill.statementBalance <= 0) {
        currentBill.paymentStatus = 'paid';
      } else if (currentBill.totalPayments >= currentBill.minimumPayment) {
        currentBill.paymentStatus = 'partial';
      }
      await currentBill.save();
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        paymentId: payment.paymentId,
        amount: payment.amount,
        newOutstanding: creditCard.currentOutstanding,
        newAvailable: creditCard.availableBalance
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
});

module.exports = router;