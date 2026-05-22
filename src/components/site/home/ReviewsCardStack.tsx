import React, { useEffect, useState, useCallback } from "react";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useClientReviews } from "@/hooks/useClientReviews";
import { clientReviews } from "@/data/clientPhotos";
import { GoogleRatingBadge } from "@/components/site/reviews/GoogleBadge";
import useEmblaCarousel from "embla-carousel-react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

const ReviewsCardStack = () => {
  const ref = useReveal<HTMLDivElement>();
  const { display: dbReviews } = useClientReviews();
  
  const items = dbReviews.length > 0 ? dbReviews : clientReviews;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  return (
    <section 
      id="reviews"
      className="relative py-24 md:py-32 bg-background overflow-hidden"
    >
      {/* Ambient backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(var(--gold)) 0%, transparent 60%)" }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container relative z-10 mb-14">
        <div className="text-center max-w-2xl mx-auto reveal">
          <div className="flex justify-center mb-5">
            <GoogleRatingBadge rating={4.9} count={142} />
          </div>
          <p className="text-xs tracking-luxe uppercase text-gold mb-3 font-semibold">
            Real Travellers · Real Moments
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            Postcards from <span className="italic text-gold">our guests</span>
          </h2>
          <div className="mt-6 h-px w-16 bg-gold mx-auto" />
        </div>
      </div>

      <div 
        ref={ref} 
        className="reveal relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 py-8">
            {items.map((review, index) => {
              const isActive = index === selectedIndex;
              return (
                <div 
                  key={index}
                  className="flex-[0_0_100%] md:flex-[0_0_66.666%] lg:flex-[0_0_35%] pl-4 transition-all duration-500 ease-out"
                >
                  <div 
                    className={cn(
                      "h-full flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500",
                      isActive 
                        ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] scale-100 opacity-100 relative z-10" 
                        : "shadow-sm scale-[0.92] opacity-50 z-0 cursor-pointer"
                    )}
                    onClick={() => !isActive && scrollTo(index)}
                  >
                    {/* Top Image */}
                    <div className="relative h-48 sm:h-56 md:h-64 w-full bg-slate-100 shrink-0">
                      {review.image ? (
                        <img 
                          src={review.image} 
                          alt={review.destination || "Destination"} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Location Badge */}
                      {review.destination && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/50">
                          <MapPin className="w-3.5 h-3.5 text-slate-800" />
                          <span className="text-[11px] font-medium text-slate-800 tracking-wide">
                            {review.destination}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col flex-grow bg-white">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4 shrink-0">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="font-serif text-lg md:text-xl text-slate-700 leading-relaxed italic mb-6 flex-grow">
                        "{review.text}"
                      </blockquote>

                      {/* Reviewer Name */}
                      <div className="mt-auto pt-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {review.name}
                        </span>
                        {/* Optional Date if available */}
                        {review.date && (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            {review.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <button
          onClick={scrollPrev}
          className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full items-center justify-center text-slate-800 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] border border-white hover:bg-white hover:scale-105 transition-all z-20"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full items-center justify-center text-slate-800 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] border border-white hover:bg-white hover:scale-105 transition-all z-20"
          aria-label="Next review"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8 z-20 relative">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selectedIndex 
                  ? "w-8 bg-gold" 
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCardStack;
