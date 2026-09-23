import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDeals } from "@/hooks/useDeals";
import { useSpecialOffers } from "@/hooks/useSpecialOffers";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

// Auto-rotating special offers banner — uses the same Deals data/images as the admin panel.
const SpecialOffersBanner = () => {
  const { deals } = useDeals({ activeOnly: true });
  const { offers } = useSpecialOffers();
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Dedicated offer banners take priority; fall back to active deal images.
  const slides = useMemo(() => {
    if (offers.length > 0) return offers.map((o) => ({ id: o.path, src: o.url, alt: "Special offer" }));
    return deals
      .filter((d) => !!d.image_path)
      .map((d) => ({
        id: d.id,
        src: adminPublicUrl(d.image_path as string),
        alt: `${d.destination_name} special offer`,
      }));
  }, [offers, deals]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

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
    <section className="py-0 bg-background overflow-hidden">
      <div className="container px-3 sm:px-6">
        <div
          className="relative w-full touch-pan-y select-none overflow-hidden rounded-xl md:rounded-[20px] border border-border/40 shadow-luxe aspect-[16/8] sm:aspect-[21/7] md:aspect-[64/15]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-roledescription="carousel"
          aria-label="Special offers"
        >
          {slides.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              loading="lazy"
              className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center md:object-center transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === idx ? 1 : 0 }}
              aria-hidden={i !== idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersBanner;
