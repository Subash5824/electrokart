const Product = require('../models/Product');
const config = require('../config/config');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice) filter.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: parseInt(req.query.maxPrice) };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ category })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, mrp, category,
      brand, stock, moq, maxOrder, stepSize,
      images, specifications, featured
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      mrp,
      category,
      brand,
      stock,
      moq: moq || 100,
      maxOrder: maxOrder || 5000,
      stepSize: stepSize || 10,
      images: images || [],
      specifications: specifications || [],
      featured: featured || false,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};