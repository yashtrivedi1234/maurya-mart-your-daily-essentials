import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated 404 Text */}
          <div className="relative mb-8 inline-block">
            <h1 className="text-[12rem] md:text-[18rem] font-display font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/20 opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl md:text-6xl font-display font-bold text-foreground">
                Oops!
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20 group" asChild>
                <Link to="/">
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-bold gap-2 hover:bg-primary/5 border-primary/20" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border/40 text-sm text-muted-foreground">
            Looking for something specific? Check our <Link to="/shop" className="text-primary font-semibold hover:underline">Shop</Link> or <Link to="/categories" className="text-primary font-semibold hover:underline">Categories</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
