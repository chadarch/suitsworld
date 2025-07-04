const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection with caching for serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

// Product model - matching server/models/Product.js
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    lowStockThreshold: {
      type: Number,
      min: [0, 'Low stock threshold cannot be negative'],
      default: 10
    }
  },
  dimensions: {
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  seo: {
    title: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'unlimited';
  if (this.inventory.quantity === 0) return 'out-of-stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice && this.costPrice > 0) {
    return Math.round(((this.price - this.costPrice) / this.price) * 100);
  }
  return 0;
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length === 0) {
      // Set first image as primary if no primary is set
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        img.isPrimary = index === this.images.findIndex(i => i.isPrimary);
      });
    }
  }
  next();
});

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text'
});

// Method to update inventory
productSchema.methods.updateInventory = function(quantity, operation = 'set') {
  if (operation === 'add') {
    this.inventory.quantity += quantity;
  } else if (operation === 'subtract') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else {
    this.inventory.quantity = Math.max(0, quantity);
  }
  return this.save();
};

// Method to check if product is available
productSchema.methods.isAvailable = function(requestedQuantity = 1) {
  if (!this.inventory.trackQuantity) return true;
  if (this.status !== 'active') return false;
  if (this.inventory.quantity >= requestedQuantity) return true;
  return this.inventory.allowBackorder;
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const { method, query } = req;

    switch (method) {
      case 'GET': {
        if (query.id) {
          // Get product by ID
          try {
            const product = await Product.findById(query.id);
            
            if (!product) {
              return res.status(404).json({
                success: false,
                message: 'Product not found'
              });
            }

            return res.json({
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
            return res.status(500).json({
              success: false,
              message: 'Error fetching product',
              error: error.message
            });
          }
        } else {
          // Get all products with filtering
          try {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;

            // Build filter object
            const filter = {};
            
            if (query.status) {
              filter.status = query.status;
            } else {
              filter.status = 'active'; // Default to active products
            }

            if (query.category) {
              filter.category = new RegExp(query.category, 'i');
            }

            if (query.subcategory) {
              filter.subcategory = new RegExp(query.subcategory, 'i');
            }

            if (query.featured) {
              filter.featured = query.featured === 'true';
            }

            if (query.minPrice || query.maxPrice) {
              filter.price = {};
              if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
              if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
            }

            // Build sort object
            let sort = { createdAt: -1 }; // Default sort
            if (query.sortBy) {
              const sortField = query.sortBy;
              const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
              sort = { [sortField]: sortOrder };
            }

            // Search functionality
            if (query.search) {
              filter.$text = { $search: query.search };
            }

            const products = await Product.find(filter)
              .sort(sort)
              .skip(skip)
              .limit(limit);

            const total = await Product.countDocuments(filter);

            return res.json({
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
            return res.status(500).json({
              success: false,
              message: 'Error fetching products',
              error: error.message
            });
          }
        }
      }

      case 'POST': {
        try {
          const productData = req.body;
          
          const product = new Product(productData);
          await product.save();

          return res.status(201).json({
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
          return res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
          });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
