import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductsQuery, Product } from "@/store/api/productApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const FeaturedProducts = () => {
  const { data: response, isLoading } = useGetProductsQuery({});
  const products = (response?.data || response || []) as Product[];

  const featured = products?.slice(0, 8) || [];

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-primary font-bold text-sm uppercase tracking-widest">Selected for you</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Featured Products
            </h2>
          </div>
          <Button variant="link" className="hidden md:inline-flex text-primary font-bold" asChild>
            <Link to="/shop">View All Products →</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
