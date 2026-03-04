import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

/* ─── Slide data ─── */
const slides = [
  {
    id: 0,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
    badge: "� Top Tech at Unbeatable Prices",
    heading: "The Latest in Tech,",
    highlight: "Delivered Fast",
    sub: "Upgrade your lifestyle with our premium selection of laptops, smartphones, and accessories.",
  },
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
    badge: "🎧 Premium Audio Gear",
    heading: "Immersive Sound,",
    highlight: "Crystal Clear",
    sub: "Experience music like never before with top-tier headphones and speakers from leading brands.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=1600&q=80",
    badge: "🔌 Ultimate Electronics",
    heading: "Premium Electronics,",
    highlight: "At Your Fingertips",
    sub: "From gaming consoles to home entertainment systems, discover electronics that elevate your experience.",
  },
];

/* ─── Trust bar items ─── */
const trust = [
  { icon: Truck, title: "Free Delivery", desc: "On orders above ₹499" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
];

/* ─── Animation variants ─── */
const badge: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.4 } },
};
const heading: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay: 0.15 },
  },
  exit: { opacity: 0, y: -30, filter: "blur(10px)", transition: { duration: 0.4 } },
};
const para: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
  },
  exit: { opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.4 } },
};
const btns: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.45 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};
const imgVariant: Variants = {
  enter: { scale: 1.15, opacity: 0, filter: "blur(15px)" },
  center: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: "easeOut" },
  },
  exit: {
    scale: 1.05,
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (idx: number) => emblaApi && emblaApi.scrollTo(idx),
    [emblaApi],
  );

  const slide = slides[current];

  return (
    <section className="relative">
      {/* ── Background carousel ── */}
      <div className="relative overflow-hidden h-[92vh] min-h-[560px]">
        {/* Embla (hidden but drives logic) */}
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((s) => (
              <div key={s.id} className="flex-[0_0_100%] min-w-0 h-full" />
            ))}
          </div>
        </div>

        {/* Animated image layer */}
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            variants={imgVariant}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={slides[current].image}
              alt={`Hero Slide ${current + 1}`}
              className="w-full h-full object-cover"
            />
            {/* layered overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* ── Content ── */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`badge-${current}`}
                  variants={badge}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 tracking-wide"
                  style={{
                    background: "rgba(34,197,94,0.18)",
                    border: "1px solid rgba(134,239,172,0.4)",
                    color: "#bbf7d0",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {slide.badge}
                </motion.span>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={`h-${current}`}
                  variants={heading}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-3"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {slide.heading}{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {slide.highlight}
                  </span>
                </motion.h1>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={`p-${current}`}
                  variants={para}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-white/75 text-lg md:text-xl mb-9 max-w-lg leading-relaxed font-medium"
                >
                  {slide.sub}
                </motion.p>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`b-${current}`}
                  variants={btns}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-wrap gap-4"
                >
                  {/* Primary */}
                  <motion.button
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 8px 32px rgba(34,197,94,0.55)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold text-white shadow-lg transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    }}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>

                  {/* Secondary – glassmorphism */}
                  <motion.button
                    whileHover={{
                      scale: 1.04,
                      background: "rgba(255,255,255,0.18)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-full text-base font-bold text-white border transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1.5px solid rgba(255,255,255,0.28)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    Explore Categories
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? "28px" : "8px",
                background: i === current ? "#22c55e" : "rgba(255,255,255,0.4)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a2e1a 100%)",
          borderTop: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {trust.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15 * i,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                className="flex items-center gap-4 justify-center py-4 md:py-3 px-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#4ade80" }} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{title}</p>
                  <p className="text-xs" style={{ color: "#86efac99" }}>
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
