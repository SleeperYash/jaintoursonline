import { useEffect, useRef, useState } from "react";
import { Star, MapPin, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { clientReviews } from "@/data/clientPhotos";
import { GoogleRatingBadge, VerifiedTag } from "@/components/site/reviews/GoogleBadge";
import { useReveal } from "@/hooks/useReveal";

const AUTO_MS = 6000;

const ReviewsCardStack = () => {
  const ref = useReveal<HTMLDivElement>();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const items = clientReviews;
  const n = items.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  const go = (dir: number) => setI((p) => (p + dir + n) % n);

  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  // Position relative to active for stacked layout
  const posOf = (idx: number) => {
    const d = ((idx - i) % n + n) % n;
    if (d > n / 2) return d - n;
    return d;
  };

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(var(--gold)) 0%, transparent 60%)" }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex justify-center mb-5">
            <GoogleRatingBadge rating={4.9} count={142} />
          </div>
          <p className="text-xs tracking-luxe uppercase text-gold mb-3">Real Travellers · Real Moments</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            Postcards from <span className="italic text-gold">our guests</span>
          </h2>
          <div className="mt-6 h-px w-16 bg-gold mx-auto" />
        </div>

        <div
          ref={ref}
          className="reveal relative h-[560px] md:h-[600px] [perspective:1600px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {items.map((r, idx) => {
            const pos = posOf(idx);
            const abs = Math.abs(pos);
            const visible = abs <= 2;
            const translateX = pos * 58; // % of card width
            const scale = 1 - abs * 0.08;
            const rotateY = pos * -8;
            const z = 40 - abs * 10;
            const opacity = abs > 2 ? 0 : abs === 2 ? 0.35 : abs === 1 ? 0.7 : 1;

            return (
              <article
                key={idx}
                aria-hidden={pos !== 0}
                className="absolute top-0 left-1/2 w-[88%] sm:w-[78%] md:w-[62%] lg:w-[52%] h-full transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{
                  transform: `translate(-50%, 0) translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
                  zIndex: z,
                  opacity,
                  pointerEvents: pos === 0 ? "auto" : "none",
                  visibility: visible ? "visible" : "hidden",
                }}
              >
                <div className="relative h-full rounded-2xl overflow-hidden shadow-luxe border border-gold/20 bg-card group">
                  <img
                    src={r.image}
                    alt={`${r.name} in ${r.destination}`}
                    loading={idx < 3 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, hsl(220 50% 8% / 0.15) 0%, hsl(220 50% 8% / 0.55) 50%, hsl(220 50% 6% / 0.95) 100%)",
                    }}
                  />

                  {/* Top badges */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start gap-3">
                    <div className="flex items-center gap-1.5 bg-background/70 backdrop-blur-md border border-gold/20 rounded-full px-3 py-1.5">
                      <MapPin className="w-3 h-3 text-gold" />
                      <span className="text-[11px] text-foreground tracking-wide">{r.destination}</span>
                    </div>
                    {r.verified && <VerifiedTag />}
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: r.rating }).map((_, k) => (
                        <Star key={k} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <blockquote className="font-serif text-lg md:text-xl lg:text-2xl text-foreground leading-snug italic">
                      "{r.text}"
                    </blockquote>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold text-xs font-medium">
                          {r.initials}
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">{r.name}</p>
                          <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                            Google · {r.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Controls */}
          <button
            onClick={() => go(-1)}
            aria-label="Previous review"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full glass-panel flex items-center justify-center text-gold hover:bg-gold hover:text-primary-foreground transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next review"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full glass-panel flex items-center justify-center text-gold hover:bg-gold hover:text-primary-foreground transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots + pause */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <div className="flex gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-8 bg-gold" : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCardStack;
