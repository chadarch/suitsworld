import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const FormalTrousers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'formal-trousers', status: 'active' });
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
    "Flat Front",
    "Pleated",
    "Slim Fit",
    "Regular Fit",
    "Dress Pants",
    "Suit Separates"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Formal Trousers"
      description="Premium dress pants and formal trousers for any occasion"
      products={products}
      categories={categories}
      breadcrumbPath="Formal Trousers"
    />
  );
};

export default FormalTrousers;
