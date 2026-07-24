const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
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
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items in order' 
      });
    }

    // Process items to ensure correct format
    const processedItems = items.map(item => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice || item.price, // Handle both field names
      total: item.total || (item.quantity * (item.unitPrice || item.price))
    }));

    // Create order
    const order = new Order({
      user: req.user.id,
      items: processedItems,
      totalPieces,
      subtotal,
      discount: {
        percent: discount?.percent || 0,
        amount: discount?.amount || 0
      },
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'card',
      cardLast4: cardLast4 || '',
      paymentStatus: 'paid',
      orderStatus: 'processing'
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};