import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import API from "../../api/api.js";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Login Successful", {
        description: "Welcome back to Maurya Mart!",
      });
      navigate("/");
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.response?.data?.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements matching CTASection */}
        <motion.div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full mix-blend-screen filter blur-[80px]"
          style={{ backgroundColor: "var(--primary-foreground)", opacity: 0.15 }}
          animate={{ x: [0, 100, 0], y: [0, 50, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full mix-blend-screen filter blur-[100px]"
          style={{ backgroundColor: "var(--primary-foreground)", opacity: 0.1 }}
          animate={{ x: [0, -80, 0], y: [0, -60, 40, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
           className="w-full max-w-md relative z-10"
        >
          <div className="glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden border border-white/10 dark:border-white/5 bg-white/70 dark:bg-black/40 backdrop-blur-xl">
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

            <div className="text-center mb-10">
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-3xl font-display font-bold text-foreground"
              >
                Welcome back
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-3 text-sm text-muted-foreground"
              >
                Enter your credentials to access your account
              </motion.p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-foreground ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-input focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-6 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.4 }}
               className="mt-8 pt-6 border-t border-border/50 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Sign up now
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;