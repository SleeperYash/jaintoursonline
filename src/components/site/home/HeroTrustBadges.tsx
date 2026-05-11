import { useEffect, useState } from "react";
import { Award, Users, FileCheck, Headphones, ShieldCheck, Briefcase, Sparkles, Feather } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Award, value: "30+", label: "Years Experience" },
  { icon: Users, value: "10,000+", label: "Happy Travelers" },
  { icon: FileCheck, value: "Visa", label: "Assistance" },
  { icon: Headphones, value: "24/7", label: "Support" },
  { icon: ShieldCheck, value: "Travel", label: "Insurance" },
  { icon: Briefcase, value: "MICE", label: "Tourism" },
];

type BadgeTheme = "gold" | "ivory";
const STORAGE_KEY = "trust-badges-theme";

const themeClasses: Record<BadgeTheme, {
  card: string;
  iconWrap: string;
  icon: string;
  value: string;
  label: string;
  dot: string;
}> = {
  gold: {
    card: "bg-card/80 backdrop-blur-md border-gold/25 shadow-luxe",
    iconWrap: "bg-gold/10 border-gold/30",
    icon: "text-gold",
    value: "text-foreground",
    label: "text-muted-foreground",
    dot: "bg-gold/60",
  },
  ivory: {
    card: "bg-foreground/[0.96] backdrop-blur-md border-gold/40 shadow-gold",
    iconWrap: "bg-gold/15 border-gold/40",
    icon: "text-gold-deep",
    value: "text-background",
    label: "text-background/65",
    dot: "bg-gold-deep/70",
  },
};

const Row = ({ theme }: { theme: BadgeTheme }) => {
  const t = themeClasses[theme];
  return (
    <>
      {badges.map(({ icon: Icon, value, label }, idx) => (
        <div
          key={`${label}-${idx}`}
          className={cn(
            "group relative flex items-center gap-4 px-6 md:px-7 py-5 mx-2 md:mx-3 rounded-xl border shrink-0 min-w-[15rem] md:min-w-0 transition-colors duration-500",
            t.card
          )}
        >
          <div className={cn("shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border", t.iconWrap)}>
            <Icon className={cn("w-5 h-5", t.icon)} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className={cn("font-serif text-xl md:text-2xl leading-none whitespace-nowrap", t.value)}>{value}</p>
            <p className={cn("mt-1.5 text-[11px] md:text-xs uppercase tracking-luxe whitespace-nowrap", t.label)}>{label}</p>
          </div>
          <span className={cn("absolute top-2 right-2 w-1 h-1 rounded-full", t.dot)} />
        </div>
      ))}
    </>
  );
};

const HeroTrustBadges = () => {
  const [theme, setTheme] = useState<BadgeTheme>("gold");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as BadgeTheme | null;
    if (saved === "gold" || saved === "ivory") setTheme(saved);
  }, []);

  const change = (next: BadgeTheme) => {
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
  };

  return (
    <section className="container -mt-8 md:-mt-12 relative z-20 overflow-hidden">
      {/* Theme toggle */}
      <div className="flex justify-center md:justify-end mb-3 md:mb-4">
        <div
          role="tablist"
          aria-label="Badge style"
          className="inline-flex items-center gap-1 p-1 rounded-full border border-gold/30 bg-card/70 backdrop-blur-md"
        >
          <button
            role="tab"
            aria-selected={theme === "gold"}
            onClick={() => change("gold")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-luxe transition-all",
              theme === "gold"
                ? "bg-gradient-to-r from-gold to-gold-deep text-primary-foreground shadow-gold"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Gold Luxe
          </button>
          <button
            role="tab"
            aria-selected={theme === "ivory"}
            onClick={() => change("ivory")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-luxe transition-all",
              theme === "ivory"
                ? "bg-foreground text-background shadow-luxe"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Feather className="w-3 h-3" />
            Ivory Luxe
          </button>
        </div>
      </div>

      {/* Mobile: slower marquee, larger min-width so ~1.5 badges fit per view */}
      <div className="md:hidden flex animate-marquee-x pause-on-hover" style={{ animationDuration: "32s" }}>
        <div className="flex shrink-0"><Row theme={theme} /></div>
        <div className="flex shrink-0" aria-hidden><Row theme={theme} /></div>
      </div>
      {/* Desktop: standard marquee speed */}
      <div className="hidden md:flex animate-marquee-x pause-on-hover">
        <div className="flex shrink-0"><Row theme={theme} /></div>
        <div className="flex shrink-0" aria-hidden><Row theme={theme} /></div>
      </div>
    </section>
  );
};

export default HeroTrustBadges;
