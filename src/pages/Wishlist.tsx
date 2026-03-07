import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/shop/ProductCard";

const Wishlist = () => {
  const { items } = useWishlist();

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
        My Wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Your wishlist is empty</h2>
          <p className="text-muted-foreground">Save products you love for later.</p>
          <Button asChild className="mt-2">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Wishlist;
