import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import { useReveal } from "@/hooks/useReveal";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80",
];

const ReviewsSlider = () => {
  const ref = useReveal<HTMLDivElement>();
  const [idx, setIdx] = useState(0);
  const items = reviews.slice(0, 6);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5500);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <section className="py-24 md:py-32 bg-card border-y border-border/60 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 50%, hsl(var(--gold)) 0%, transparent 50%)" }}
      />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs tracking-luxe uppercase text-gold mb-4">Loved by Travellers</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            Stories from the <span className="italic text-gold">Road</span>
          </h2>
          <div className="mt-6 h-px w-16 bg-gold mx-auto" />
        </div>

        <div ref={ref} className="reveal max-w-4xl mx-auto">
          <div className="relative bg-background/60 backdrop-blur-sm border border-border/60 rounded-2xl p-10 md:p-14 min-h-[340px]">
            <Quote className="absolute top-8 left-8 w-12 h-12 text-gold/15" />
            {items.map((r, i) => (
              <article
                key={r.name + i}
                className="absolute inset-0 p-10 md:p-14 flex flex-col justify-center transition-opacity duration-700"
                style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? "auto" : "none" }}
              >
                <div className="flex items-center gap-1.5 mb-5">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-rating-star text-rating-star" />
                  ))}
                </div>
                <p className="font-serif text-xl md:text-2xl text-foreground/95 leading-relaxed italic">
                  "{r.text}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={AVATARS[i % AVATARS.length]}
                    alt={r.name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border border-gold/40"
                  />
                  <div>
                    <p className="text-sm text-foreground font-medium text-slate-300">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.date} · Google</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Review ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-10 bg-gold" : "w-2 bg-border hover:bg-gold/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSlider;
