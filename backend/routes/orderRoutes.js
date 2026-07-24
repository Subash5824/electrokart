const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const CreditCard = require('../models/CreditCard');

// Create order - AUTO UPDATES CREDIT CARD BALANCE
router.post('/', protect, async (req, res) => {
  try {
    console.log('Received order data:', JSON.stringify(req.body, null, 2));
    
    const {
      items,
      totalPieces,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      paymentMethod,
      cardLast4
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items in order' 
      });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.price,
        total: item.total || (item.quantity * (item.unitPrice || item.price))
      })),
      totalPieces,
      subtotal,
      discount: discount || { percent: 0, amount: 0 },
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'card',
      cardLast4: cardLast4 || '',
      paymentStatus: 'paid',
      orderStatus: 'processing'
    });

    const createdOrder = await order.save();
    console.log('Order saved successfully:', createdOrder.orderNumber);

    // Find or create credit card
    let creditCard = await CreditCard.findOne({ user: req.user.id });
    
    if (!creditCard) {
      // Create default credit card if doesn't exist
      creditCard = new CreditCard({
        user: req.user.id,
        cardNumber: '**** **** **** ' + (cardLast4 || '1234'),
        cardType: 'visa',
        creditLimit: 100000,
        availableBalance: 100000,
        currentOutstanding: 0,
        status: 'active',
        expiryDate: new Date('2029-12-31'),
        cvv: '***'
      });
    }

    // Update credit card balances
    const newOutstanding = (creditCard.currentOutstanding || 0) + total;
    const newAvailable = creditCard.creditLimit - newOutstanding;
    
    creditCard.currentOutstanding = newOutstanding;
    creditCard.availableBalance = newAvailable;
    await creditCard.save();
    
    console.log('Credit card updated:', {
      previousOutstanding: newOutstanding - total,
      newOutstanding,
      previousAvailable: newAvailable + total,
      newAvailable
    });

    // Create transaction record
    // Create transaction record - WITHOUT transactionId (let model generate it)
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 15); // 15 days from now

const transaction = new Transaction({
  user: req.user.id,
  type: 'purchase',
  amount: total,
  description: `Order #${createdOrder.orderNumber}`,
  status: 'completed',
  paymentStatus: 'pending',
  orderId: createdOrder._id,
  dueDate: dueDate,
  previousBalance: newOutstanding - total,
  newBalance: newOutstanding,
  remainingCredit: newAvailable
  // Do NOT include transactionId here
});

    await transaction.save();
    console.log('Transaction created for order');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder,
      creditCard: {
        availableBalance: creditCard.availableBalance,
        currentOutstanding: creditCard.currentOutstanding
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while creating order'
    });
  }
});

// Get user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;