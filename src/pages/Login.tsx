import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isSignUp ? "Account Created!" : "Welcome Back!",
      description: isSignUp
        ? "Your account has been created successfully."
        : "You have signed in successfully.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_50%_40%/0.3),transparent_60%)]" />
        <div className="relative z-10 max-w-md">
          <a href="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <span className="font-display font-bold text-2xl text-primary-foreground">
              Maur<span className="opacity-80">Mart</span>
            </span>
          </a>
          <h1 className="text-4xl font-display font-bold text-primary-foreground leading-tight mb-4">
            Your Daily Essentials, Delivered Fast
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Shop groceries, electronics, and everyday products at the best prices. Join thousands of happy customers.
          </p>
          <div className="mt-10 flex gap-6 text-primary-foreground/60 text-sm">
            <span>✓ Free Delivery</span>
            <span>✓ Secure Payments</span>
            <span>✓ Easy Returns</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to store
          </Button>

          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Maur<span className="text-primary">Mart</span>
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isSignUp
                ? "Sign up to start shopping"
                : "Sign in to your MaurMart account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Yash Trivedi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-lg text-base">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
