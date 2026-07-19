import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import slide1 from "@/assets/hero-slide-1.png.asset.json";
import slide2 from "@/assets/hero-slide-2.png.asset.json";
import slide3 from "@/assets/hero-slide-3.png.asset.json";
import slide4 from "@/assets/hero-slide-4.png.asset.json";

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Jain+Tours+%26+Travels+Mumbai+reviews";

const slides = [
  {
    url: slide1.url,
    alt: "Tropical beach at golden hour with palm trees and turquoise water",
    positionDesktop: "center 55%",
    positionMobile: "30% 55%",
  },
  {
    url: slide2.url,
    alt: "Swiss Alps lake at sunrise with snow-capped peaks and red train",
    positionDesktop: "center 50%",
    positionMobile: "40% 50%",
  },
  {
    url: slide3.url,
    alt: "Japan cherry blossoms and pagoda reflected on calm water at sunset",
    positionDesktop: "center 55%",
    positionMobile: "65% 55%",
  },
  {
    url: slide4.url,
    alt: "Dubai Marina skyline at twilight with palms and yachts",
    positionDesktop: "center 55%",
    positionMobile: "70% 55%",
  },
];

const GoogleG = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

const HeroLuxe = () => {
  const initial = useMemo(() => Math.floor(Math.random() * slides.length), []);
  const [current, setCurrent] = useState(initial);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Crossfading background slideshow */}
      <div className="absolute inset-0">
        {slides.map((s, idx) => (
          <img
            key={s.url}
            src={s.url}
            alt={s.alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out"
            style={{
              opacity: idx === current ? 1 : 0,
              objectPosition: isMobile ? s.positionMobile : s.positionDesktop,
            }}
            loading={idx === initial ? "eager" : "lazy"}
            fetchPriority={idx === initial ? "high" : "auto"}
            decoding={idx === initial ? "sync" : "async"}
            width={1920}
            height={1080}
          />
        ))}
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
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-10 opacity-0 animate-hero-fade-up hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-500"
          style={{ animationDelay: "80ms" }}
          aria-label="Read our Google Reviews"
        >
          <GoogleG className="w-4 h-4" />
          <span className="text-xs font-semibold text-white tabular-nums">4.9</span>
          <span className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.897l-7.335 3.868 1.401-8.168L.132 9.21l8.2-1.192z" />
              </svg>
            ))}
          </span>
          <span className="hidden sm:inline w-px h-3.5 bg-white/30" aria-hidden />
          <span className="text-[11px] tracking-wide text-white/95 font-medium">
            140+ Google Reviews
          </span>
        </a>

        <h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight text-white opacity-0 animate-hero-fade-up"
          style={{
            animationDelay: "220ms",
            textShadow: "0 2px 24px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
          }}
        >
          &nbsp;
          <span
            className="font-serif italic font-medium bg-clip-text text-transparent inline-block"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #FBF3D9 0%, #F3DDA0 25%, #E6C475 50%, #F3DDA0 75%, #FBF3D9 100%)",
              filter:
                "drop-shadow(0 0 28px rgba(230,196,117,0.4)) drop-shadow(0 2px 14px rgba(0,0,0,0.5))",
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
