const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

console.log('✅ Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  PORT: process.env.PORT || 'default'
});

// Import routes
const userRoutes = require('../server/routes/users');
const productRoutes = require('../server/routes/products');

// MongoDB connection with caching for serverless
let cachedConnection = null;
let cachedDb = null;
let cachedBucket = null;

const connectDB = async () => {
  if (cachedConnection && cachedDb && cachedBucket) {
    return { conn: cachedConnection, db: cachedDb, bucket: cachedBucket };
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    cachedConnection = conn;
    cachedDb = db;
    cachedBucket = bucket;
    return { conn, db, bucket };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

// Create Express app
const app = express();

// Manual CORS middleware for debugging - add this at the very top
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // For debugging only!
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body ? 'with body' : 'no body');
  next();
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost for development
    if (!origin || origin.startsWith('http://localhost:5173')) {
      return callback(null, true);
    }
    // Allow all Vercel preview and production URLs for your project
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Allow your specific domain
    if (origin === 'https://suitsworld.vercel.app') {
      return callback(null, true);
    }
    // Allow your old domain if needed
    if (origin === 'https://suits-world-design-kit.vercel.app') {
      return callback(null, true);
    }
    // Allow all origins in production (not recommended for production, but helps debug)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    // Otherwise, block
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint to check products
app.get('/api/debug/products', async (req, res) => {
  try {
    const Product = require('../server/models/Product');
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const featuredProducts = await Product.countDocuments({ featured: true, status: 'active' });
    
    res.json({
      success: true,
      counts: {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts
      },
      sampleProducts: await Product.find({ status: 'active' }).limit(3).select('name status featured')
    });
  } catch (error) {
    console.error('Debug products error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fix existing products with localhost URLs
app.post('/api/fix-image-urls', async (req, res) => {
  try {
    const Product = require('../server/models/Product');
    const products = await Product.find({
      'images.url': { $regex: 'localhost:5000' }
    });
    
    console.log(`Found ${products.length} products with localhost URLs`);
    
    const baseUrl = process.env.BASE_URL || 'https://suitsworld.vercel.app';
    
    for (const product of products) {
      product.images = product.images.map(img => ({
        ...img.toObject(),
        url: img.url.replace('localhost:5000', baseUrl.replace('http://', '').replace('https://', ''))
      }));
      await product.save();
    }
    
    res.json({
      success: true,
      message: `Fixed ${products.length} products`,
      fixedProducts: products.length
    });
  } catch (error) {
    console.error('Fix image URLs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// GridFS Storage for Multer
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'uploads',
    };
  },
});
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload images to GridFS - with production optimizations
app.post('/api/upload/images', (req, res) => {
  console.log('Image upload request received');
  
  // Add timeout for serverless functions
  req.setTimeout(30000); // 30 seconds timeout
  
  const uploadMiddleware = upload.array('images', 10);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: err.message
      });
    }
    
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }
    
    console.log('Files uploaded:', req.files.length);
    
    // Get the correct base URL for production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BASE_URL || 'https://suitsworld.vercel.app'
      : 'http://localhost:5000';
    
    const uploadedFiles = req.files.map((file, idx) => ({
      url: `${baseUrl}/api/upload/images/${file.filename}`,
      alt: file.originalname,
      isPrimary: idx === 0,
    }));
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedFiles,
    });
  });
});

// Add a simple endpoint for testing upload functionality
app.post('/api/upload/test', (req, res) => {
  console.log('Upload test endpoint hit');
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Alternative upload endpoint for base64 images (production fallback)
app.post('/api/upload/base64', express.json({ limit: '10mb' }), (req, res) => {
  console.log('Base64 upload request received');
  
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided',
      });
    }
    
    // For production, we'll return the base64 images as-is
    // In a real production setup, you'd want to upload to a cloud storage service
    const processedImages = images.map((image, idx) => ({
      url: image.url || image, // Handle both object and string formats
      alt: image.alt || `Product image ${idx + 1}`,
      isPrimary: idx === 0,
      filename: image.filename || `image-${Date.now()}-${idx}`
    }));
    
    console.log('Base64 images processed:', processedImages.length);
    
    res.json({
      success: true,
      message: 'Base64 images processed successfully',
      data: processedImages,
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing base64 images',
      error: error.message
    });
  }
});

// Retrieve images from GridFS
app.get('/api/upload/images/:filename', async (req, res) => {
  try {
    console.log('Retrieving image:', req.params.filename);
    const { db, bucket } = await connectDB();
    const file = await db.collection('uploads.files').findOne({ filename: req.params.filename });
    if (!file) {
      console.log('File not found:', req.params.filename);
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Set proper headers for image serving
    res.set('Content-Type', file.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Content-Length', file.length);
    
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      res.status(500).json({ success: false, message: 'Error streaming file', error: error.message });
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ success: false, message: 'Error retrieving file', error: error.message });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// Export for Vercel
module.exports = app;