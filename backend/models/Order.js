const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  orderNumber: {
    type: String,
    unique: true
    // Remove 'required: true' - let the pre-save hook generate it
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  
  totalPieces: Number,
  subtotal: Number,
  discount: {
    percent: Number,
    amount: Number
  },
  shipping: Number,
  tax: Number,
  total: Number,
  paymentMethod: String,
  cardLast4: String,
  paymentStatus: {
    type: String,
    default: 'paid'
  },
  orderStatus: {
    type: String,
    default: 'processing'
  }
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);