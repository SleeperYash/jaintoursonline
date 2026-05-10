import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { GlobeDestination } from "@/data/globeDestinations";

interface Props {
  items: GlobeDestination[];
  activeIndex: number;
  onPinClick: (i: number) => void;
}

// Equirectangular projection on a 2D circle (front-hemisphere visible)
// We rotate the sphere by targetLng, so the active pin sits centered.
const GlobeSphere = ({ items, activeIndex, onPinClick }: Props) => {
  const targetLng = items[activeIndex]?.lng ?? 0;
  // Rotate so target longitude lands at front (0deg); standard equirect: front = -lng
  const rotation = -targetLng;

  // World map texture (public-domain equirectangular, blue marble style — recolored via filter)
  const mapUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg";

  const pins = useMemo(() => {
    return items.map((d, i) => {
      // Visibility: pin is "front" when its lng is near targetLng (within ±90°)
      const delta = ((d.lng - targetLng + 540) % 360) - 180; // -180..180
      const visible = Math.abs(delta) < 90;
      // Project onto circle: x = sin(delta) * cos(lat), y = -sin(lat)
      const dRad = (delta * Math.PI) / 180;
      const lRad = (d.lat * Math.PI) / 180;
      const x = Math.sin(dRad) * Math.cos(lRad);
      const y = -Math.sin(lRad);
      // Scale to ~46% radius so pins sit on the surface visually
      const left = 50 + x * 46;
      const top = 50 + y * 46;
      const z = Math.cos(dRad) * Math.cos(lRad); // 0..1 closer to viewer
      return { d, i, left, top, visible, z };
    });
  }, [items, targetLng]);

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto select-none">
      {/* Outer halo */}
      <div
        aria-hidden
        className="absolute inset-[-12%] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.35), transparent 65%)" }}
      />
      {/* Inner ring */}
      <div aria-hidden className="absolute inset-[-3%] rounded-full border border-gold/25" />
      <div aria-hidden className="absolute inset-[-7%] rounded-full border border-gold/10" />

      {/* The sphere */}
      <div className="relative w-full h-full rounded-full overflow-hidden shadow-luxe globe-sphere">
        {/* Map texture rotates */}
        <div
          className="absolute inset-0 globe-texture"
          style={{
            backgroundImage: `url(${mapUrl})`,
            backgroundSize: "200% 100%",
            backgroundPosition: `${((rotation + 360) % 360) / 360 * 100}% center`,
            filter: "sepia(0.6) hue-rotate(180deg) saturate(1.4) brightness(0.55) contrast(1.1)",
            transition: "background-position 1200ms cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
        {/* Navy tint overlay */}
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: "radial-gradient(circle at 35% 35%, hsl(220 60% 25% / 0.4), hsl(220 70% 6% / 0.85))" }}
        />
        {/* Specular highlight */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 30% 28%, hsl(45 80% 80% / 0.25), transparent 45%)" }}
        />
        {/* Limb shadow for sphericity */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{ boxShadow: "inset -30px -40px 80px hsl(220 70% 4% / 0.85), inset 30px 30px 60px hsl(45 80% 60% / 0.08)" }}
        />
        {/* Grid lines (latitude) */}
        <svg aria-hidden className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <defs>
            <pattern id="lat" width="100%" height="12.5%" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100%" y2="0" stroke="hsl(var(--gold))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lat)" />
        </svg>

        {/* Pins */}
        {pins.map(({ d, i, left, top, visible, z }) => {
          const isActive = i === activeIndex;
          if (!visible && !isActive) return null;
          const opacity = isActive ? 1 : Math.max(0.25, z);
          return (
            <button
              key={d.slug}
              onClick={() => onPinClick(i)}
              aria-label={`Select ${d.name}`}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 group",
                "transition-all duration-700 ease-out"
              )}
              style={{ left: `${left}%`, top: `${top}%`, opacity, zIndex: Math.round(z * 100) }}
            >
              <span className="relative block">
                <span
                  className={cn(
                    "block rounded-full bg-gold",
                    isActive ? "w-3 h-3 shadow-gold" : "w-1.5 h-1.5"
                  )}
                />
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-gold animate-ping-gold" />
                )}
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-0.5",
                    "text-[10px] uppercase tracking-luxe whitespace-nowrap",
                    "bg-card/90 border border-gold/40 text-gold rounded",
                    "transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {d.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GlobeSphere;
