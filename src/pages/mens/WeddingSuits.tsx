import { useEffect, useState } from "react";
import MensPageLayout from "@/components/mens/MensPageLayout";
import { productAPI } from "@/lib/api";

const WeddingSuits = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ category: 'mens', subcategory: 'wedding-suits', status: 'active' });
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
    "Tuxedos",
    "Three-Piece Suits",
    "Vintage Style",
    "Modern Cut",
    "Classic Fit",
    "Destination Wedding"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading products...</div>;
  }

  return (
    <MensPageLayout
      title="Wedding Suits"
      description="Elegant wedding suits and tuxedos for your special day"
      products={products}
      categories={categories}
      breadcrumbPath="Wedding Suits"
    />
  );
};

export default WeddingSuits;
