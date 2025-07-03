# Suits World Design Kit - Backend API

This is the backend API for the Suits World Design Kit application, built with Node.js, Express, and MongoDB using Mongoose.

## Features

- **Express.js** server with middleware for CORS, JSON parsing
- **MongoDB** database with Mongoose ODM
- **User Management** with authentication and profiles
- **Product Management** with inventory tracking
- **RESTful API** with proper error handling
- **Data Validation** with Mongoose schemas
- **Password Hashing** with bcryptjs

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Make sure you're in the project root directory
2. Dependencies are already installed with the main project

### Environment Variables

Create or update the `.env` file in the project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/suits-world-design-kit

# Server Configuration
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas (cloud), replace the MONGODB_URI with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/suits-world-design-kit?retryWrites=true&w=majority
```

### Running the Server

```bash
# Development mode with auto-restart
npm run server:dev

# Production mode
npm run server

# Run both frontend and backend simultaneously
npm run dev:full
```

## API Endpoints

### Health Check

- **GET** `/api/health` - Check server and database status

### Users API

- **GET** `/api/users` - Get all users (with pagination)
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Soft delete user
- **POST** `/api/users/login` - User login

### Products API

- **GET** `/api/products` - Get all products (with filtering, pagination, search)
- **GET** `/api/products/:id` - Get product by ID
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Archive product
- **PATCH** `/api/products/:id/inventory` - Update product inventory
- **GET** `/api/products/search/:query` - Search products

## API Query Parameters

### Users
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Products
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (active, draft, inactive, archived)
- `category` - Filter by category
- `featured` - Filter featured products (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Text search in name, description, tags
- `sortBy` - Sort field (price, createdAt, name, etc.)
- `sortOrder` - Sort direction (asc, desc)

## Data Models

### User Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  role: String (user, admin, moderator),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  name: String (required),
  description: String (required),
  shortDescription: String,
  price: Number (required),
  comparePrice: Number,
  costPrice: Number,
  sku: String (unique),
  category: String (required),
  subcategory: String,
  tags: [String],
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  inventory: {
    quantity: Number,
    trackQuantity: Boolean,
    allowBackorder: Boolean,
    lowStockThreshold: Number
  },
  dimensions: {
    weight: Number,
    length: Number,
    width: Number,
    height: Number
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: String (draft, active, inactive, archived),
  featured: Boolean,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Example API Calls

### Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Business Suit",
    "description": "High-quality business suit made from premium materials",
    "price": 599.99,
    "category": "suits",
    "inventory": {
      "quantity": 50
    },
    "status": "active"
  }'
```

### Get Products with Filters
```bash
# Get active products in suits category, page 1
curl "http://localhost:5000/api/products?status=active&category=suits&page=1&limit=10"

# Search for products
curl "http://localhost:5000/api/products?search=business%20suit"

# Get products by price range
curl "http://localhost:5000/api/products?minPrice=100&maxPrice=1000"
```

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": ["Array of validation errors"] // For validation errors
}
```

## Security Notes

⚠️ **Important**: This is a development setup. For production:

1. Add authentication middleware (JWT tokens)
2. Add rate limiting
3. Add input sanitization
4. Add proper CORS configuration
5. Add HTTPS
6. Add proper logging
7. Add environment-specific configurations

## Database Indexes

The schemas include performance-optimized indexes for:

- **Users**: email, username, createdAt
- **Products**: text search, category, status, price, createdAt, inventory

## Virtual Fields

### User Model
- `profile.fullName` - Combines firstName and lastName

### Product Model
- `stockStatus` - Returns stock status based on inventory
- `discountPercentage` - Calculates discount from comparePrice
- `profitMargin` - Calculates profit margin from costPrice
