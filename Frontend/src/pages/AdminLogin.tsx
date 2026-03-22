import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function AdminLogin() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading,   setIsLoading]   = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError("");
    setCredentials((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trimStart() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const email    = normalizeEmail(credentials.email);
    const password = credentials.password.trim();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminApi.post("/admin/login", { email, password });
      const data     = response.data;
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("isAdmin", "true");
      toast({ title: "Welcome back!", description: "Redirecting to admin panel…" });
      navigate("/admin");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldCls = (hasError: boolean) =>
    cn(
      "w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none",
      "focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20",
      hasError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20" : "border-slate-200"
    );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/5 blur-2xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo + heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
            <img src={Logo} alt="MaurMart" className="h-10 w-auto object-contain drop-shadow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Login</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Enter your credentials to access the admin panel.
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">

          {/* Teal top stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-400" />

          <form onSubmit={handleSubmit} className="space-y-5 px-7 py-7">

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@maurmart.com"
                  value={credentials.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                  className={fieldCls(!!error)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={cn(fieldCls(!!error), "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/40 transition-all hover:bg-teal-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
              ) : (
                <><ShieldCheck className="h-4 w-4" />Sign In</>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-600">
          <div className="h-px flex-1 bg-white/5" />
          <span>Protected Admin Panel · Access Restricted</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      </div>
    </div>
  );
}