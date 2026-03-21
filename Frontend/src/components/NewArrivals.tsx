import { Sparkles } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductsQuery, Product } from "@/store/api/productApi";
import { Skeleton } from "@/components/ui/skeleton";

const NewArrivals = () => {
  const { data: response, isLoading } = useGetProductsQuery({});
  const products = (response?.data || response || []) as Product[];

  // Sorting by date to get the newest arrivals
  const newProducts = products ? [...products].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4) : [];

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            New Arrivals
          </h2>
        </div>
        <p className="text-muted-foreground mb-10">Fresh additions to our collection this week</p>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
            {newProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
