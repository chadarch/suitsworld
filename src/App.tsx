import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MensCategory from "./pages/MensCategory";
import WomensCategory from "./pages/WomensCategory";
import ChildrensCategory from "./pages/ChildrensCategory";
import ProductDetail from "./pages/ProductDetail";
import Sale from "./pages/Sale";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";
import CorporateSuits from "./pages/mens/CorporateSuits";
import WeddingSuits from "./pages/mens/WeddingSuits";
import PromSuits from "./pages/mens/PromSuits";
import ThreePieceSuits from "./pages/mens/ThreePieceSuits";
import Accessories from "./pages/mens/Accessories";
import Blazers from "./pages/mens/Blazers";
import FormalTrousers from "./pages/mens/FormalTrousers";
import TiesAccessories from "./pages/mens/TiesAccessories";
import FormalShoes from "./pages/mens/FormalShoes";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mens" element={<MensCategory />} />
          <Route path="/mens/corporate-suits" element={<CorporateSuits />} />
          <Route path="/mens/wedding-suits" element={<WeddingSuits />} />
          <Route path="/mens/prom-suits" element={<PromSuits />} />
          <Route path="/mens/three-piece-suits" element={<ThreePieceSuits />} />
          <Route path="/mens/accessories" element={<Accessories />} />
          <Route path="/mens/blazers" element={<Blazers />} />
          <Route path="/mens/formal-trousers" element={<FormalTrousers />} />
          <Route path="/mens/ties-accessories" element={<TiesAccessories />} />
          <Route path="/mens/formal-shoes" element={<FormalShoes />} />
          <Route path="/womens" element={<WomensCategory />} />
          <Route path="/childrens" element={<ChildrensCategory />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
