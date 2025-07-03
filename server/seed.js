const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        username: 'admin',
        email: 'admin@suits-world.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'Administrator of Suits World Design Kit'
        }
      },
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Business professional and loyal customer'
        }
      },
      {
        username: 'sarahjones',
        email: 'sarah@example.com',
        password: 'password123',
        profile: {
          firstName: 'Sarah',
          lastName: 'Jones',
          bio: 'Corporate executive with excellent style'
        }
      },
      {
        username: 'mikewilson',
        email: 'mike@example.com',
        password: 'password123',
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          bio: 'Wedding planner and formal wear enthusiast'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedProducts = async (users) => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const adminUser = users.find(u => u.role === 'admin');

    const products = [
      // Men's Corporate Suits
      {
        name: "Executive Navy Business Suit",
        description: "A sophisticated navy blue business suit crafted from premium wool. Perfect for board meetings, presentations, and formal business occasions. Features a modern slim fit design with attention to detail.",
        shortDescription: "Premium navy wool business suit with modern slim fit",
        price: 599,
        comparePrice: 799,
        costPrice: 299,
        sku: "SW-ENS-001",
        category: "mens",
        subcategory: "corporate-suits",
        tags: ["business", "navy", "wool", "slim-fit", "executive"],
        images: [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Executive Navy Business Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 24,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 5
        },
        dimensions: {
          weight: 2.5
        },
        seo: {
          title: "Executive Navy Business Suit | Premium Formal Wear",
          description: "Shop our Executive Navy Business Suit - premium wool, modern fit, perfect for business occasions",
          keywords: ["navy suit", "business suit", "men's formal wear", "executive suit"]
        },
        status: "active",
        featured: true,
        createdBy: adminUser._id
      },
      {
        name: "Classic Charcoal Three-Piece",
        description: "Timeless charcoal grey three-piece suit that combines classic styling with contemporary tailoring. Includes jacket, trousers, and waistcoat for a complete formal look.",
        shortDescription: "Classic charcoal three-piece suit with waistcoat",
        price: 899,
        comparePrice: 1199,
        costPrice: 449,
        sku: "SW-CCT-002",
        category: "mens",
        subcategory: "three-piece-suits",
        tags: ["charcoal", "three-piece", "classic", "formal", "wedding"],
        images: [{
          url: "/lovable-uploads/301108ce-641b-41ae-9c86-23ef3a068aac.png",
          alt: "Classic Charcoal Three-Piece Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 12,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 3
        },
        dimensions: {
          weight: 3.2
        },
        seo: {
          title: "Classic Charcoal Three-Piece Suit | Formal Menswear",
          description: "Complete charcoal three-piece suit with jacket, trousers, and waistcoat",
          keywords: ["three-piece suit", "charcoal suit", "formal wear", "wedding suit"]
        },
        status: "active",
        featured: true,
        createdBy: adminUser._id
      },
      {
        name: "Wedding Day Premium Tuxedo",
        description: "Elegant black tuxedo designed for the most special occasions. Features satin lapels, adjustable waist, and comes with matching bow tie and cummerbund.",
        shortDescription: "Premium black tuxedo with satin lapels",
        price: 1299,
        comparePrice: 1699,
        costPrice: 649,
        sku: "SW-WPT-003",
        category: "mens",
        subcategory: "wedding-suits",
        tags: ["tuxedo", "black", "wedding", "formal", "satin"],
        images: [{
          url: "/lovable-uploads/0a33b8bd-fc15-4411-ab2a-42148e84048b.png",
          alt: "Wedding Day Premium Tuxedo",
          isPrimary: true
        }],
        inventory: {
          quantity: 8,
          trackQuantity: true,
          allowBackorder: true,
          lowStockThreshold: 2
        },
        dimensions: {
          weight: 2.8
        },
        seo: {
          title: "Premium Wedding Tuxedo | Black Formal Tuxedo",
          description: "Elegant black tuxedo perfect for weddings and formal events",
          keywords: ["wedding tuxedo", "black tuxedo", "formal tuxedo", "groom suit"]
        },
        status: "active",
        featured: true,
        createdBy: adminUser._id
      },
      {
        name: "Midnight Blue Prom Suit",
        description: "Stand out at prom with this stunning midnight blue suit. Modern cut with subtle texture and contemporary styling that's perfect for young men's special night.",
        shortDescription: "Modern midnight blue prom suit",
        price: 449,
        comparePrice: 599,
        costPrice: 224,
        sku: "SW-MBP-004",
        category: "mens",
        subcategory: "prom-suits",
        tags: ["prom", "midnight-blue", "modern", "young-men", "special-occasion"],
        images: [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Midnight Blue Prom Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 15,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 5
        },
        dimensions: {
          weight: 2.3
        },
        seo: {
          title: "Midnight Blue Prom Suit | Modern Formal Wear",
          description: "Stylish midnight blue prom suit with modern cut and contemporary styling",
          keywords: ["prom suit", "midnight blue", "formal wear", "young men"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      {
        name: "Classic Navy Blazer",
        description: "Versatile navy blazer that works for business casual and smart casual occasions. Can be paired with dress pants or jeans for different looks.",
        shortDescription: "Versatile navy blazer for business casual",
        price: 349,
        comparePrice: 449,
        costPrice: 174,
        sku: "SW-CNB-005",
        category: "mens",
        subcategory: "blazers",
        tags: ["blazer", "navy", "versatile", "business-casual", "smart-casual"],
        images: [{
          url: "/lovable-uploads/301108ce-641b-41ae-9c86-23ef3a068aac.png",
          alt: "Classic Navy Blazer",
          isPrimary: true
        }],
        inventory: {
          quantity: 32,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 10
        },
        dimensions: {
          weight: 1.8
        },
        seo: {
          title: "Classic Navy Blazer | Versatile Men's Jacket",
          description: "Versatile navy blazer perfect for business casual and smart casual wear",
          keywords: ["navy blazer", "men's blazer", "business casual", "smart casual"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      {
        name: "Premium Dress Trousers - Charcoal",
        description: "High-quality dress trousers in charcoal grey. Perfect match for blazers and dress shirts. Features flat front design and precise tailoring.",
        shortDescription: "Premium charcoal dress trousers",
        price: 199,
        comparePrice: 259,
        costPrice: 99,
        sku: "SW-PDT-006",
        category: "mens",
        subcategory: "formal-trousers",
        tags: ["trousers", "charcoal", "dress-pants", "formal", "flat-front"],
        images: [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Premium Dress Trousers",
          isPrimary: true
        }],
        inventory: {
          quantity: 45,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 15
        },
        dimensions: {
          weight: 0.8
        },
        seo: {
          title: "Premium Charcoal Dress Trousers | Men's Formal Pants",
          description: "High-quality charcoal dress trousers with flat front design",
          keywords: ["dress trousers", "formal pants", "charcoal pants", "men's trousers"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      // Women's Suits
      {
        name: "Executive Business Pantsuit",
        description: "Professional women's pantsuit designed for the modern businesswoman. Features a tailored jacket and matching trousers in premium fabric.",
        shortDescription: "Professional women's pantsuit",
        price: 649,
        comparePrice: 849,
        costPrice: 324,
        sku: "SW-EBP-007",
        category: "womens",
        subcategory: "business-suits",
        tags: ["pantsuit", "business", "professional", "women", "tailored"],
        images: [{
          url: "/lovable-uploads/2fd4c19b-518b-46cb-8715-afec72c8925d.png",
          alt: "Executive Business Pantsuit",
          isPrimary: true
        }],
        inventory: {
          quantity: 8,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 3
        },
        dimensions: {
          weight: 2.1
        },
        seo: {
          title: "Executive Business Pantsuit | Women's Professional Wear",
          description: "Professional women's pantsuit perfect for business and formal occasions",
          keywords: ["women's pantsuit", "business suit", "professional wear", "tailored suit"]
        },
        status: "active",
        featured: true,
        createdBy: adminUser._id
      },
      {
        name: "Elegant Cocktail Suit",
        description: "Sophisticated cocktail suit perfect for evening events and special occasions. Features elegant styling with feminine silhouette.",
        shortDescription: "Elegant cocktail suit for evening events",
        price: 549,
        comparePrice: 749,
        costPrice: 274,
        sku: "SW-ECS-008",
        category: "womens",
        subcategory: "cocktail-suits",
        tags: ["cocktail", "evening", "elegant", "women", "special-occasion"],
        images: [{
          url: "/lovable-uploads/2fd4c19b-518b-46cb-8715-afec72c8925d.png",
          alt: "Elegant Cocktail Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 12,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 4
        },
        dimensions: {
          weight: 1.9
        },
        seo: {
          title: "Elegant Cocktail Suit | Women's Evening Wear",
          description: "Sophisticated cocktail suit perfect for evening events and special occasions",
          keywords: ["cocktail suit", "evening wear", "women's formal", "elegant suit"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      // Children's Suits
      {
        name: "Boys' First Communion Suit",
        description: "Special white suit designed for First Communion and other religious ceremonies. Includes jacket, pants, shirt, and tie.",
        shortDescription: "Boys' white First Communion suit",
        price: 199,
        comparePrice: 269,
        costPrice: 99,
        sku: "SW-BFC-009",
        category: "childrens",
        subcategory: "boys-suits",
        tags: ["communion", "white", "boys", "religious", "ceremony"],
        images: [{
          url: "/lovable-uploads/16c9f47a-5c33-438e-9ef7-159fd5679029.png",
          alt: "Boys' First Communion Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 0,
          trackQuantity: true,
          allowBackorder: true,
          lowStockThreshold: 2
        },
        dimensions: {
          weight: 1.2
        },
        seo: {
          title: "Boys' First Communion Suit | White Ceremonial Suit",
          description: "Special white suit for First Communion and religious ceremonies",
          keywords: ["communion suit", "boys' white suit", "ceremonial wear", "religious suit"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      {
        name: "Girls' Pink Party Dress Suit",
        description: "Adorable pink dress suit perfect for special occasions, parties, and formal events. Features elegant design with child-friendly comfort.",
        shortDescription: "Girls' pink party dress suit",
        price: 179,
        comparePrice: 239,
        costPrice: 89,
        sku: "SW-GPP-010",
        category: "childrens",
        subcategory: "girls-suits",
        tags: ["girls", "pink", "party", "dress-suit", "special-occasion"],
        images: [{
          url: "/lovable-uploads/16c9f47a-5c33-438e-9ef7-159fd5679029.png",
          alt: "Girls' Pink Party Dress Suit",
          isPrimary: true
        }],
        inventory: {
          quantity: 18,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 5
        },
        dimensions: {
          weight: 0.9
        },
        seo: {
          title: "Girls' Pink Party Dress Suit | Children's Formal Wear",
          description: "Adorable pink dress suit perfect for girls' special occasions and parties",
          keywords: ["girls' dress suit", "pink party dress", "children's formal wear", "girls' party outfit"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      // Accessories
      {
        name: "Premium Silk Tie Collection",
        description: "Set of 3 premium silk ties in classic patterns. Perfect complement to any business or formal suit. Includes navy, burgundy, and grey patterns.",
        shortDescription: "Set of 3 premium silk ties",
        price: 89,
        comparePrice: 129,
        costPrice: 44,
        sku: "SW-PST-011",
        category: "mens",
        subcategory: "ties-accessories",
        tags: ["ties", "silk", "accessories", "business", "formal"],
        images: [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Premium Silk Tie Collection",
          isPrimary: true
        }],
        inventory: {
          quantity: 67,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 20
        },
        dimensions: {
          weight: 0.3
        },
        seo: {
          title: "Premium Silk Tie Collection | Men's Formal Accessories",
          description: "Set of 3 premium silk ties in classic patterns for business and formal wear",
          keywords: ["silk ties", "men's ties", "formal accessories", "business ties"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      },
      {
        name: "Leather Oxford Dress Shoes",
        description: "Classic black leather Oxford dress shoes. Handcrafted with premium leather and traditional construction. Perfect for business and formal occasions.",
        shortDescription: "Classic black leather Oxford shoes",
        price: 299,
        comparePrice: 399,
        costPrice: 149,
        sku: "SW-LOD-012",
        category: "mens",
        subcategory: "formal-shoes",
        tags: ["shoes", "oxford", "leather", "black", "formal"],
        images: [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Leather Oxford Dress Shoes",
          isPrimary: true
        }],
        inventory: {
          quantity: 28,
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 8
        },
        dimensions: {
          weight: 1.8
        },
        seo: {
          title: "Leather Oxford Dress Shoes | Men's Formal Footwear",
          description: "Classic black leather Oxford dress shoes for business and formal occasions",
          keywords: ["oxford shoes", "dress shoes", "leather shoes", "formal footwear"]
        },
        status: "active",
        featured: false,
        createdBy: adminUser._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    const users = await seedUsers();
    const products = await seedProducts(users);
    
    console.log('\n=== Database Seeding Complete ===');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Products: ${products.length}`);
    console.log('\nSample Admin Login:');
    console.log('Email: admin@suits-world.com');
    console.log('Password: admin123');
    console.log('\nSample User Login:');
    console.log('Email: john@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
