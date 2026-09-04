import { useEffect, useMemo, useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

// Auto-rotating special offers banner — uses the same Deals data/images as the admin panel.
const SpecialOffersBanner = () => {
  const { deals } = useDeals({ activeOnly: true });
  const [idx, setIdx] = useState(0);

  const slides = useMemo(
    () => deals.filter((d) => !!d.image_path),
    [deals],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  if (slides.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-background overflow-hidden">
      <div className="container">
        <div className="relative w-full overflow-hidden rounded-2xl md:rounded-[20px] border border-border/40 shadow-luxe aspect-[16/7] sm:aspect-[21/7] md:aspect-[64/15]">
          {slides.map((deal, i) => (
            <img
              key={deal.id}
              src={adminPublicUrl(deal.image_path as string)}
              alt={`${deal.destination_name} special offer`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: i === idx ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersBanner;
