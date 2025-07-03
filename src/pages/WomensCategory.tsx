import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Star, Filter, Grid, List, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productAPI } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  category: string;
  subcategory: string;
  featured?: boolean;
  stockStatus: string;
  shortDescription?: string;
  rating?: number;
  reviews?: number;
  colors?: string[];
  sizes?: string[];
}

const WomensCategory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'womens', status: 'active' });
        const productsData = res.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Set price range based on actual products
        if (productsData.length > 0) {
          const prices = productsData.map((p: Product) => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (err) {
        console.error("Error fetching women's products:", err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors?.some(color => selectedColors.includes(color))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes?.some(size => selectedSizes.includes(size))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, priceRange, selectedCategory, selectedColors, selectedSizes]);

  const subcategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business-suits', label: 'Business Suits' },
    { value: 'cocktail-dresses', label: 'Cocktail Dresses' },
    { value: 'evening-wear', label: 'Evening Wear' },
    { value: 'blazers', label: 'Blazers' },
    { value: 'skirt-suits', label: 'Skirt Suits' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const colors = ['Black', 'Navy', 'Gray', 'White', 'Red', 'Blue', 'Pink', 'Green'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const toggleColorFilter = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 1000]);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-slate-900">Home</Link> 
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Women's Collection</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Women's Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our elegant collection of women's formal wear, from sophisticated business suits 
            to stunning evening dresses.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Category</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Colors</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColorFilter(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColors.includes(color) ? 'border-slate-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Sizes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(size => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSizeFilter(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={product.name}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'grid' ? 'w-full h-64' : 'w-32 h-32'
                        }`}
                      />
                      <Badge className="absolute top-3 left-3 bg-pink-600 text-white">
                        {product.featured ? 'Featured' : 'New'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
                      {product.shortDescription && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xl font-bold text-slate-900">${product.price}</span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-gray-500 line-through ml-2 text-sm">${product.comparePrice}</span>
                          )}
                        </div>
                        <Badge className={`text-xs ${
                          product.stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                          product.stockStatus === 'low-stock' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stockStatus || 'in-stock'}
                        </Badge>
                      </div>
                      {product.rating && (
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < product.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            ({product.reviews || 0} reviews)
                          </span>
                        </div>
                      )}
                      <Link to={`/product/${product._id}`}>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-sm">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WomensCategory;

