import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Hotel, Coffee, Camera, Bus } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { useStampPhotos, STAMP_SLOTS } from "@/hooks/useStampPhotos";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

const STAMP_PERFORATION = {
  background:
    "radial-gradient(circle at 50% 0, transparent 6px, #FAFAF5 6px) top, radial-gradient(circle at 50% 100%, transparent 6px, #FAFAF5 6px) bottom, radial-gradient(circle at 0 50%, transparent 6px, #FAFAF5 6px) left, radial-gradient(circle at 100% 50%, transparent 6px, #FAFAF5 6px) right",
  backgroundSize: "14px 8px, 14px 8px, 8px 14px, 8px 14px",
  backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
  backgroundColor: "#FAFAF5",
} as const;

const SignatureTravelCollections = () => {
  const { deals } = useDeals({ activeOnly: true });
  const { photos } = useStampPhotos();
  const [idx, setIdx] = useState(0);

  const slides = useMemo(() => deals, [deals]);

  // Auto-rotate every 3s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length]);

  // Keep idx in range when deals change
  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const current = slides[idx];
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx((i) => (i + 1) % slides.length);

  const handleStampClick = (label: string) => {
    const i = slides.findIndex(
      (d) => d.destination_name.toLowerCase() === label.toLowerCase(),
    );
    if (i >= 0) setIdx(i);
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <h2 className="text-center font-serif text-2xl md:text-4xl text-foreground tracking-wide uppercase mb-10 md:mb-14">
          Signature Travel Collections:{" "}
          <span className="text-gold">India &amp; World</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-6 md:gap-8 items-stretch">
          {/* LEFT — Deal slideshow */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[460px] rounded-[20px] overflow-hidden bg-card border border-border/40 shadow-luxe">
            {slides.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No deals added yet — go to Admin Panel to add deals
                </p>
              </div>
            ) : (
              slides.map((deal, i) => {
                const visible = i === idx;
                const bg = deal.image_path ? adminPublicUrl(deal.image_path) : null;
                return (
                  <div
                    key={deal.id}
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
                  >
                    {bg ? (
                      <img
                        src={bg}
                        alt={deal.destination_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-muted to-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                    {/* Red pill badge */}
                    <span
                      className="absolute top-4 left-4 text-white font-medium"
                      style={{
                        background: "#E53935",
                        borderRadius: "20px",
                        padding: "5px 13px",
                        fontSize: "12px",
                      }}
                    >
                      Summer Vacation Deals
                    </span>

                    {/* Name + duration */}
                    <div className="absolute top-16 left-5 right-5 text-white">
                      <h3
                        className="uppercase"
                        style={{
                          fontSize: "34px",
                          fontWeight: 800,
                          lineHeight: 1.05,
                          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        }}
                      >
                        {deal.destination_name}
                      </h3>
                      <p
                        className="mt-1"
                        style={{
                          fontSize: "15px",
                          fontWeight: 400,
                          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {deal.duration}
                      </p>
                    </div>

                    {/* Price badge */}
                    <div
                      className="absolute"
                      style={{
                        right: "16px",
                        bottom: "76px",
                        background: "#76FF03",
                        borderRadius: "10px",
                        padding: "10px 16px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "22px",
                          fontWeight: 900,
                          color: "#1a1a1a",
                          lineHeight: 1,
                        }}
                      >
                        ₹{Number(deal.price).toLocaleString("en-IN")}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.5px",
                          color: "#1a1a1a",
                          marginTop: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {deal.price_label}
                      </p>
                    </div>

                    {/* Inclusion strip */}
                    <div
                      className="absolute inset-x-0 bottom-0 flex items-center justify-around px-4 py-3"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      {deal.inc_hotel && (
                        <div className="flex flex-col items-center text-white" style={{ fontSize: "10px" }}>
                          <Hotel className="w-4 h-4 mb-1" />
                          <span>Hotel</span>
                        </div>
                      )}
                      {deal.inc_breakfast && (
                        <div className="flex flex-col items-center text-white" style={{ fontSize: "10px" }}>
                          <Coffee className="w-4 h-4 mb-1" />
                          <span>Breakfast</span>
                        </div>
                      )}
                      {deal.inc_sightseeing && (
                        <div className="flex flex-col items-center text-white" style={{ fontSize: "10px" }}>
                          <Camera className="w-4 h-4 mb-1" />
                          <span>Sightseeing</span>
                        </div>
                      )}
                      {deal.inc_transport && (
                        <div className="flex flex-col items-center text-white" style={{ fontSize: "10px" }}>
                          <Bus className="w-4 h-4 mb-1" />
                          <span>Transport</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous deal"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/50 transition"
                  style={{ background: "rgba(255,255,255,0.35)" }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next deal"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/50 transition"
                  style={{ background: "rgba(255,255,255,0.35)" }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* RIGHT — 4×2 stamp grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 content-start">
            {STAMP_SLOTS.map((slot) => {
              const img = photos[slot.key] ?? null;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => handleStampClick(slot.label)}
                  className="group relative block transition-all duration-[250ms] hover:scale-[1.06] hover:rotate-1"
                  style={{
                    aspectRatio: "160 / 200",
                    padding: "8px",
                    borderRadius: "4px",
                    boxShadow: "2px 4px 12px rgba(0,0,0,0.15)",
                    ...STAMP_PERFORATION,
                  }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{
                      border: `4px solid ${slot.borderColor}`,
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest"
                        style={{
                          background: `linear-gradient(135deg, ${slot.borderColor}22, ${slot.borderColor}55)`,
                          color: slot.borderColor,
                          fontWeight: 700,
                        }}
                      >
                        Upload Photo
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0"
                      style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                        height: "45%",
                      }}
                    />
                    <p
                      className="absolute inset-x-0 bottom-1.5 text-center text-white"
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                      }}
                    >
                      {slot.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignatureTravelCollections;