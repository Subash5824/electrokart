const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bankerSchema = new mongoose.Schema({
  bankerId: {
    type: String,
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true
  },
  
  password: {
    type: String,
    required: true,
    select: false
  },
  
  role: {
    type: String,
    enum: ['admin', 'officer', 'manager'],
    required: true
  },
  
  department: {
    type: String,
    enum: ['credit', 'approval', 'collections', 'support'],
    default: 'approval'
  },
  
  permissions: [{
    type: String,
    enum: [
      'view_customers',
      'approve_transactions',
      'block_cards',
      'generate_reports',
      'send_notifications',
      'manage_bankers'
    ]
  }],
  
  assignedCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banker'
  }
}, { timestamps: true });

// Encrypt password
bankerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
bankerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Banker', bankerSchema);