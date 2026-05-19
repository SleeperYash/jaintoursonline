import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import SectionTitle from "./SectionTitle";

const TestimonialCarousel = () => {
  const items = reviews.slice(0, 6);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <section className="container py-24 md:py-32">
      <SectionTitle
        eyebrow="In Their Words"
        title="A name 142 families return to."
      />

      <div className="relative mt-16 max-w-4xl mx-auto min-h-[340px] md:min-h-[300px]">
        <Quote
          aria-hidden
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 text-gold/20"
          strokeWidth={1}
        />
        {items.map((r, idx) => (
          <figure
            key={r.name}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out flex flex-col items-center text-center px-4 ${
              idx === i ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={idx !== i}
          >
            <div className="flex gap-1 text-rating-star mb-6">
              {Array.from({ length: r.rating }).map((_, k) => (
                <Star key={k} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground/90 leading-relaxed italic max-w-3xl">
              "{r.text}"
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-gold text-xs tracking-wide">
                {r.initials}
              </div>
              <div className="text-left">
                <p className="text-sm text-foreground">{r.name}</p>
                <p className="text-[11px] text-muted-foreground tracking-wide">{r.source} · {r.date}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-10">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Show review ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === i ? "w-8 bg-gold" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialCarousel;
