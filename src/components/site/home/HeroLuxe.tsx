import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
// Responsive, build-time optimised hero imagery (AVIF + WebP + JPG fallback).
import slide1Avif from "@/assets/hero-slide-1.jpg?w=640;1024;1600;1920&format=avif&as=srcset";
import slide1Webp from "@/assets/hero-slide-1.jpg?w=640;1024;1600;1920&format=webp&as=srcset";
import slide1 from "@/assets/hero-slide-1.jpg?w=1600&format=jpg";
import slide2Avif from "@/assets/hero-slide-2.jpg?w=640;1024;1600;1920&format=avif&as=srcset";
import slide2Webp from "@/assets/hero-slide-2.jpg?w=640;1024;1600;1920&format=webp&as=srcset";
import slide2 from "@/assets/hero-slide-2.jpg?w=1600&format=jpg";
import slide3Avif from "@/assets/hero-slide-3.jpg?w=640;1024;1600;1920&format=avif&as=srcset";
import slide3Webp from "@/assets/hero-slide-3.jpg?w=640;1024;1600;1920&format=webp&as=srcset";
import slide3 from "@/assets/hero-slide-3.jpg?w=1600&format=jpg";
import slide4Avif from "@/assets/hero-slide-4.jpg?w=640;1024;1600;1920&format=avif&as=srcset";
import slide4Webp from "@/assets/hero-slide-4.jpg?w=640;1024;1600;1920&format=webp&as=srcset";
import slide4 from "@/assets/hero-slide-4.jpg?w=1600&format=jpg";

const SLIDE_SIZES = "100vw";

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Jain+Tours+%26+Travels+Mumbai+reviews";

const slides = [
  {
    url: slide1,
    avif: slide1Avif,
    webp: slide1Webp,
    alt: "Tropical beach at golden hour with palm trees and turquoise water",
    positionDesktop: "center 55%",
    positionMobile: "50% 60%",
  },
  {
    url: slide2,
    avif: slide2Avif,
    webp: slide2Webp,
    alt: "Swiss Alps lake at sunrise with snow-capped peaks and red train",
    positionDesktop: "center 50%",
    positionMobile: "55% 55%",
  },
  {
    url: slide3,
    avif: slide3Avif,
    webp: slide3Webp,
    alt: "Japan cherry blossoms and pagoda reflected on calm water at sunset",
    positionDesktop: "center 55%",
    positionMobile: "60% 60%",
  },
  {
    url: slide4,
    avif: slide4Avif,
    webp: slide4Webp,
    alt: "Dubai Marina skyline at twilight with palms and yachts",
    positionDesktop: "center 55%",
    positionMobile: "60% 55%",
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

  // Preload ONLY the hero slideshow images (first slide with high priority).
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    slides.forEach((s, idx) => {
      if (idx !== initial) return;
      if (document.head.querySelector(`link[rel="preload"][imagesrcset="${s.avif}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.setAttribute("imagesrcset", s.avif);
      link.setAttribute("imagesizes", SLIDE_SIZES);
      link.setAttribute("type", "image/avif");
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
      links.push(link);
    });
    return () => links.forEach((l) => l.remove());
  }, [initial]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Crossfading background slideshow */}
      <div className="absolute inset-0">
        {slides.map((s, idx) => (
          <picture key={s.url}>
            <source type="image/avif" srcSet={s.avif} sizes={SLIDE_SIZES} />
            <source type="image/webp" srcSet={s.webp} sizes={SLIDE_SIZES} />
            <img
              src={s.url}
              alt={s.alt}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out"
              style={{
                opacity: idx === current ? 1 : 0,
                objectPosition: isMobile ? s.positionMobile : s.positionDesktop,
                filter: "saturate(1.12) contrast(1.06) brightness(1.03)",
              }}
              loading={idx === initial ? "eager" : "lazy"}
              fetchPriority={idx === initial ? "high" : "auto"}
              decoding={idx === initial ? "sync" : "async"}
              width={1920}
              height={1080}
            />
          </picture>
        ))}
        {/* Premium radial vignette for consistent text readability */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.40) 100%)",
          }}
        />
        {/* Subtle top-to-bottom grade for depth and scroll cue contrast */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.20))",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-6 pt-36 pb-28 md:py-32 -translate-y-20 md:translate-y-0 animate-hero-float">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("google_reviews_badge_click", { location: "hero", rating: 4.9 })}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl mb-7 md:mb-10 opacity-0 animate-hero-fade-up hover:bg-white/15 hover:border-white/40 hover:-translate-y-0.5 transition-all duration-500"
          style={{ animationDelay: "80ms" }}
          aria-label="Read our Google Reviews"
        >
          <GoogleG className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-[10px] font-semibold text-white tabular-nums">4.9</span>
          <span className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-2.5 h-2.5 sm:w-2 sm:h-2" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.897l-7.335 3.868 1.401-8.168L.132 9.21l8.2-1.192z" />
              </svg>
            ))}
          </span>
          <span className="text-[10px] sm:text-[9px] tracking-wide text-white/95 font-medium uppercase">
            Google Reviews
          </span>
        </a>

        <h1
          className="relative font-serif italic font-medium text-[2.95rem] sm:text-[3.4rem] md:text-[4.3rem] lg:text-[5.1rem] leading-[1.05] tracking-tight text-[#F7F2E8] opacity-0 animate-hero-fade-up"
          style={{
            animationDelay: "220ms",
            textShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          Journeys Crafted in Gold.
        </h1>

        <p
          className="mt-5 md:mt-8 max-w-md md:max-w-2xl mx-auto text-sm md:text-lg leading-relaxed font-light text-white opacity-0 animate-hero-fade-up"
          style={{
            animationDelay: "380ms",
            textShadow: "0 2px 10px rgba(0,0,0,0.30)",
          }}
        >
          From Mumbai to the world — <br /> curated holidays, seamless bookings, and unforgettable journeys tailored just for you.
        </p>

        <div
          className="mt-10 md:mt-14 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto opacity-0 animate-hero-fade-up"
          style={{ animationDelay: "540ms" }}
        >
          <Link
            to="/contact"
            onClick={() => trackEvent("hero_cta_click", { cta: "plan_my_trip", destination: "/contact" })}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[11px] uppercase tracking-luxe font-semibold text-[#1a1206] overflow-hidden transition-all duration-500 hover:-translate-y-0.5"
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
            onClick={() => trackEvent("hero_cta_click", { cta: "explore_destinations", destination: "/destinations" })}
            className="group inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-xl text-white text-[11px] uppercase tracking-luxe font-medium shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:border-white/60 transition-all duration-500 hover:-translate-y-0.5"
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
