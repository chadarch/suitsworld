import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const TiesAccessories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'ties-accessories', status: 'active' });
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
    "Silk Ties",
    "Bow Ties",
    "Patterned Ties",
    "Solid Colors",
    "Tie Clips",
    "Tie Sets"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Ties & Accessories"
      description="Premium neckties, bow ties, and accessories for the finishing touch"
      products={products}
      categories={categories}
      breadcrumbPath="Ties & Accessories"
    />
  );
};

export default TiesAccessories;
