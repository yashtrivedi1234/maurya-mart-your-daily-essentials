import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import mauryaLogo from "../image/mauryalogo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = ["Home", "Shop", "Categories", "About", "Contact"];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center justify-center pt-4">
          <img 
            src={mauryaLogo} 
            alt="Maurya Mart Logo" 
            className="w-[160px] sm:w-[190px] md:w-[210px] h-auto object-contain rounded-lg drop-shadow-sm"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
              0
            </span>
          </Button>
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Sign Up</Button>
          </Link>
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

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 animate-fade-in flex flex-col gap-2">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              {link}
            </a>
          ))}
          <div className="flex gap-2 mt-3">
            <Link to="/login" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">Sign In</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
