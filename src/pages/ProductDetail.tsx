
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, Share2, Truck, Shield, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productAPI } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await productAPI.getById(id);
        if (response.success) {
          setProduct(response.data);
          // Fetch related products from the same category
          try {
            const relatedResponse = await productAPI.getByCategory(response.data.category);
            const related = relatedResponse.data?.filter(p => p._id !== id).slice(0, 3) || [];
            setRelatedProducts(related);
          } catch (relatedError) {
            console.error('Error fetching related products:', relatedError);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Default values for missing product data
  const defaultSizes = ["36", "38", "40", "42", "44", "46", "48"];
  const defaultColors = [
    { name: "Navy", value: "#1a365d" },
    { name: "Charcoal", value: "#2d3748" },
    { name: "Black", value: "#000000" },
    { name: "Gray", value: "#718096" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
            <Link to="/mens">
              <Button className="bg-slate-900 hover:bg-slate-800">Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Static reviews for demo (in a real app, these would come from the API)
  const reviews = [
    {
      id: 1,
      name: "Michael Johnson",
      rating: 5,
      date: "2024-01-15",
      comment: "Exceptional quality and perfect fit. The tailoring is impeccable and the fabric feels premium. Highly recommended!",
      verified: true
    },
    {
      id: 2, 
      name: "David Chen",
      rating: 4,
      date: "2024-01-10",
      comment: "Great suit for the price. Fast delivery and good customer service. Will order again.",
      verified: true
    },
    {
      id: 3,
      name: "Robert Wilson",
      rating: 5,
      date: "2024-01-05",
      comment: "Perfect for business meetings. Elegant design and comfortable to wear all day.",
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-slate-900">Home</Link> 
            <span className="mx-2">/</span>
            <Link to="/mens" className="hover:text-slate-900">Men's Suits</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img 
                src={product.images?.[selectedImage]?.url || product.images?.[0]?.url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-[600px] object-cover"
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-yellow-600 text-white">
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-slate-900' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url || image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(4.5) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-gray-600">({reviews.length} reviews)</span>
                {product.sku && <span className="text-sm text-gray-500">SKU: {product.sku}</span>}
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-slate-900">${product.price}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.comparePrice}</span>
                    <Badge className="bg-green-100 text-green-800">
                      Save ${product.comparePrice - product.price}
                    </Badge>
                  </>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Size {selectedSize && <span className="text-gray-500">({selectedSize})</span>}
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {(product.sizes || defaultSizes).map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? "bg-slate-900" : ""}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Color {selectedColor && <span className="text-gray-500">({selectedColor})</span>}
                </label>
                <div className="flex gap-3">
                  {(product.colors || defaultColors).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name 
                          ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-slate-900 hover:bg-slate-800"
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart - ${product.price}
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              <Button variant="outline" size="lg" className="w-full">
                Buy Now - Express Checkout
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Free Shipping</span>
                  <span className="text-xs text-gray-500">Orders $500+</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Quality Guarantee</span>
                  <span className="text-xs text-gray-500">Premium Materials</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Easy Returns</span>
                  <span className="text-xs text-gray-500">30-Day Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="size-guide">Size Guide</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {product.description} This sophisticated piece is designed for the modern professional 
                    who demands both style and functionality. The premium construction ensures durability 
                    while maintaining an elegant silhouette that commands respect in any setting.
                  </p>
                  {product.features && product.features.length > 0 && (
                    <>
                      <h4 className="font-semibold text-slate-900 mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-gray-600">• {feature}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Fabric & Material</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Fabric:</dt>
                          <dd className="font-medium">100% Premium Wool Blend</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Weight:</dt>
                          <dd className="font-medium">290gsm</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Lining:</dt>
                          <dd className="font-medium">Polyester Blend</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Care:</dt>
                          <dd className="font-medium">Dry Clean Only</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Construction</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Fit:</dt>
                          <dd className="font-medium">Slim Fit</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Button Stance:</dt>
                          <dd className="font-medium">Two Button</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Lapel:</dt>
                          <dd className="font-medium">Notched Lapel</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Vents:</dt>
                          <dd className="font-medium">Double Side Vents</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="size-guide" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Size Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Size</th>
                          <th className="text-left py-3 px-2">Chest (in)</th>
                          <th className="text-left py-3 px-2">Waist (in)</th>
                          <th className="text-left py-3 px-2">Shoulder (in)</th>
                          <th className="text-left py-3 px-2">Length (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "36", chest: "36-37", waist: "30-31", shoulder: "17", length: "29" },
                          { size: "38", chest: "38-39", waist: "32-33", shoulder: "17.5", length: "29.5" },
                          { size: "40", chest: "40-41", waist: "34-35", shoulder: "18", length: "30" },
                          { size: "42", chest: "42-43", waist: "36-37", shoulder: "18.5", length: "30.5" },
                          { size: "44", chest: "44-45", waist: "38-39", shoulder: "19", length: "31" },
                        ].map((row) => (
                          <tr key={row.size} className="border-b">
                            <td className="py-3 px-2 font-medium">{row.size}</td>
                            <td className="py-3 px-2">{row.chest}</td>
                            <td className="py-3 px-2">{row.waist}</td>
                            <td className="py-3 px-2">{row.shoulder}</td>
                            <td className="py-3 px-2">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{review.name}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Complete the Look</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct._id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={relatedProduct.images?.[0]?.url || '/placeholder-product.jpg'} 
                      alt={relatedProduct.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900">${relatedProduct.price}</span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                    <Link to={`/product/${relatedProduct._id}`}>
                      <Button size="sm" className="w-full mt-3 bg-slate-900 hover:bg-slate-800">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
