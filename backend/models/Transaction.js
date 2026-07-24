const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['purchase', 'payment', 'interest', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  dueDate: Date,
  previousBalance: Number,
  newBalance: Number,
  remainingCredit: Number
}, { timestamps: true });

// Auto-generate transactionId before saving
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `TXN${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);