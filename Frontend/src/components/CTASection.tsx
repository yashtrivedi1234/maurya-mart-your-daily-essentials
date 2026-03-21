import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscribeNewsletterMutation } from "@/store/api/newsletterApi";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

const CTASection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = normalizeEmail(email);
    if (!trimmed) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!isValidEmail(trimmed)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    try {
      await subscribe({ email: trimmed }).unwrap();
      toast({ title: "Subscribed!", description: "You're on the list for updates and offers." });
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Subscription failed",
        description: err?.data?.message || err?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="hero-gradient rounded-2xl p-10  text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_50%_40%/0.3),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Get 20% Off Your First Order
            </h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto mb-8 text-lg">
              Join thousands of happy customers. Sign up now and start saving on everyday essentials.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your best email for offers"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                disabled={isLoading}
                className="flex-1 px-5 py-3 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 text-sm disabled:opacity-70"
              />
              <Button
                type="submit"
                variant="hero-outline"
                className="rounded-full px-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Subscribe <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
