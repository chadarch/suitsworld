const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'active'; // Default to active products
    }

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }

    if (req.query.subcategory) {
      filter.subcategory = new RegExp(req.query.subcategory, 'i');
    }

    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = { createdAt: -1 }; // Default sort
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: products.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username email profile')
      .populate('updatedBy', 'username email profile');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Public (should be protected in production)
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    
    // For demo purposes, set a default createdBy (in production, get from auth token)
    if (!productData.createdBy) {
      // Get the first user (admin) from the database as a fallback
      const User = require('../models/User');
      let firstUser = await User.findOne().limit(1);
      if (!firstUser) {
        // Create a default user if none exists
        console.log('No users found, creating default user');
        try {
          const defaultUser = new User({
            username: 'admin',
            email: 'admin@suits-world.com',
            password: 'admin123',
            role: 'admin',
            profile: {
              firstName: 'Admin',
              lastName: 'User',
              bio: 'Default admin user'
            }
          });
          firstUser = await defaultUser.save();
          console.log('Created default user:', firstUser._id);
        } catch (userError) {
          console.error('Error creating default user:', userError);
          // Use a fallback ObjectId if user creation fails
          productData.createdBy = new mongoose.Types.ObjectId();
        }
      }
      if (firstUser) {
        productData.createdBy = firstUser._id;
        console.log('Using user:', firstUser._id);
      }
    }

    const product = new Product(productData);
    await product.save();
    console.log('Product saved successfully:', product._id);

    // Try to populate the created product, but don't fail if it doesn't work
    try {
      await product.populate('createdBy', 'username email');
    } catch (populateError) {
      console.warn('Failed to populate createdBy:', populateError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Public (should be protected in production)
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body;
    
    // For demo purposes, set updatedBy (in production, get from auth token)
    if (!updateData.updatedBy) {
      updateData.updatedBy = '000000000000000000000000'; // Placeholder ID
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'username email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete by setting status to archived)
// @access  Public (should be protected in production)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product archived successfully',
      data: product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// @route   PATCH /api/products/:id/inventory
// @desc    Update product inventory
// @access  Public (should be protected in production)
router.patch('/:id/inventory', async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.updateInventory(quantity, operation);

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        id: product._id,
        name: product.name,
        inventory: product.inventory,
        stockStatus: product.stockStatus
      }
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
});

// @route   GET /api/products/search/:query
// @desc    Search products
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      $text: { $search: searchQuery },
      status: 'active'
    })
    .populate('createdBy', 'username email')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);

    const total = await Product.countDocuments({
      $text: { $search: searchQuery },
      status: 'active'
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: products.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

module.exports = router;
