import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const FormalShoes = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'formal-shoes', status: 'active' });
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
    "Oxfords",
    "Brogues", 
    "Loafers",
    "Derby Shoes",
    "Monk Straps",
    "Dress Boots"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Formal Shoes"
      description="Premium leather shoes to complete your formal attire"
      products={products}
      categories={categories}
      breadcrumbPath="Formal Shoes"
    />
  );
};

export default FormalShoes;
