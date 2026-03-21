import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useMemo } from "react";

const CategoriesSection = () => {
  const { data: response } = useGetProductsQuery({});
  const products = (response?.data || response || []) as any[];

  // Extract unique categories from products dynamically
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const uniqueCategories = Array.from(new Set(products.map((p: any) => p.category)));
    return uniqueCategories; // Show max 6 categories
  }, [products]);
  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Browse our wide range of categories to find exactly what you need
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories && categories.length > 0 ? (
            categories.map((name) => (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(name)}`}
                className="group bg-card rounded-xl p-6 text-center card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <span className="font-medium text-sm text-foreground">{name}</span>
              </Link>
            ))
          ) : (
            <div className="col-span-2 md:col-span-3 lg:col-span-6 text-center py-8">
              <p className="text-muted-foreground">No categories available yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
