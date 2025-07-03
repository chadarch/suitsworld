import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const ThreePieceSuits = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'three-piece-suits', status: 'active' });
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
    "Classic Fit",
    "Slim Fit",
    "Regular Fit",
    "Vintage Style",
    "Modern Cut",
    "Executive"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Three-Piece Suits"
      description="Complete three-piece suits with jacket, vest, and trousers"
      products={products}
      categories={categories}
      breadcrumbPath="Three-Piece Suits"
    />
  );
};

export default ThreePieceSuits;
