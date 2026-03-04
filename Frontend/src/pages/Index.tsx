import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrendingDeals from "@/components/TrendingDeals";
import NewArrivals from "@/components/NewArrivals";
import StatsSection from "@/components/StatsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandsSection from "@/components/BrandsSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <TrendingDeals />
      <NewArrivals />
      <StatsSection />
      <WhyChooseUs />
      <BrandsSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
