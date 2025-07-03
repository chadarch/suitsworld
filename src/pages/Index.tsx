
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Shield, Truck, RefreshCw, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productAPI } from "@/lib/api";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      title: "Men's Suits",
      description: "Premium business and formal wear",
      image: "/lovable-uploads/5d12746d-303b-4d2d-a907-6f90e1c02933.png",
      link: "/mens",
      subcategories: ["Corporate Suits", "Wedding Suits", "Blazers"]
    },
    {
      title: "Women's Suits",
      description: "Professional and elegant collections",
      image: "/lovable-uploads/2fd4c19b-518b-46cb-8715-afec72c8925d.png",
      link: "/womens",
      subcategories: ["Business Suits", "Cocktail Suits", "Formal Dresses"]
    },
    {
      title: "Children's Suits",
      description: "Special occasion formal wear",
      image: "/lovable-uploads/16c9f47a-5c33-438e-9ef7-159fd5679029.png",
      link: "/childrens",
      subcategories: ["Boys' Suits", "Girls' Suits", "Wedding Party"]
    }
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getFeatured();
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to empty array if API fails
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const testimonials = [
    {
      name: "Michael Johnson",
      rating: 5,
      comment: "Exceptional quality and perfect fit. The tailoring service exceeded my expectations."
    },
    {
      name: "Sarah Davis",
      rating: 5,
      comment: "Beautiful suits for my wedding party. Professional service and timely delivery."
    },
    {
      name: "Robert Chen",
      rating: 4,
      comment: "Great selection and competitive prices. Will definitely shop here again."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/7f8d8925-f25a-400f-b81b-e86b0c777e94.png')`,
            backgroundPosition: 'center 20%'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Discover Your Perfect Suit
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-200">
              Premium formal wear for men, women, and children. 
              Crafted with precision, designed for elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Shop Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="py-12 sm:py-16 container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore our curated collections of premium formal wear designed for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <div className="relative overflow-hidden rounded-t-lg aspect-[4/3]">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    {category.subcategories.map((sub, i) => (
                      <Badge key={i} variant="secondary" className="mr-2 mb-2 bg-white/20 text-white border-white/30 text-xs">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 text-lg sm:text-xl">{category.title}</CardTitle>
                <CardDescription className="text-gray-600 text-sm">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={category.link}>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">
                    Explore Collection
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-sm sm:text-base">Handpicked bestsellers from our premium collection</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <Carousel className="max-w-5xl mx-auto">
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product._id} className="sm:basis-1/2 lg:basis-1/3">
                    <Card className="group hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden rounded-t-lg aspect-[3/4]">
                        <img 
                          src={product.images?.[0]?.url || '/placeholder-product.jpg'} 
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-yellow-600 text-white text-xs">
                          Featured
                        </Badge>
                        {product.discountPercentage > 0 && (
                          <Badge className="absolute top-3 right-3 bg-red-600 text-white text-xs">
                            -{product.discountPercentage}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{product.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg sm:text-2xl font-bold text-slate-900">${product.price}</span>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <span className="text-gray-500 line-through ml-2 text-sm">${product.comparePrice}</span>
                            )}
                          </div>
                          <Link to={`/product/${product._id}`}>
                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 sm:py-16 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 mb-3 sm:mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Quality Guarantee</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Premium materials and expert craftsmanship</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 mb-3 sm:mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Free Shipping</h3>
            <p className="text-gray-600 text-xs sm:text-sm">On orders over $500 worldwide</p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 mb-3 sm:mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Easy Returns</h3>
            <p className="text-gray-600 text-xs sm:text-sm">30-day hassle-free return policy</p>
          </div>
          <div className="flex flex-col items-center">
            <User className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600 mb-3 sm:mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Personal Styling</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Expert advice and custom fitting</p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 text-sm sm:text-base">Trusted by thousands of satisfied customers worldwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center p-4 sm:p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-sm sm:text-base">"{testimonial.comment}"</p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base">{testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
