const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.9 17.7 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37.1 46.1 31.3 46.1 24.5z"/>
    <path fill="#FBBC05" d="M10.7 28.4A14.6 14.6 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7-5.4A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l7.2-5.9z"/>
    <path fill="#EA4335" d="M24 47c5.6 0 10.4-1.9 13.9-5.1l-7-5.4C29.2 37.9 26.7 38.5 24 38.5c-6.3 0-11.6-4.4-13.3-10.2l-7.2 5.9C7 41.9 14.9 47 24 47z"/>
  </svg>
);

const StarFilled = () => (
  <svg viewBox="0 0 20 20" fill="#FBBF24" className="w-4 h-4" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Testimonials = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-background">

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
        <div className="text-center mb-8">
          <span
            className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
            }}
          >
            Verified Reviews
          </span>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
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
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Trusted by thousands of happy shoppers across India — real reviews, straight from Google.
          </p>
        </div>

       

        {/* ── iframe wrapper ── */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            boxShadow:
              "0 0 0 1px hsl(var(--border)), 0 24px 64px -12px hsl(var(--foreground) / 0.08)",
          }}
        >
          {/* Google-color top accent bar */}
          <div
            className="h-[3px] w-full"
            style={{
              background: "linear-gradient(90deg, #4285F4 25%, #34A853 50%, #FBBC05 75%, #EA4335 100%)",
            }}
          />

          <iframe
            src="https://widgets.sociablekit.com/google-reviews/iframe/25664316"
            frameBorder="0"
            width="100%"
            height="300px"
            title="MaurMart Google Reviews"
            loading="lazy"
            className="block bg-card"
          />

          {/* Fade out bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, hsl(var(--background)) 20%, transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;