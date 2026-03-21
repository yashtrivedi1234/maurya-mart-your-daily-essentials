import React, { useState, useEffect } from "react";
import { ArrowRight, Truck, Shield, RotateCcw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetHeroSlidesQuery } from "@/store/api/heroApi";

const HeroSection = () => {
  const { data: slides, isLoading } = useGetHeroSlidesQuery({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  useEffect(() => {
    if (slides && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSlides = slides && slides.length > 0 ? slides : [];

  if (!activeSlides || activeSlides.length === 0) {
    return <div>No hero slides available. Create one from the admin panel.</div>;
  }

  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  const nextSlide = () => setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  return (
    <section className="relative overflow-hidden group">
      <div 
        key={currentSlide._id}
        className="hero-gradient relative min-h-[500px] md:min-h-[600px] flex items-center transition-all duration-1000 animate-fade-in"
        style={{
          backgroundImage: currentSlide.image ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${currentSlide.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6 animate-fade-in">
              {currentSlide.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {currentSlide.heading}{" "}
              <span className="text-primary-foreground">{currentSlide.highlight}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {currentSlide.sub}
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero-outline" size="lg" className="rounded-full text-base px-8">
                Shop Now <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="rounded-full text-base px-8">
                Explore Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      {activeSlides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlideIndex ? "bg-white w-8" : "bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}

     
    </section>
  );
};

export default HeroSection;
