
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productAPI } from "@/lib/api";

const MensCategory = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popularity");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', status: 'active' });
        setProducts(res.data || []);
        setFilteredProducts(res.data || []);
      } catch (err) {
        console.error('Error fetching men\'s products:', err);
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.some(cat => 
          product.subcategory?.toLowerCase().includes(cat.toLowerCase().replace(/[^a-z0-9]/g, '-')) ||
          product.category?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Filter by price ranges
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const price = product.price;
        return selectedPriceRanges.some(range => {
          switch(range) {
            case "Under $300": return price < 300;
            case "$300 - $500": return price >= 300 && price <= 500;
            case "$500 - $800": return price >= 500 && price <= 800;
            case "$800 - $1200": return price >= 800 && price <= 1200;
            case "Over $1200": return price > 1200;
            default: return true;
          }
        });
      });
    }

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        selectedColors.some(color => 
          product.colors?.some(productColor => 
            productColor.toLowerCase().includes(color.toLowerCase())
          ) ||
          product.name?.toLowerCase().includes(color.toLowerCase()) ||
          product.description?.toLowerCase().includes(color.toLowerCase())
        )
      );
    }

    // Filter by sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        selectedSizes.some(size => 
          product.sizes?.some(productSize => 
            productSize.toString() === size
          ) ||
          product.variants?.some(variant => 
            variant.size?.toString() === size
          )
        )
      );
    }

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, selectedPriceRanges, selectedColors, selectedSizes, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handlePriceRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setSelectedPriceRanges(prev => [...prev, range]);
    } else {
      setSelectedPriceRanges(prev => prev.filter(r => r !== range));
    }
  };

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors(prev => [...prev, color]);
    } else {
      setSelectedColors(prev => prev.filter(c => c !== color));
    }
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes(prev => [...prev, size]);
    } else {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const categories = [
    "Corporate Suits",
    "Wedding Suits", 
    "Prom Suits",
    "Three-Piece Suits",
    "Blazers",
    "Formal Trousers"
  ];

  const priceRanges = [
    "Under $300",
    "$300 - $500",
    "$500 - $800", 
    "$800 - $1200",
    "Over $1200"
  ];

  const sizes = ["36", "38", "40", "42", "44", "46", "48", "50"];
  const colors = ["Black", "Navy", "Charcoal", "Gray", "Brown", "Blue"];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-slate-900">Home</Link> 
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Men's Suits</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-slate-900" />
                <h3 className="font-semibold text-slate-900">Filters</h3>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-900 mb-2 block">Search</Label>
                <div className="relative">
                  <Input 
                    placeholder="Search products..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-900 mb-3 block">Category</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={category} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={category} className="text-sm text-gray-600 cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-900 mb-3 block">Price Range</Label>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <Checkbox 
                        id={range}
                        checked={selectedPriceRanges.includes(range)}
                        onCheckedChange={(checked) => handlePriceRangeChange(range, !!checked)}
                      />
                      <Label htmlFor={range} className="text-sm text-gray-600 cursor-pointer">
                        {range}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-900 mb-3 block">Size</Label>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <Button 
                      key={size} 
                      variant={selectedSizes.includes(size) ? "default" : "outline"} 
                      size="sm" 
                      className={`h-8 text-xs ${
                        selectedSizes.includes(size) 
                          ? 'bg-slate-900 text-white hover:bg-slate-800' 
                          : 'hover:bg-slate-900 hover:text-white'
                      }`}
                      onClick={() => handleSizeChange(size, !selectedSizes.includes(size))}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-900 mb-3 block">Colors</Label>
                <div className="space-y-2">
                  {colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox 
                        id={color} 
                        checked={selectedColors.includes(color)}
                        onCheckedChange={(checked) => handleColorChange(color, !!checked)}
                      />
                      <Label htmlFor={color} className="text-sm text-gray-600 cursor-pointer">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-slate-900 hover:bg-slate-800"
                  onClick={() => {
                    // Filters are automatically applied through useEffect
                    // This button provides visual feedback
                    console.log('Filters applied:', {
                      categories: selectedCategories,
                      priceRanges: selectedPriceRanges,
                      colors: selectedColors,
                      sizes: selectedSizes,
                      searchTerm
                    });
                  }}
                >
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline" className="px-4">
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Men's Suits</h1>
                <p className="text-gray-600">Premium collection of formal wear for the modern gentleman</p>
                <p className="text-sm text-gray-500 mt-2">Showing {filteredProducts.length} of {products.length} products</p>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    Grid
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading men's products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found matching your criteria.</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredProducts.map((product) => (
                <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                      alt={product.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-yellow-600 text-white">
                      {product.featured ? 'Featured' : product.subcategory || 'New'}
                    </Badge>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="text-xs">
                        Quick View
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs text-gray-600">
                        {product.category}
                      </Badge>
                      {product.subcategory && (
                        <Badge variant="outline" className="text-xs text-gray-600 ml-1">
                          {product.subcategory}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.shortDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-slate-900">${product.price}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <>
                            <span className="text-gray-500 line-through ml-2">${product.comparePrice}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                              Save ${product.comparePrice - product.price}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        <span>Stock: {product.inventory?.quantity || 0} available</span>
                      </div>
                      <Badge className={`text-xs ${
                        product.stockStatus === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                        product.stockStatus === 'low-stock' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.stockStatus || 'in-stock'}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/product/${product._id}`} className="flex-1">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800">
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="px-4">
                        ♡
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="default" size="sm" className="bg-slate-900">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MensCategory;
