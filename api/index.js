const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

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

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://suits-world-design-kit.vercel.app'],
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
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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
const upload = multer({ storage });

// Upload images to GridFS
app.post('/api/upload/images', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }
  const uploadedFiles = req.files.map((file, idx) => ({
    url: `/api/upload/images/${file.filename}`,
    alt: file.originalname,
    isPrimary: idx === 0,
  }));
  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: uploadedFiles,
  });
});

// Retrieve images from GridFS
app.get('/api/upload/images/:filename', async (req, res) => {
  try {
    const { db, bucket } = await connectDB();
    const file = await db.collection('uploads.files').findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    bucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
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