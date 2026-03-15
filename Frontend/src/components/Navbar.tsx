import { ShoppingCart, Menu, X, Search, User as UserIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useGetCartQuery } from "@/store/api/cartApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SearchOverlay from "./SearchOverlay";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: user } = useGetProfileQuery({}, { skip: !localStorage.getItem("token") });
  const { data: cart } = useGetCartQuery({}, { skip: !localStorage.getItem("token") });
  const navigate = useNavigate();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const cartCount = cart?.items?.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0) || 0;

  const links = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Maur<span className="text-primary">Mart</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-all duration-200 hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/5"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3">
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold animate-in zoom-in duration-300">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 rounded-full pl-1 pr-3">
                    <div className="w-6 h-6 rounded-full hero-gradient flex items-center justify-center text-[10px] text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate font-medium">{user.name.split(' ')[0]}</span>
                  </Button>
                </Link>
              ) : (
                <Button size="sm" className="rounded-full shadow-lg shadow-primary/20" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-6 pt-2 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="py-3 text-muted-foreground hover:text-primary font-medium transition-colors border-b border-border/50 last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => { navigate("/wishlist"); setMobileOpen(false); }}>
                <Heart className="h-4 w-4" /> Wishlist ({wishlistItems.length})
              </Button>
              <Button className="flex-1 rounded-xl gap-2" onClick={() => { navigate("/cart"); setMobileOpen(false); }}>
                <ShoppingCart className="h-4 w-4" /> Cart ({cartCount})
              </Button>
              {user ? (
                <Button variant="outline" className="w-full rounded-xl" onClick={() => { navigate("/profile"); setMobileOpen(false); }}>
                  Profile
                </Button>
              ) : (
                <Button variant="outline" className="w-full rounded-xl" onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      <SearchOverlay 
        open={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;
