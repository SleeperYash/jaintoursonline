import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, Shuffle, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GlobeSphere from "./GlobeSphere";
import { globeDestinations, formatCoord } from "@/data/globeDestinations";
import { useGlobeRotation } from "@/hooks/useGlobeRotation";
import { cn } from "@/lib/utils";

const GlobeHero = () => {
  const { index, active, select, next, prev, surprise } = useGlobeRotation(globeDestinations);
  const stripRef = useRef<HTMLDivElement>(null);
  const [bgKey, setBgKey] = useState(0);

  // Cross-fade two background layers
  useEffect(() => { setBgKey((k) => k + 1); }, [index]);

  // Auto-scroll the name strip to the active pill
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Dynamic destination background (cross-fade) */}
      <div className="absolute inset-0">
        <div
          key={bgKey}
          className="absolute inset-0 animate-fade-in-slow"
          style={{
            backgroundImage: `url(${active?.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.28,
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, hsl(var(--background) / 0.6), hsl(var(--background) / 0.95))" }} />
        <div aria-hidden className="absolute inset-0 bg-starfield opacity-60" />
      </div>

      {/* Drifting gold orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -left-32 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full opacity-25 blur-3xl animate-orb-drift"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.6), transparent 60%)" }}
      />

      <div className="relative z-10 container pt-28 md:pt-32 pb-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <p className="text-xs md:text-sm tracking-luxe uppercase text-gold mb-4">
            Choose Your Journey
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05]">
            Spin the world. Pick your story.
          </h1>
          <p className="mt-5 text-sm md:text-base text-foreground/70 font-light max-w-xl mx-auto">
            Rotate the globe, tap a pin, or use the strip below. Every destination is a curated, bespoke escape.
          </p>
        </div>

        {/* Globe + arrows */}
        <div className="mt-12 md:mt-14 grid grid-cols-[auto,1fr,auto] items-center gap-3 md:gap-8 max-w-5xl mx-auto">
          <button
            onClick={prev}
            aria-label="Previous destination"
            className="group flex flex-col items-center gap-2 text-foreground/60 hover:text-gold transition-colors"
          >
            <span className="w-10 h-10 md:w-12 md:h-12 border border-foreground/30 group-hover:border-gold flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </span>
            <span className="hidden md:block text-[10px] tracking-luxe uppercase max-w-[90px] truncate">
              {globeDestinations[(index - 1 + globeDestinations.length) % globeDestinations.length].name}
            </span>
          </button>

          <GlobeSphere items={globeDestinations} activeIndex={index} onPinClick={select} />

          <button
            onClick={next}
            aria-label="Next destination"
            className="group flex flex-col items-center gap-2 text-foreground/60 hover:text-gold transition-colors"
          >
            <span className="w-10 h-10 md:w-12 md:h-12 border border-foreground/30 group-hover:border-gold flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5" />
            </span>
            <span className="hidden md:block text-[10px] tracking-luxe uppercase max-w-[90px] truncate">
              {globeDestinations[(index + 1) % globeDestinations.length].name}
            </span>
          </button>
        </div>

        {/* Coordinate readout */}
        <div className="mt-8 text-center font-mono text-[11px] tracking-widest text-gold/80">
          <span className="inline-flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {active && `${formatCoord(active.lat, active.lng)} — ${active.name.toUpperCase()}`}
          </span>
        </div>

        {/* Info card */}
        <div key={`info-${index}`} className="mt-6 max-w-2xl mx-auto animate-fade-in">
          <div className="border border-gold/30 bg-card/70 backdrop-blur-md p-6 md:p-8 shadow-luxe">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mb-1">Destination</p>
                <p className="font-serif text-xl md:text-2xl text-foreground">{active?.name}</p>
              </div>
              <div className="border-x border-border/60">
                <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mb-1">Duration</p>
                <p className="font-serif text-xl md:text-2xl text-gold">{active?.duration}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-foreground/50 mb-1">Region</p>
                <p className="font-serif text-xl md:text-2xl text-foreground">{active?.region}</p>
              </div>
            </div>
            <p className="mt-5 text-center text-foreground/70 italic font-serif text-base md:text-lg">
              "{active?.tagline}"
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/destinations/${active?.slug}`}
                className="inline-flex items-center gap-2 px-7 py-3 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition shadow-gold"
              >
                Discover {active?.name} <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                onClick={surprise}
                className="inline-flex items-center gap-2 px-7 py-3 border border-foreground/30 text-foreground/80 text-xs uppercase tracking-luxe hover:border-gold hover:text-gold transition"
              >
                <Shuffle className="w-4 h-4" /> Surprise me
              </button>
            </div>
          </div>
        </div>

        {/* Name strip */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {globeDestinations.map((d, i) => (
              <button
                key={d.slug}
                data-idx={i}
                onClick={() => select(i)}
                className={cn(
                  "snap-center shrink-0 px-4 md:px-5 py-2 text-[11px] md:text-xs uppercase tracking-luxe transition-all duration-500 border",
                  i === index
                    ? "bg-gold text-primary-foreground border-gold shadow-gold scale-105"
                    : "border-foreground/20 text-foreground/60 hover:border-gold hover:text-gold"
                )}
              >
                {d.name}
              </button>
            ))}
          </div>
          {/* Progress underline */}
          <div className="mt-2 h-px bg-border/60 relative">
            <div
              className="absolute top-0 left-0 h-px bg-gold transition-all duration-700 ease-out"
              style={{ width: `${((index + 1) / globeDestinations.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-12 flex flex-col items-center gap-2 text-foreground/50">
          <span className="text-[10px] tracking-luxe uppercase text-slate-950">Scroll to wander</span>
          <ChevronDown className="w-4 h-4 animate-bounce-slow text-gold" />
        </div>
      </div>
    </section>
  );
};

export default GlobeHero;
