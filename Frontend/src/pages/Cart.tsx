import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation, useClearCartMutation } from "@/store/api/cartApi";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

const Cart = () => {
  const { data: cart, isLoading } = useGetCartQuery({});
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId).unwrap();
      } else {
        await updateItem({ productId, quantity }).unwrap();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update cart.",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0);
  };

  if (isLoading) return <div className="flex justify-center items-center min-vh-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Shopping Cart</h1>
          {cart?.items.length > 0 && (
            <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => clearCart({})}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear All
            </Button>
          )}
        </div>

        {cart?.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => navigate("/shop")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart?.items.map((item: CartItem) => (
                <div key={item.product._id} className="bg-white rounded-xl p-4 border flex items-center gap-4 shadow-sm">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                    <p className="text-primary font-bold">₹{item.product.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-1">
                    <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product._id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <Button variant="ghost" className="mt-4" onClick={() => navigate("/shop")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
              </Button>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border shadow-sm sticky top-24">
                <h3 className="text-xl font-display font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
                <Button className="w-full h-12 text-lg rounded-xl" onClick={() => navigate("/checkout")}>
                  Checkout <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
