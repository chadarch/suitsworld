import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const Blazers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'blazers', status: 'active' });
        setProducts(res.data || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "Sport Blazers",
    "Business Blazers",
    "Casual Blazers",
    "Tweed Blazers",
    "Slim Fit",
    "Regular Fit"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Blazers"
      description="Premium blazers for business and casual occasions"
      products={products}
      categories={categories}
      breadcrumbPath="Blazers"
    />
  );
};

export default Blazers;
