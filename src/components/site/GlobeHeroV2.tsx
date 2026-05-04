import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Globe3D, { type Globe3DHandle } from "./globe/Globe3D";
import GlobeControls from "./globe/GlobeControls";
import DestinationPanel from "./globe/DestinationPanel";
import { globeDestinations, formatCoord } from "@/data/globeDestinations";

const GlobeHeroV2 = () => {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const globeRef = useRef<Globe3DHandle>(null);

  const active = activeSlug
    ? globeDestinations.find((d) => d.slug === activeSlug) ?? null
    : null;

  const handleSelect = (slug: string) => {
    setActiveSlug(slug);
    setPanelOpen(true);
    globeRef.current?.flyToSlug(slug);
  };

  const handleRandom = () => {
    if (globeDestinations.length < 2) return;
    let next = activeSlug;
    while (next === activeSlug) {
      next = globeDestinations[Math.floor(Math.random() * globeDestinations.length)].slug;
    }
    handleSelect(next!);
  };

  // Keyboard ←/→ cycles destinations
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag && /INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const idx = activeSlug
        ? globeDestinations.findIndex((d) => d.slug === activeSlug)
        : -1;
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const nextIdx = ((idx + delta) + globeDestinations.length) % globeDestinations.length;
      handleSelect(globeDestinations[nextIdx].slug);
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlug]);

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-background">
      {/* Starfield background fallback (Three.js stars also active inside canvas) */}
      <div aria-hidden className="absolute inset-0 bg-starfield opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--background) / 0) 40%, hsl(var(--background) / 0.7) 100%)",
        }}
      />

      {/* Heading (top-left) */}
      <div className="absolute top-24 left-4 md:left-8 z-20 max-w-md">
        <p className="text-[10px] md:text-xs tracking-luxe uppercase text-gold mb-2">
          Choose Your Journey
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-[1.05]">
          Spin the world.<br />Pick your story.
        </h1>
      </div>

      {/* The 3D globe (full-screen) */}
      <div className="absolute inset-0">
        <Globe3D ref={globeRef} activeSlug={activeSlug} onSelect={handleSelect} />
      </div>

      {/* Floating UI overlays */}
      <GlobeControls
        onSelect={handleSelect}
        onRandom={handleRandom}
        activeSlug={activeSlug}
      />

      {/* Coordinate readout (bottom-center) */}
      {active && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="glass-panel px-4 py-2 font-mono text-[10px] tracking-widest text-gold/90 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {formatCoord(active.lat, active.lng)} — {active.name.toUpperCase()}
          </div>
        </div>
      )}

      {/* Scroll cue (bottom-right) */}
      <div className="absolute bottom-6 right-4 md:right-8 z-20 hidden md:flex flex-col items-center gap-2 text-foreground/50 pointer-events-none">
        <span className="text-[10px] tracking-luxe uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce-slow text-gold" />
      </div>

      {/* Destination panel */}
      <DestinationPanel
        destination={active}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </section>
  );
};

export default GlobeHeroV2;
