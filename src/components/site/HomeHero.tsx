import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Phone, ChevronDown } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

import maldives from "@/assets/hero-maldives.jpg";
import srilanka from "@/assets/hero-srilanka.jpg";
import kerala from "@/assets/hero-kerala.jpg";
import europe from "@/assets/hero-europe.jpg";

const slides = [
  { img: maldives, eyebrow: "Maldives", title: "Where the ocean cradles silence." },
  { img: srilanka, eyebrow: "Sri Lanka", title: "Ancient stones. Endless skies." },
  { img: kerala,   eyebrow: "Kerala",    title: "A backwater lullaby at dusk." },
  { img: europe,   eyebrow: "Europe",    title: "Alpine evenings, gilded in gold." },
];

const HomeHero = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setI((p) => (p + n + slides.length) % slides.length);

  const headlineWords = BRAND.tagline.split(" ");

  return (
    <section className="relative h-[88vh] min-h-[620px] w-full overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={s.img}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
            idx === i ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={idx !== i}
        >
          <img
            src={s.img}
            alt={`${s.eyebrow} — luxury travel by Jain Tours`}
            className={cn(
              "w-full h-full object-cover",
              idx === i && "animate-ken-burns"
            )}
            width={1920}
            height={1080}
            loading={idx === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>
      ))}

      {/* Soft gold orb glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 w-[60vw] h-[60vw] max-w-[720px] max-h-[720px] rounded-full opacity-30 blur-3xl animate-orb-drift"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.55), transparent 60%)" }}
      />

      {/* Grain overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-grain" />

      <div className="relative z-10 h-full container flex flex-col justify-end pb-28 md:pb-32">
        <div key={i} className="max-w-3xl">
          <p className="text-xs md:text-sm tracking-luxe uppercase text-gold mb-5 animate-fade-in-slow">
            {slides[i].eyebrow} · Curated by Jain Tours
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.05]">
            {headlineWords.map((w, idx) => (
              <span
                key={`${i}-${idx}`}
                className="inline-block opacity-0 animate-word-rise mr-[0.25em]"
                style={{ animationDelay: `${idx * 140}ms` }}
              >
                {w}
              </span>
            ))}
          </h1>
          <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-xl font-light leading-relaxed animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "backwards" }}>
            {slides[i].title} Bespoke holidays designed since 2008 from Mumbai —
            with a 4.9★ standard, and a name 142+ families return to.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "800ms", animationFillMode: "backwards" }}>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition shadow-gold"
            >
              Plan Your Journey
            </Link>
            <a
              href={`tel:${BRAND.phoneDigits}`}
              className="inline-flex items-center gap-2 px-8 py-4 border border-foreground/30 text-foreground text-xs uppercase tracking-luxe hover:border-gold hover:text-gold transition"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-3">
        <button onClick={() => go(-1)} className="w-11 h-11 border border-foreground/30 text-foreground/80 flex items-center justify-center hover:border-gold hover:text-gold transition" aria-label="Previous slide">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs tracking-luxe text-foreground/60 w-14 text-center">
          {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <button onClick={() => go(1)} className="w-11 h-11 border border-foreground/30 text-foreground/80 flex items-center justify-center hover:border-gold hover:text-gold transition" aria-label="Next slide">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={cn("h-px transition-all duration-500", idx === i ? "w-12 bg-gold" : "w-6 bg-foreground/30")}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-foreground/60">
        <span className="text-[10px] tracking-luxe uppercase">Scroll to wander</span>
        <ChevronDown className="w-4 h-4 animate-bounce-slow text-gold" />
      </div>
    </section>
  );
};

export default HomeHero;
