import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  const shipping = subtotal > 999 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      {/* Banner */}
      <section className="bg-gradient-to-br from-secondary via-accent to-secondary py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-2">{totalItems} item{totalItems !== 1 && "s"} in your cart</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" asChild>
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Cart Items</h2>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={clearCart}>
                Clear All
              </Button>
            </div>

            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 bg-card border border-border rounded-xl p-4 transition-all hover:shadow-sm"
              >
                {/* Image */}
                <Link to={`/shop/${product.id}`} className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link to={`/shop/${product.id}`} className="font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">
                        ₹{(product.price * quantity).toLocaleString("en-IN")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders above ₹999
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground text-lg">₹{total.toLocaleString("en-IN")}</span>
              </div>

              <Button size="lg" className="w-full text-base mt-2">
                Proceed to Checkout
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
