import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  { id: 1, name: "Wireless Earbuds Pro", price: 1499, mrp: 2999, rating: 4.5, reviews: 234, category: "Electronics", image: "🎧" },
  { id: 2, name: "Organic Green Tea (100g)", price: 299, mrp: 450, rating: 4.7, reviews: 189, category: "Kitchen", image: "🍵" },
  { id: 3, name: "Smart Watch Series 5", price: 3999, mrp: 7999, rating: 4.3, reviews: 156, category: "Electronics", image: "⌚" },
  { id: 4, name: "Premium Face Wash", price: 249, mrp: 399, rating: 4.6, reviews: 312, category: "Beauty", image: "✨" },
  { id: 5, name: "Cotton T-Shirt Pack", price: 699, mrp: 1299, rating: 4.4, reviews: 98, category: "Fashion", image: "👕" },
  { id: 6, name: "Bluetooth Speaker", price: 1299, mrp: 2499, rating: 4.5, reviews: 201, category: "Audio", image: "🔊" },
  { id: 7, name: "Stainless Steel Bottle", price: 399, mrp: 699, rating: 4.8, reviews: 445, category: "Home", image: "🧴" },
  { id: 8, name: "LED Desk Lamp", price: 899, mrp: 1599, rating: 4.2, reviews: 87, category: "Home", image: "💡" },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Featured Products
            </h2>
            <p className="text-muted-foreground">Handpicked deals just for you</p>
          </div>
          <Button variant="link" className="hidden md:inline-flex">
            View All →
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
            return (
              <div
                key={product.id}
                className="group bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative bg-accent/50 h-44 md:h-52 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </span>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">₹{product.price}</span>
                      <span className="text-xs text-muted-foreground line-through ml-1.5">₹{product.mrp}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
