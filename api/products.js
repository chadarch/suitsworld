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

// Product model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  brand: { type: String },
  images: [{
    url: { type: String, required: true },
    alt: { type: String }
  }],
  tags: [String],
  colors: [String],
  sizes: [String],
  materials: [String],
  featured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'archived'], 
    default: 'active' 
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false }
  },
  stockStatus: { 
    type: String, 
    enum: ['in-stock', 'low-stock', 'out-of-stock'], 
    default: 'in-stock' 
  },
  seoTitle: { type: String },
  seoDescription: { type: String },
  metaKeywords: [String],
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
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
  switch (operation) {
    case 'add':
      this.inventory.quantity += quantity;
      break;
    case 'subtract':
      this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
      break;
    case 'set':
    default:
      this.inventory.quantity = quantity;
      break;
  }

  // Update stock status based on quantity
  if (this.inventory.quantity <= 0) {
    this.stockStatus = 'out-of-stock';
  } else if (this.inventory.quantity <= 10) {
    this.stockStatus = 'low-stock';
  } else {
    this.stockStatus = 'in-stock';
  }

  return this.save();
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
