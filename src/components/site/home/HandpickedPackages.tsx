import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe, MapPin, Plane } from "lucide-react";
import {
  domesticDestinations,
  internationalDestinations,
  destinations,
} from "@/data/destinations";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { useReveal } from "@/hooks/useReveal";

type Tab = "all" | "domestic" | "international";

const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
  { key: "all", label: "All", icon: Globe },
  { key: "domestic", label: "Domestic", icon: MapPin },
  { key: "international", label: "International", icon: Plane },
];

const HandpickedPackages = () => {
  const ref = useReveal<HTMLDivElement>();
  const { covers } = useDestinationCovers();
  const [tab, setTab] = useState<Tab>("all");

  const list = useMemo(() => {
    if (tab === "domestic") return domesticDestinations;
    if (tab === "international") return internationalDestinations;
    return destinations;
  }, [tab]);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3">Quietly Curated</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
            Handpicked <span className="italic text-gold">Holiday Packages</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground font-light">
            Every destination we offer — designed end-to-end by our travel curators.
          </p>
        </div>

        <div role="tablist" className="flex justify-center gap-2 sm:gap-3 mb-10">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-[11px] uppercase tracking-luxe border rounded-full transition-all duration-300 ${
                  active
                    ? "bg-gold/15 border-gold text-gold"
                    : "bg-transparent border-border text-muted-foreground hover:border-gold/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Mobile: snap carousel */}
        <div
          key={`m-${tab}`}
          className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 animate-in fade-in duration-500"
          style={{ scrollbarWidth: "none" }}
        >
          {list.map((d) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative shrink-0 w-[70%] snap-start rounded-2xl overflow-hidden border border-border/60 aspect-[4/5] bg-card"
            >
              <img src={covers[d.slug] ?? d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] tracking-luxe uppercase text-gold mb-1">{d.region}</p>
                <h3 className="font-serif text-xl text-white leading-tight">{d.name}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: grid */}
        <div
          ref={ref}
          key={`d-${tab}`}
          className="hidden md:grid reveal grid-cols-3 lg:grid-cols-4 gap-5 animate-in fade-in duration-500"
        >
          {list.map((d) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-border/60 hover:border-gold/60 bg-card aspect-[4/5] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-gold"
            >
              <img
                src={covers[d.slug] ?? d.image}
                alt={d.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
              <span className="absolute top-3 left-3 text-[9px] uppercase tracking-luxe text-gold bg-background/40 backdrop-blur-sm border border-gold/30 px-2 py-1 rounded-full">
                {d.region}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-1">{d.country}</p>
                <h3 className="font-serif text-xl md:text-2xl text-white leading-tight">{d.name}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-luxe text-gold opacity-0 group-hover:opacity-100 transition-all">
                  Explore <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HandpickedPackages;