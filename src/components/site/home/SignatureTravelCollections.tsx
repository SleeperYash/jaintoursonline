import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Hotel, Coffee, Camera, Bus } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { useStampPhotos, STAMP_SLOTS } from "@/hooks/useStampPhotos";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

// Scattered polaroid tilt — gives the grid an editorial scrapbook feel
const TILTS = [-3, 2, -1.5, 2.5, 1.5, -2.5, 3, -2];

const SignatureTravelCollections = () => {
  const { deals } = useDeals({ activeOnly: true });
  const { photos } = useStampPhotos();
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

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

  const handleStampClick = (slug: string) => {
    navigate(`/destinations/${slug}`);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 content-start">
            {STAMP_SLOTS.map((slot, i) => {
              const img = photos[slot.key] ?? null;
              const tilt = TILTS[i % TILTS.length];
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => handleStampClick(slot.slug)}
                  className="group relative block transition-all duration-500 ease-out hover:!rotate-0 hover:-translate-y-1.5 hover:scale-[1.04]"
                  style={{
                    aspectRatio: "160 / 210",
                    padding: "10px 10px 34px",
                    borderRadius: "2px",
                    background: "linear-gradient(180deg, #FBF9F2 0%, #F2EEE3 100%)",
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.6) inset, 0 14px 28px -12px rgba(10,10,30,0.55), 0 4px 10px -4px rgba(10,10,30,0.35)",
                    transform: `rotate(${tilt}deg)`,
                  }}
                >
                  {/* tape strip */}
                  <span
                    aria-hidden
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 opacity-70 group-hover:opacity-90 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(212,178,90,0.55), rgba(212,178,90,0.25))",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                    }}
                  />
                  <div className="relative w-full h-full overflow-hidden rounded-[1px]">
                    {img ? (
                      <img
                        src={img}
                        alt={slot.label}
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-stone-500 font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,41,107,0.06), rgba(212,178,90,0.18))",
                        }}
                      >
                        Upload Photo
                      </div>
                    )}
                    {/* subtle film vignette */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
                      }}
                    />
                  </div>
                  {/* Polaroid caption */}
                  <p
                    className="absolute left-0 right-0 bottom-2 text-center text-stone-700"
                    style={{
                      fontFamily: "'Caveat', 'Segoe Script', cursive",
                      fontSize: "15px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {slot.label.toLowerCase()}
                  </p>
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