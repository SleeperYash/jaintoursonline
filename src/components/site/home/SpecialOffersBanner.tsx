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
    if (offers.length > 0) return offers.map((offer) => ({
      id: offer.id,
      desktopSrc: offer.desktop?.url ?? offer.legacy?.url ?? offer.mobile?.url ?? "",
      mobileSrc: offer.mobile?.url ?? offer.legacy?.url ?? offer.desktop?.url ?? "",
      alt: "Special offer",
    }));
    return deals
      .filter((d) => !!d.image_path)
      .map((d) => ({
        id: d.id,
        desktopSrc: adminPublicUrl(d.image_path as string),
        mobileSrc: adminPublicUrl(d.image_path as string),
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
          className="relative w-full touch-pan-y select-none overflow-hidden rounded-xl md:grid md:rounded-[20px] md:w-fit md:max-w-full md:mx-auto md:justify-items-center border border-border/40 shadow-luxe aspect-[16/8] sm:aspect-[21/7] md:aspect-auto"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-roledescription="carousel"
          aria-label="Special offers"
        >
          {slides.map((slide, i) => (
            <picture
              key={slide.id}
              className="contents"
            >
              <source media="(min-width: 768px)" srcSet={slide.desktopSrc} />
              <img
                src={slide.mobileSrc}
                alt={slide.alt}
                loading="lazy"
                className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out md:relative md:inset-auto md:col-start-1 md:row-start-1 md:w-auto md:h-auto md:max-w-full md:max-h-[280px] md:object-contain"
                style={{ opacity: i === idx ? 1 : 0 }}
                aria-hidden={i !== idx}
              />
            </picture>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersBanner;
