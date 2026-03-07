import { Link } from "react-router-dom";
import { Smartphone, UtensilsCrossed, Shirt, Sparkles, Home, Headphones, ArrowRight } from "lucide-react";
import { mockProducts } from "@/data/mockProducts";
import ProductCard from "@/components/shop/ProductCard";

const categoryData = [
  { name: "Daily Essentials", icon: Sparkles, color: "340 70% 55%", description: "Everyday items you can't live without" },
  { name: "Electronics", icon: Smartphone, color: "145 63% 42%", description: "Latest gadgets and tech accessories" },
  { name: "Kitchen Items", icon: UtensilsCrossed, color: "30 80% 55%", description: "Upgrade your cooking experience" },
  { name: "Accessories", icon: Shirt, color: "280 60% 55%", description: "Complete your look with style" },
  { name: "Home Utility", icon: Home, color: "200 70% 50%", description: "Smart solutions for your home" },
];

const Categories = () => {
  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
        All Categories
      </h1>
      <p className="text-muted-foreground mb-10">
        Explore our collections across every category
      </p>

      <div className="space-y-14">
        {categoryData.map(({ name, icon: Icon, color, description }) => {
          const products = mockProducts.filter((p) => p.category === name).slice(0, 4);

          return (
            <div key={name}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `hsl(${color} / 0.12)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: `hsl(${color})` }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">{name}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Link
                  to={`/shop?category=${encodeURIComponent(name)}`}
                  className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/30 p-10 text-center">
                  <p className="text-muted-foreground">No products in this category yet.</p>
                </div>
              )}

              <Link
                to={`/shop?category=${encodeURIComponent(name)}`}
                className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
              >
                View All {name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
