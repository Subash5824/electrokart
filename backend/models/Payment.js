const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  creditCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditCard',
    required: true
  },
  
  paymentId: {
    type: String,
    unique: true,
    sparse: true  // Allow null/undefined
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cash'],
    required: true
  },
  
  paymentType: {
    type: String,
    enum: ['minimum', 'full', 'partial'],
    default: 'partial'
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  
  paymentDate: {
    type: Date,
    default: Date.now
  },
  
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banker'
  },
  
  receiptUrl: String
}, { timestamps: true });

// Auto-generate paymentId before saving
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const date = new Date();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.paymentId = `PAY${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);