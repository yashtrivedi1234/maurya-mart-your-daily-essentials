import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const bgImages = [
  "https://images.unsplash.com/photo-1543512214-318c7553f230?w=1600&q=80", // Smart Speaker (Desk piece / smile-like design element)
  "https://images.unsplash.com/photo-1615526653284-81cc42eab0fa?w=1600&q=80", // Phone stand/charging dock
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&q=80", // Neckband / In-ear wireless headphones
  "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1600&q=80", // Earbuds setup
];

const CTASection = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 3000); // 3 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="hero-gradient rounded-2xl p-10 md:p-16 text-center relative overflow-hidden bg-primary/95">
          {/* Animated Background Image Elements */}
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentBg}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${bgImages[currentBg]}')` }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </AnimatePresence>
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 z-0 bg-black/60 pointer-events-none" />
          
          <div className="relative z-10 w-full h-full">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4"
            >
              Get 20% Off Your First Order
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="text-primary-foreground/80 max-w-md mx-auto mb-8 text-lg"
            >
              Join thousands of happy customers. Sign up now and start saving on everyday essentials.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "backOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full bg-primary-foreground/15 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 text-sm transition-all hover:bg-primary-foreground/20"
              />
              <Button variant="hero-outline" className="rounded-full px-6 transition-transform hover:scale-105 active:scale-95">
                Subscribe <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
