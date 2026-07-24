const mongoose = require('mongoose');

const billingCycleSchema = new mongoose.Schema({
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
  cycleMonth: Number,
  cycleYear: Number,
  statementDate: Date,
  dueDate: Date,
  previousBalance: Number,
  totalPurchases: Number,
  totalPayments: Number,
  interestCharged: Number,
  feesCharged: Number,
  statementBalance: Number,
  minimumPayment: Number,
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    default: 'unpaid'
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, { timestamps: true });

module.exports = mongoose.model('BillingCycle', billingCycleSchema);