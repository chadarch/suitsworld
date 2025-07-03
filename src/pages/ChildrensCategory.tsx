
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

const ChildrensCategory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'childrens', status: 'active' });
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
        console.error("Error fetching children's products:", err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-slate-900">Home</Link> 
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Children's Suits</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Children's Formal Wear</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Special occasion outfits for your little ones. From weddings to formal events, 
            we have the perfect suits and dresses for boys and girls.
          </p>
        </div>

        {/* Category Sections */}
        <div className="space-y-16">
          {/* Boys' Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Boys' Collection</h2>
              <Button variant="outline">View All Boys' Suits</Button>
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center py-8 col-span-full">
                  <p className="text-gray-600">Loading boys' products...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.filter(p => p.subcategory === "boys-suits" || p.subcategory === "wedding-party").slice(0, 4).map((product) => (
                  <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
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
                      <Link to={`/product/${product._id}`}>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-sm">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                {products.filter(p => p.subcategory === "boys-suits").length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">No boys' products available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Girls' Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Girls' Collection</h2>
              <Button variant="outline">View All Girls' Suits</Button>
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center py-8 col-span-full">
                  <p className="text-gray-600">Loading girls' products...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.filter(p => p.subcategory === "girls-suits" || p.subcategory === "wedding-party").slice(0, 4).map((product) => (
                  <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <Link to={`/product/${product._id}`}>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-sm">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                {products.filter(p => p.subcategory === "girls-suits").length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">No girls' products available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Size Guide */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Children's Size Guide</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Boys' Sizing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Age</th>
                        <th className="text-left py-2">Height (in)</th>
                        <th className="text-left py-2">Chest (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="py-2">4</td><td>3-4 yrs</td><td>39-41</td><td>23</td></tr>
                      <tr className="border-b"><td className="py-2">6</td><td>5-6 yrs</td><td>42-45</td><td>25</td></tr>
                      <tr className="border-b"><td className="py-2">8</td><td>7-8 yrs</td><td>46-49</td><td>26</td></tr>
                      <tr className="border-b"><td className="py-2">10</td><td>9-10 yrs</td><td>50-53</td><td>28</td></tr>
                      <tr><td className="py-2">12</td><td>11-12 yrs</td><td>54-57</td><td>30</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Girls' Sizing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Age</th>
                        <th className="text-left py-2">Height (in)</th>
                        <th className="text-left py-2">Chest (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="py-2">4</td><td>3-4 yrs</td><td>39-41</td><td>22</td></tr>
                      <tr className="border-b"><td className="py-2">6</td><td>5-6 yrs</td><td>42-45</td><td>24</td></tr>
                      <tr className="border-b"><td className="py-2">8</td><td>7-8 yrs</td><td>46-49</td><td>25</td></tr>
                      <tr className="border-b"><td className="py-2">10</td><td>9-10 yrs</td><td>50-53</td><td>27</td></tr>
                      <tr><td className="py-2">12</td><td>11-12 yrs</td><td>54-57</td><td>29</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChildrensCategory;
