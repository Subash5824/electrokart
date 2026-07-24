const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  cardType: {
    type: String,
    enum: ['visa', 'mastercard', 'rupee'],
    default: 'visa'
  },
  
  expiryDate: {
    type: Date,
    required: true
  },
  
  cvv: {
    type: String,
    required: true,
    select: false
  },
  
  creditLimit: {
    type: Number,
    required: true,
    default: 100000
  },
  
  availableBalance: {
    type: Number,
    required: true,
    default: 70000
  },
  
  currentOutstanding: {
    type: Number,
    default: 0
  },
  
  lastStatementBalance: {
    type: Number,
    default: 0
  },
  
  minimumPayment: {
    type: Number,
    default: 0
  },
  
  dueDate: {
    type: Date
  },
  
  interestRate: {
    type: Number,
    default: 3
  },
  
  status: {
    type: String,
    enum: ['active', 'blocked', 'expired'],
    default: 'active'
  },
  
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banker'
  },
  
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate unique card number before saving
creditCardSchema.pre('save', async function(next) {
  if (!this.cardNumber) {
    const prefix = this.cardType === 'visa' ? '4' : 
                   this.cardType === 'mastercard' ? '5' : '6';
    const random = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
    this.cardNumber = prefix + random;
    
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    this.expiryDate = expiry;
    
    this.cvv = Math.floor(Math.random() * 900 + 100).toString();
  }
  next();
});

module.exports = mongoose.model('CreditCard', creditCardSchema);