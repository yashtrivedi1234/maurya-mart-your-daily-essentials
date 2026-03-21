import { Star } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="py-8 relative overflow-hidden bg-background">
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient blobs */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.06)" }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.06)" }}
      />

      <div className="container mx-auto px-4 relative">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full backdrop-blur-sm"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
              border: "1px solid hsl(var(--primary) / 0.2)",
            }}
          >
            <Star className="h-3 w-3 fill-current" />
            Verified Reviews
          </span>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
            What Our{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.55))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Customers Say
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Trusted by thousands of happy shoppers across India — real reviews from real customers on Google.
          </p>
        </div>

        {/* ── Google Reviews iframe ── */}
        <div className="flex justify-center">
          <div
            className="w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
            style={{
              boxShadow:
                "0 0 0 1px hsl(var(--border)), 0 20px 25px -5px hsl(var(--foreground) / 0.08), 0 8px 10px -6px hsl(var(--foreground) / 0.04)",
            }}
          >
            <iframe
              src="https://widgets.sociablekit.com/google-reviews/iframe/25664316"
              width="100%"
              height="300"
              style={{ border: "none", display: "block" }}
              title="Google Reviews"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
