import { Star, ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/mockProducts";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-semibold">
            -{discount}%
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm bg-foreground/80 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="font-semibold text-card-foreground leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= Math.round(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
          <Button size="sm" variant="outline" className="px-3" asChild>
            <Link to={`/shop/${product.id}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
