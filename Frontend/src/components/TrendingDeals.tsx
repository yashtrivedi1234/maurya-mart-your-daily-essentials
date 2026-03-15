import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductsQuery, Product } from "@/store/api/productApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const TrendingDeals = () => {
  const { data: products, isLoading } = useGetProductsQuery({});

  // Just using some products for trending deals mock behavior
  const deals = products?.slice(4, 8) || [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-6 w-6 text-destructive animate-bounce" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Trending Deals
          </h2>
        </div>
        <p className="text-muted-foreground mb-10">Limited-time offers — grab them before they're gone!</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {deals.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" className="rounded-full px-10 h-14 font-bold border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-lg" asChild>
            <Link to="/shop">Explore All Deals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingDeals;
