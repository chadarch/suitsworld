// Test script for production API
const testProduct = {
  name: "Test Production Suit",
  description: "A test suit for production environment",
  shortDescription: "Test suit",
  price: 299.99,
  sku: "TEST-PROD-001",
  category: "mens",
  subcategory: "corporate-suits",
  tags: ["test", "production", "formal"],
  images: [{
    url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
    alt: "Test product image",
    isPrimary: true
  }],
  inventory: {
    quantity: 10,
    trackQuantity: true,
    allowBackorder: false,
    lowStockThreshold: 5
  },
  status: "active",
  featured: false
};

// Test function
async function testProductionAPI() {
  try {
    const response = await fetch('https://your-production-url.vercel.app/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    });

    const data = await response.json();
    console.log('Production API Response:', data);
    
    if (data.success) {
      console.log('✅ Product created successfully in production!');
    } else {
      console.log('❌ Failed to create product:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing production API:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  console.log('Testing production API...');
  testProductionAPI();
}

module.exports = { testProduct, testProductionAPI };
