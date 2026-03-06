import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { mockProducts } from "@/data/mockProducts";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
      </section>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const related = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart!`);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg bg-foreground/80 px-5 py-2 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-1">
                {product.category}
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="text-primary font-semibold">
                  Save ₹{((product.originalPrice ?? 0) - product.price).toLocaleString("en-IN")}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={!product.inStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium text-foreground">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 text-base"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            <Separator />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Free Delivery" },
                { icon: Shield, label: "Secure Payment" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <Separator className="mb-10" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetail;
