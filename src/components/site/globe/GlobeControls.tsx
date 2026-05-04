import { useEffect, useRef, useState } from "react";
import { Search, Shuffle, Globe2 } from "lucide-react";
import { globeDestinations } from "@/data/globeDestinations";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (slug: string) => void;
  onRandom: () => void;
  activeSlug: string | null;
}

const GlobeControls = ({ onSelect, onRandom, activeSlug }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showHint, setShowHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss hint after 6s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = globeDestinations.filter((d) =>
    d.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      {/* Hint pill (top-center, dismissible) */}
      {showHint && (
        <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-fade-in-slow">
          <div className="glass-panel px-4 py-2 text-[10px] tracking-luxe uppercase text-foreground/80 flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-gold" />
            Drag to rotate · scroll to zoom · click pins
          </div>
        </div>
      )}

      {/* Search (top-right) */}
      <div ref={containerRef} className="absolute top-24 right-4 md:right-8 z-20 w-64 max-w-[80vw]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="glass-panel w-full flex items-center gap-3 px-4 py-3 text-left text-xs uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-gold" />
          {activeSlug
            ? globeDestinations.find((d) => d.slug === activeSlug)?.name ?? "Find a destination"
            : "Find a destination"}
        </button>

        {open && (
          <div className="glass-panel mt-2 max-h-[60vh] overflow-y-auto">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a place…"
              className="w-full bg-transparent border-0 border-b border-border/60 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-gold"
            />
            <ul className="py-1">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-foreground/50">No matches.</li>
              )}
              {filtered.map((d) => (
                <li key={d.slug}>
                  <button
                    onClick={() => {
                      onSelect(d.slug);
                      setOpen(false);
                      setQ("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors",
                      d.slug === activeSlug ? "text-gold" : "text-foreground/80"
                    )}
                  >
                    <span>{d.name}</span>
                    <span className="text-[10px] tracking-luxe uppercase text-foreground/40">
                      {d.region}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fly random (bottom-left) */}
      <div className="absolute bottom-6 left-4 md:left-8 z-20">
        <button
          onClick={onRandom}
          className="glass-panel inline-flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-luxe text-foreground/80 hover:text-gold transition-colors"
        >
          <Shuffle className="w-4 h-4 text-gold" />
          Fly random
        </button>
      </div>
    </>
  );
};

export default GlobeControls;
