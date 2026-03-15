import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromWishlist, clearWishlist } from "@/store/slices/wishlistSlice";
import { useAddToCartMutation } from "@/store/api/cartApi";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Product {
  id: string | number;
  name: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
}

const Wishlist = () => {
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const dispatch = useDispatch();
  const [addToCart] = useAddToCartMutation();

  const handleAddToCart = async (product: Product) => {
    try {
      if (!localStorage.getItem("token")) {
        toast.error("Please login to add items to cart");
        return;
      }
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleRemove = (id: string | number) => {
    dispatch(removeFromWishlist(id));
    toast.success("Removed from wishlist");
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">Keep track of products you love</p>
        </div>
        {wishlistItems.length > 0 && (
          <Button 
            variant="outline" 
            className="text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={() => {
              dispatch(clearWishlist());
              toast.success("Wishlist cleared");
            }}
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-accent/30 rounded-3xl border border-dashed border-border/60">
          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-xl">
            <Heart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Looks like you haven't added anything to your wishlist yet. Explore our shop to find items you love!
          </p>
          <Link to="/shop">
            <Button className="rounded-full px-8">
              Explore Shop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 border border-border/40"
            >
              <div className="relative bg-accent/40 h-52 flex items-center justify-center group-hover:bg-accent/60 transition-colors">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                  {item.image}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 h-9 w-9 bg-background/80 backdrop-blur-md rounded-full text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{item.category}</p>
                <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-xl font-bold text-primary">₹{item.price}</span>
                    {item.mrp > item.price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">₹{item.mrp}</span>
                    )}
                  </div>
                </div>
                <Button 
                  className="w-full gap-2 rounded-xl h-11"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlistItems.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Link to="/shop">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
