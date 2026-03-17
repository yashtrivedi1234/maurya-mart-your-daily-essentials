import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHero from "./pages/admin/AdminHero";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminContact from "./pages/admin/AdminContact";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminTrending from "./pages/admin/AdminTrending";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProductDetails from "./pages/ProductDetails";
import Trending from "./pages/Trending";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>

          {/* Admin Login Route */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Routes - Requires Authentication */}
          <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/trending" element={<AdminTrending />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hero" element={<AdminHero />} />
            <Route path="/admin/brands" element={<AdminBrands />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/admin/contacts" element={<AdminContact />} />
            <Route path="/admin/faqs" element={<AdminFAQ />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
