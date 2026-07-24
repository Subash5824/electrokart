const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Chargers', 'Cases', 'Cables', 'Power Banks', 'Accessories', 'Audio', 'Other']
  },
  
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Wholesale specific fields
  moq: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: 1,
    default: 100
  },
  
  maxOrder: {
    type: Number,
    required: [true, 'Maximum order quantity is required'],
    min: 1,
    default: 5000
  },
  
  stepSize: {
    type: Number,
    required: [true, 'Step size is required'],
    min: 1,
    default: 10
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: 0,
    default: 0
  },
  
  // Bulk pricing tiers
  bulkPricing: [{
    quantity: Number,
    price: Number
  }],
  
  specifications: [{
    key: String,
    value: String
  }],
  
  featured: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    date: { type: Date, default: Date.now }
  }],
  
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (!this.mrp || !this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

// Update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

// Index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);