import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/store/api/productApi";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

import { useAddToCartMutation } from "@/store/api/cartApi";
import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { Heart } from "lucide-react";

// Helper function to get stock status
const getStockStatus = (stock: number) => {
  if (stock === 0) return { status: "outOfStock", label: "Out of Stock", color: "bg-red-500" };
  if (stock <= 10) return { status: "lowStock", label: `Only ${stock} left`, color: "bg-orange-500" };
  return { status: "inStock", label: "In Stock", color: "bg-green-500" };
};

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const isInWishlist = wishlistItems.some((item) => item.id === product._id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockInfo = getStockStatus(product.stock || 0);
  const productPath = `/shop/${product._id}`;

  const handleCardClick = () => {
    navigate(productPath);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(productPath);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem("token")) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      const productName = product?.name || "Product";
      toast.success(`✓ ${productName} added to cart!`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      const errorMessage = error?.data?.message || "Failed to add item to cart";
      console.error("Add to cart error:", err);
      toast.error(errorMessage);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        mrp: product.originalPrice || product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
        reviews: product.numReviews
      }));
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className={`group cursor-pointer bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      stockInfo.status === "lowStock" ? "border-orange-200 bg-orange-50/30" : ""
    } ${stockInfo.status === "outOfStock" ? "opacity-75" : ""}`}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            stockInfo.status === "outOfStock" ? "grayscale" : "group-hover:scale-110"
          }`}
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold">
            -{discount}%
          </Badge>
        )}

        {/* Stock Status Badge */}
        <Badge
          className={`absolute top-3 right-3 text-xs font-semibold text-white shadow-md ${stockInfo.color}`}
        >
          {stockInfo.label}
        </Badge>

        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-all"
          onClick={handleWishlist}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </Button>

        {/* Out of Stock Overlay */}
        {stockInfo.status === "outOfStock" && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-600/90 px-4 py-2 rounded-lg">
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
            ({product.numReviews || 0})
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

        {/* Stock Indicator Bar (for low stock) */}
        {stockInfo.status === "lowStock" && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all"
              style={{ width: `${(product.stock / 10) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-1">
            <Button
              size="sm"
              className="w-full gap-1.5"
              disabled={product.stock <= 0 || isLoading}
              onClick={handleAddToCart}
            >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
