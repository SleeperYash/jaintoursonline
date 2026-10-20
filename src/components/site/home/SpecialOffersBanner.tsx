import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDeals } from "@/hooks/useDeals";
import { useSpecialOffers } from "@/hooks/useSpecialOffers";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

// Auto-rotating special offers banner — uses natural aspect-ratio zero-crop display
const SpecialOffersBanner = () => {
  const { deals } = useDeals({ activeOnly: true });
  const { offers } = useSpecialOffers();
  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Dedicated offer banners take priority; fall back to active deal images.
  const slides = useMemo(() => {
    if (offers.length > 0) {
      return offers
        .map((offer) => {
          const src = offer.legacy?.url ?? offer.desktop?.url ?? offer.mobile?.url ?? "";
          return {
            id: offer.id,
            src,
            alt: offer.name ? `${offer.name} special offer` : "Jain Tours Special Offer",
          };
        })
        .filter((s) => Boolean(s.src));
    }
    return deals
      .filter((d) => !!d.image_path)
      .map((d) => ({
        id: d.id,
        src: adminPublicUrl(d.image_path as string),
        alt: `${d.destination_name} special offer`,
      }));
  }, [offers, deals]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length, isPaused]);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || slides.length <= 1) return;
    touchStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || touchStartX.current === null || slides.length <= 1) return;

    const distance = event.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;

    setIdx((current) =>
      distance < 0
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length,
    );
  };

  const handlePointerCancel = () => {
    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  return (
    <section className="py-2.5 sm:py-3.5 bg-background overflow-hidden">
      <div className="container px-3 sm:px-6">
        <div
          className="relative w-full max-w-5xl mx-auto touch-pan-y select-none rounded-xl sm:rounded-2xl border border-border/40 bg-card/60 shadow-luxe overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-roledescription="carousel"
          aria-label="Special offers"
        >
          {/* Natural Aspect-Ratio CSS Grid Stack: All images share row 1 / col 1 */}
          <div className="grid grid-cols-1 grid-rows-1 items-center justify-center w-full">
            {slides.map((slide, i) => (
              <img
                key={slide.id}
                src={slide.src}
                alt={slide.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className={`col-start-1 row-start-1 w-full h-auto max-h-[300px] sm:max-h-[360px] md:max-h-[420px] object-contain mx-auto block pointer-events-none transition-opacity duration-700 ease-in-out ${
                  i === idx
                    ? "opacity-100 relative z-10"
                    : "opacity-0 absolute inset-0 pointer-events-none z-0"
                }`}
                aria-hidden={i !== idx}
              />
            ))}
          </div>

          {/* Navigation dots if more than 1 offer */}
          {slides.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center items-center gap-1.5 py-1">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx
                      ? "w-6 bg-gold shadow-sm"
                      : "w-1.5 bg-background/80 hover:bg-background border border-border/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersBanner;
