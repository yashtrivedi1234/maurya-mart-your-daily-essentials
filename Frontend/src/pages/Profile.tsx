import { useGetProfileQuery, useUpdateProfileMutation, useUploadProfilePicMutation } from "@/store/api/authApi";
import { useGetCartQuery } from "@/store/api/cartApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Shield, LogOut, ArrowLeft, Edit2, Camera, Save, X, Phone, Loader2, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

const Profile = () => {
  const { data: user, isLoading, error } = useGetProfileQuery({});
  const { data: cart } = useGetCartQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadProfilePic, { isLoading: isUploadingPic }] = useUploadProfilePicMutation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("profilePic", file);

    try {
      await uploadProfilePic(uploadFormData).unwrap();
      toast.success("Profile picture updated!");
    } catch (err: unknown) {
      toast.error("Failed to upload profile picture");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  if (error || !user) {
    navigate("/login");
    return null;
  }

  const cartCount = cart?.items?.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to store
          </Button>

          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name || "",
                  phone: user.phone || "",
                });
              }}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating} className="gap-2">
                <Save className="h-4 w-4" /> {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 pb-8 border-b">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl hero-gradient flex items-center justify-center text-white text-4xl font-bold bg-muted relative">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  {isUploadingPic && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <button 
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPic}
                >
                  <Camera className="h-5 w-5" />
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange} 
                />
              </div>
              
              <div className="flex-1 text-center md:text-left pt-2">
                {isEditing ? (
                  <div className="space-y-4 w-full">
                    <div>
                      <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 font-display font-bold text-xl h-12 rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-display font-bold text-foreground">{user.name}</h1>
                    <p className="text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 transition-all hover:bg-muted/80">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <p className="font-semibold">{user.email}</p>
                    <p className="text-[10px] text-green-600 font-medium">Primary Contact</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 transition-all hover:bg-muted/80">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</p>
                    {isEditing ? (
                      <Input 
                        value={formData.phone} 
                        placeholder="+91 0000000000"
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-8 mt-1 text-sm rounded-lg"
                      />
                    ) : (
                      <p className="font-semibold">{user.phone || "Not set"}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <h3 className="font-display font-semibold mb-2">Account Security</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep your account safe by updating your password regularly and verifying your email.
                  </p>
                  <Button variant="outline" className="w-full text-xs h-9">Change Password</Button>
                </div>

                <Button
                  variant="destructive"
                  className="w-full mt-6 flex items-center justify-center gap-2 h-12 shadow-lg shadow-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" /> Logout from Account
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-display font-bold text-foreground">My Shopping Cart</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {cartCount} items
                </span>
              </div>
              <Button variant="link" className="text-primary gap-1 p-0" onClick={() => navigate("/cart")}>
                View Full Cart <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {!cart || cart.items.length === 0 ? (
              <div className="bg-muted/30 rounded-xl p-8 text-center border border-dashed border-border/60">
                <p className="text-muted-foreground mb-4 font-medium">Your cart is currently empty.</p>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/shop")}>
                  Explore Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.slice(0, 3).map((item: CartItem) => (
                  <div key={item.product._id} className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-14 h-14 rounded-lg object-cover shadow-sm bg-white" 
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-muted-foreground">₹{item.product.price.toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    And {cart.items.length - 3} more item{cart.items.length - 3 > 1 ? "s" : ""} in your cart...
                  </p>
                )}
                
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estimated Total</p>
                    <p className="text-2xl font-display font-bold text-primary">
                      ₹{(cart.items.reduce((total: number, item: CartItem) => total + (item.product.price * item.quantity), 0)).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20" onClick={() => navigate("/cart")}>
                    Manage Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
