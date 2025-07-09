const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Helper function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  // Get all users
  getAll: async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/users${query}`);
  },

  // Get user by ID
  getById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },

  // Create new user
  create: async (userData: any) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  update: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  delete: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // User login
  login: async (email: string, password: string) => {
    return apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Product API functions
export const productAPI = {
  // Get all products with filtering
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    subcategory?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/products${query}`);
  },

  // Get product by ID
  getById: async (id: string) => {
    return apiRequest(`/products/${id}`);
  },

  // Get products by category
  getByCategory: async (category: string, subcategory?: string) => {
    const params: any = { category, status: 'active' };
    if (subcategory) params.subcategory = subcategory;
    return productAPI.getAll(params);
  },

  // Get featured products
  getFeatured: async () => {
    return productAPI.getAll({ featured: true, status: 'active' });
  },

  // Search products
  search: async (query: string, page = 1, limit = 10) => {
    return apiRequest(`/products/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
  },

  // Create new product
  create: async (productData: any) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  update: async (id: string, productData: any) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  delete: async (id: string) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Update inventory
  updateInventory: async (id: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set') => {
    return apiRequest(`/products/${id}/inventory`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation }),
    });
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

// Categories configuration
export const categories = {
  mens: {
    title: "Men's Suits",
    subcategories: [
      { key: 'corporate-suits', name: 'Corporate Suits', path: '/mens/corporate-suits' },
      { key: 'wedding-suits', name: 'Wedding Suits', path: '/mens/wedding-suits' },
      { key: 'prom-suits', name: 'Prom Suits', path: '/mens/prom-suits' },
      { key: 'three-piece-suits', name: 'Three-Piece Suits', path: '/mens/three-piece-suits' },
      { key: 'blazers', name: 'Blazers', path: '/mens/blazers' },
      { key: 'formal-trousers', name: 'Formal Trousers', path: '/mens/formal-trousers' },
      { key: 'ties-accessories', name: 'Ties & Accessories', path: '/mens/ties-accessories' },
      { key: 'formal-shoes', name: 'Formal Shoes', path: '/mens/formal-shoes' },
    ]
  },
  womens: {
    title: "Women's Suits",
    subcategories: [
      { key: 'business-suits', name: 'Business Suits', path: '/womens/business-suits' },
      { key: 'cocktail-suits', name: 'Cocktail Suits', path: '/womens/cocktail-suits' },
      { key: 'formal-dresses', name: 'Formal Dresses', path: '/womens/formal-dresses' },
    ]
  },
  childrens: {
    title: "Children's Suits",
    subcategories: [
      { key: 'boys-suits', name: "Boys' Suits", path: '/childrens/boys-suits' },
      { key: 'girls-suits', name: "Girls' Suits", path: '/childrens/girls-suits' },
      { key: 'wedding-party', name: 'Wedding Party', path: '/childrens/wedding-party' },
    ]
  }
};

export default {
  userAPI,
  productAPI,
  healthAPI,
  categories,
};
