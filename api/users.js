const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'USA' }
    },
    preferences: {
      newsletter: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login method
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify JWT
function authenticateToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return { error: 'No token provided' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid token' };
  }
}

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

    const { method, query, body } = req;

    switch (method) {
      case 'GET': {
        if (query.action === 'me') {
          // Get current user from JWT
          const auth = authenticateToken(req);
          if (auth.error) {
            return res.status(401).json({
              success: false,
              message: auth.error
            });
          }

          const user = await User.findById(auth.user.id);
          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }

          return res.json({
            success: true,
            data: user
          });
        } else if (query.id) {
          // Get user by ID
          const user = await User.findById(query.id);
          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }

          return res.json({
            success: true,
            data: user
          });
        } else {
          // Get all users with pagination
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const skip = (page - 1) * limit;

          const users = await User.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

          const total = await User.countDocuments({ isActive: true });

          return res.json({
            success: true,
            data: users,
            pagination: {
              current: page,
              total: Math.ceil(total / limit),
              count: users.length,
              totalRecords: total
            }
          });
        }
      }

      case 'POST': {
        if (query.action === 'login') {
          // User login
          const { email, password } = body;

          if (!email || !password) {
            return res.status(400).json({
              success: false,
              message: 'Email and password are required'
            });
          }

          const user = await User.findOne({ email, isActive: true });
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          const isPasswordValid = await user.comparePassword(password);
          if (!isPasswordValid) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          await user.updateLastLogin();

          const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({
            success: true,
            message: 'Login successful',
            data: user,
            token
          });
        } else {
          // Create new user
          const { username, email, password, profile } = body;

          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [{ email }, { username }]
          });

          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
            });
          }

          const user = new User({
            username,
            email,
            password,
            profile: profile || {}
          });

          await user.save();

          return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
          });
        }
      }

      case 'PUT': {
        if (!query.id) {
          return res.status(400).json({
            success: false,
            message: 'User ID is required'
          });
        }

        const { username, email, profile, role, isActive } = body;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (profile) updateData.profile = { ...profile };
        if (role) updateData.role = role;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(
          query.id,
          updateData,
          { new: true, runValidators: true }
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        return res.json({
          success: true,
          message: 'User updated successfully',
          data: user
        });
      }

      case 'DELETE': {
        if (!query.id) {
          return res.status(400).json({
            success: false,
            message: 'User ID is required'
          });
        }

        const user = await User.findByIdAndUpdate(
          query.id,
          { isActive: false },
          { new: true }
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        return res.json({
          success: true,
          message: 'User deactivated successfully',
          data: user
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    
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
        message: 'Invalid ID format'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field error'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
