import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { BRAND } from "@/lib/brand";
import heroBg from "@/assets/hero-luxury-beach.jpg";

const HeroLuxe = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Luxury tropical beach at golden hour with palm trees and turquoise water"
          className="w-full h-full object-cover object-center animate-[ken-burns_28s_ease-in-out_infinite_alternate] scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          width={1920}
          height={1080}
        />
        {/* Cinematic color grade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 mix-blend-multiply" />
        {/* Premium radial vignette behind headline */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 48%, hsl(0 0% 0% / 0.55) 0%, transparent 70%)",
          }}
        />
        {/* Warm gold ambient glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, hsl(42 95% 65% / 0.18) 0%, transparent 55%)",
          }}
        />
        {/* Film grain */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-6 py-32 animate-hero-float">
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] mb-10 opacity-0 animate-hero-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <Star className="w-3.5 h-3.5 fill-rating-star text-rating-star drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
          <span className="text-xs tracking-wide text-white/95 font-medium">
            {BRAND.rating} · Reviews
          </span>
        </div>

        <h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight text-white opacity-0 animate-hero-fade-up"
          style={{
            animationDelay: "220ms",
            textShadow: "0 2px 24px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
          }}
        >
          &nbsp;
          <span
            className="italic font-medium bg-clip-text text-transparent inline-block"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #FDF3C4 0%, #F5D68A 20%, #D4A94A 45%, #F5D68A 70%, #FBE8A6 100%)",
              filter:
                "drop-shadow(0 0 24px rgba(212,169,74,0.35)) drop-shadow(0 2px 12px rgba(0,0,0,0.35))",
            }}
          >
            Journeys Crafted in Gold.
          </span>
        </h1>

        <p
          className="mt-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-light text-white/90 opacity-0 animate-hero-fade-up"
          style={{
            animationDelay: "380ms",
            textShadow: "0 1px 12px rgba(0,0,0,0.5)",
          }}
        >
          From Mumbai to the world — <br /> curated holidays, seamless bookings, and unforgettable journeys tailored just for you.
        </p>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-4 opacity-0 animate-hero-fade-up"
          style={{ animationDelay: "540ms" }}
        >
          <Link
            to="/contact"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full text-[11px] uppercase tracking-luxe font-semibold text-[#1a1206] overflow-hidden transition-all duration-500 hover:-translate-y-0.5"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #F5D68A 0%, #D4A94A 50%, #B8862F 100%)",
              boxShadow:
                "0 12px 40px -8px rgba(212,169,74,0.55), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15)",
            }}
          >
            <span className="relative z-10">Plan My Trip</span>
            <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
              }}
            />
          </Link>
          <Link
            to="/destinations"
            className="group inline-flex items-center px-8 py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-xl text-white text-[11px] uppercase tracking-luxe font-medium shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:border-white/60 transition-all duration-500 hover:-translate-y-0.5"
          >
            Explore Destinations
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-[10px] tracking-luxe uppercase text-white/70">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default HeroLuxe;
