const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Business Details
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  
  gstNumber: {
    type: String,
    required: [true, 'GST number is required'],
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, 'Please provide a valid GST number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  
  // Credit Card Fields (NEW)
  creditCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditCard'
  },
  
  creditLimit: {
    type: Number,
    default: 100000
  },
  
  isCreditApproved: {
    type: Boolean,
    default: false
  },
  
  // Account status
  accountStatus: {
    type: String,
    enum: ['active', 'blocked', 'pending', 'deleted'],
    default: 'pending'
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  lastLogin: Date,
  
  // Banker approval fields
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banker'
  },
  
  approvedAt: Date,
  
  billingCycleDay: {
    type: Number,
    default: 1
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode } = this.address;
  return `${street || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, '');
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);