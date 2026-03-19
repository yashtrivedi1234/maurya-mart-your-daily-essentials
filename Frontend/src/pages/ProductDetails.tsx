import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, ShoppingCart, Truck, Shield, RotateCcw,
  Minus, Plus, Heart, Share2, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Package,
  RefreshCw, ChevronRight, Zap,
  Maximize2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductByIdQuery, useGetProductsQuery, Product, useAddReviewMutation, useCheckCanReviewQuery } from "@/store/api/productApi";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAddToCartMutation } from "@/store/api/cartApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Mock constants removed to favor dynamic data from the database.

/* ─── Sub-components ─── */

const StarRow = ({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) => (
  <>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${s <= Math.round(rating || 0)
            ? "text-yellow-400 fill-yellow-400"
            : "text-muted-foreground/30"
          }`}
      />
    ))}
  </>
);

const SectionToggle = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left"
      >
        <span className="font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
};

/* ─── Main component ─── */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { data: product, isLoading } = useGetProductByIdQuery(id);
  const { data: allProducts } = useGetProductsQuery(undefined);
  const products = Array.isArray(allProducts) ? allProducts : [];
  
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();
  const { data: canReviewData } = useCheckCanReviewQuery(id || "", { 
    skip: !localStorage.getItem("token") || !id 
  });
  
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const canReview = canReviewData?.canReview || false;

  console.log("ProductDetails State:", { id, product, isLoading, productsCount: products.length });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground font-medium">Loading product details...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button size="lg" onClick={() => navigate("/shop")}>Back to Shop</Button>
      </section>
    );
  }

  const discount = (product.originalPrice && product.price && product.originalPrice > product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const related = products
    .filter((p) => p && p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      const productName = product?.name || "Product";
      toast.success(`✓ ${quantity > 1 ? `${quantity}x ` : ""}${productName} added to cart!`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      const errorMessage = error?.data?.message || "Failed to add to cart";
      console.error("Add to cart error:", err);
      toast.error(errorMessage);
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    try {
      await addReview({ 
        id: product._id, 
        reviewData: { rating: newRating, comment: newComment } 
      }).unwrap();
      toast.success("Review submitted successfully!");
      setNewComment("");
      setIsReviewFormOpen(false);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to submit review");
    }
  };

  const totalReviews = product.numReviews || 0;
  const avgRating = typeof product.rating === 'number' ? product.rating.toFixed(1) : "0.0";

  const breakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = (Array.isArray(product.reviews) ? product.reviews : []).filter(r => Math.round(r.rating || 0) === stars)?.length || 0;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, pct };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Breadcrumb ── */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-medium">{product.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── Hero section ── */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.1fr_320px] gap-8 lg:gap-10">

          {/* ── Left: Image gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border cursor-zoom-in group"
              onClick={() => setIsImageOpen(true)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center text-white">
                <Maximize2 className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" />
              </div>
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg bg-foreground/80 px-5 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setWishlisted((w) => !w); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist!"); }}
                  className="h-9 w-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow hover:bg-background transition-colors"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}
                  className="h-9 w-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow hover:bg-background transition-colors"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Image Modal */}
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Middle: Product details ── */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-1">
                {product.category}
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex">{<StarRow rating={product.rating || 0} size="h-5 w-5" />}</div>
              {product.numReviews > 0 && (
                <>
                  <span className="text-muted-foreground text-sm">|</span>
                  <span className="text-sm text-green-600 font-medium">{product.numReviews} reviews</span>
                </>
              )}
              {(product as any).soldLastMonth > 0 && (
                <>
                  <span className="text-muted-foreground text-sm">|</span>
                  <span className="text-sm text-green-600 font-medium">{(product as any).soldLastMonth.toLocaleString()}+ sold</span>
                </>
              )}
            </div>

            <Separator />

            {/* Price block */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-bold text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {discount > 0 && product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through ml-2">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 ml-3">
                    {discount}% off
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Bank offer strip */}
            {product.bankOffers && product.bankOffers.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Bank Offers
                </p>
                {product.bankOffers.map((offer, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-6">• {offer}</p>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">About this item</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Key Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost" size="icon" className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={product.stock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium text-foreground">{quantity}</span>
                <Button
                  variant="ghost" size="icon" className="h-9 w-9"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={product.stock <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {product.stock > 0
                ? <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> In Stock</span>
                : <span className="text-destructive text-sm font-medium flex items-center gap-1"><XCircle className="h-4 w-4" /> Out of Stock</span>
              }
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg" className="flex-1 gap-2 text-base"
                disabled={product.stock <= 0 || isAdding}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock > 0 ? (isAdding ? "Adding..." : "Add to Cart") : "Out of Stock"}
              </Button>
              <Button
                size="lg" variant="outline" className="flex-1 gap-2 text-base border-primary text-primary hover:bg-primary/5"
                disabled={product.stock <= 0}
                onClick={() => { handleAddToCart(); navigate("/cart"); }}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* ── Right: Delivery & seller card ── */}
          <div className="md:col-span-2 xl:col-span-1 space-y-4">
            <div className="border border-border rounded-xl p-5 space-y-5">
              {/* Delivery */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Delivery</h3>
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{(product as any).deliveryInfo?.standard || "Free Delivery"}</p>
                    <p className="text-muted-foreground text-xs">{(product as any).deliveryInfo?.standardDays || "Standard delivery"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seller */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Sold by</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary text-sm font-medium">{(product as any).sellerInfo?.name || "MaurMart"}</span>
                </div>
                {(product as any).sellerInfo?.rating > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="text-yellow-500">★</span>
                    <span>{(product as any).sellerInfo?.rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Returns */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Returns</h3>
                <div className="flex items-start gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    {(product as any).returnPolicy?.days > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Eligible for return within <strong className="text-foreground">{(product as any).returnPolicy?.days} days</strong> of delivery.
                      </p>
                    )}
                    {(product as any).returnPolicy?.description && (
                      <p className="text-muted-foreground text-xs mt-1">{(product as any).returnPolicy?.description}</p>
                    )}
                  </div>
                </div>
                {(product as any).warranty?.duration && (
                  <div className="flex items-start gap-2 text-sm mt-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground text-xs">
                      <strong className="text-foreground">{(product as any).warranty?.duration}</strong>
                      {(product as any).warranty?.description && ` - ${(product as any).warranty?.description}`}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Methods */}
              {(product as any).paymentMethods && (product as any).paymentMethods.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Accepted Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {(product as any).paymentMethods.map((method: string) => (
                      <span key={method} className="text-xs border border-border rounded px-2.5 py-1 text-muted-foreground bg-secondary/40">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Package contents */}
              {product.inTheBox && product.inTheBox.length > 0 && (
                <div className="border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> What's in the box
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {product.inTheBox.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Expandable content sections ── */}
      <section className="container mx-auto px-4 pb-10 space-y-4 max-w-4xl">
        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <SectionToggle title="Product Specifications" defaultOpen={true}>
            <div className="divide-y divide-border">
              {product.specifications.map((spec, i) => (
                <div key={i} className="grid grid-cols-2 py-2.5 text-sm">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="text-foreground font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </SectionToggle>
        )}

        {/* Reviews */}
        <SectionToggle title={`Customer Reviews (${totalReviews.toLocaleString()})`} defaultOpen={true}>
          <div id="reviews" className="space-y-6">
            {/* Aggregate */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-5xl font-bold text-foreground">{avgRating}</span>
                <div className="flex mt-1">{<StarRow rating={parseFloat(avgRating)} size="h-4 w-4" />}</div>
                <span className="text-xs text-muted-foreground mt-1">{totalReviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                {breakdown.map(({ stars, count, pct }) => {
                  return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground w-12 text-right shrink-0">{stars} star</span>
                      <Progress value={pct} className="flex-1 h-2.5" />
                      <span className="text-muted-foreground w-10 text-right shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              
              {canReview ? (
                <div className="sm:border-l sm:pl-6 w-full sm:w-auto flex flex-col items-center justify-center">
                  <p className="text-sm font-medium mb-3 text-center">Share your thoughts</p>
                  <Button 
                    onClick={() => setIsReviewFormOpen(true)}
                    className="gap-2 shadow-lg shadow-primary/20"
                  >
                    <MessageSquare className="h-4 w-4" /> Write a Review
                  </Button>
                </div>
              ) : localStorage.getItem("token") ? (
                <div className="sm:border-l sm:pl-6 w-full sm:w-auto flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm font-medium text-center text-blue-900 dark:text-blue-200">
                    Only verified buyers can review this product
                  </p>
                  <p className="text-xs text-blue-700/70 dark:text-blue-300/70 text-center mt-1">
                    Purchase this product to share your feedback
                  </p>
                </div>
              ) : (
                <div className="sm:border-l sm:pl-6 w-full sm:w-auto flex flex-col items-center justify-center p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                  <p className="text-sm font-medium text-center text-amber-900 dark:text-amber-200">
                    Sign in to write a review
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 mt-2"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {isReviewFormOpen && (
              <div className="bg-secondary/30 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">Write a Review</h4>
                  <button onClick={() => setIsReviewFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => setNewRating(s)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${s <= newRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Review</p>
                  <Textarea 
                    placeholder="What did you like or dislike? How was the quality?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] rounded-xl bg-background"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsReviewFormOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={isSubmittingReview}
                    className="px-8 shadow-md"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Individual reviews */}
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r) => (
                  <div key={r._id} className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {r.name[0]}
                      </div>
                      <span className="font-medium text-foreground text-sm">{r.name}</span>
                      <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                        ✓ Verified Purchase
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex">{<StarRow rating={r.rating} size="h-4 w-4" />}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                    <Separator />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground italic text-sm">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full">View all {totalReviews.toLocaleString()} reviews</Button>
          </div>
        </SectionToggle>

        {/* Q&A */}
        {product.questions && product.questions.length > 0 && (
          <SectionToggle title="Customer Questions & Answers">
            <div className="space-y-4">
              {product.questions.map((q, i, arr) => (
                <div key={i} className="space-y-1">
                  <p className="text-sm font-semibold text-foreground flex gap-2">
                    <span className="text-primary shrink-0">Q.</span>{q.question}
                  </p>
                  <p className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-green-600 shrink-0 font-semibold">A.</span>{q.answer}
                  </p>
                  {i < arr.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </SectionToggle>
        )}
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-14">
          <Separator className="mb-10" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Customers Also Bought
            </h2>
            <Link to="/shop" className="text-primary text-sm hover:underline flex items-center gap-1">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
