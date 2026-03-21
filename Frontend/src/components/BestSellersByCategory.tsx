import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductsQuery, Product } from "@/store/api/productApi";

const pickBestSellers = (products: Product[]) => {
  const grouped = products.reduce<Record<string, Product[]>>((acc, product) => {
    const category = product.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, items]) => ({
      category,
      products: [...items]
        .sort((a, b) => {
          const reviewDiff = (b.numReviews || 0) - (a.numReviews || 0);
          if (reviewDiff !== 0) return reviewDiff;
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 4),
    }))
    .filter((group) => group.products.length > 0)
    .slice(0, 3);
};

const BestSellersByCategory = () => {
  const { data: response, isLoading } = useGetProductsQuery({});
  const products = (response?.data || response || []) as Product[];
  const sections = pickBestSellers(products);

  if (!isLoading && sections.length === 0) return null;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Best Sellers
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Most loved in top categories</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Handpicked from popular categories based on shopper interest and product traction.
            </p>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-sm font-semibold text-primary md:inline-flex">
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-12">
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="h-7 w-52 rounded bg-muted animate-pulse" />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((__, cardIdx) => (
                      <div key={cardIdx} className="h-[380px] rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                </div>
              ))
            : sections.map((section) => (
                <div key={section.category}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-display font-bold text-foreground">{section.category}</h3>
                    <Link
                      to={`/shop?category=${encodeURIComponent(section.category)}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      View category
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {section.products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersByCategory;
