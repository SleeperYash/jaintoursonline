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

type Tab = "domestic" | "international";

const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
  { key: "domestic", label: "Domestic", icon: MapPin },
  { key: "international", label: "International", icon: Plane },
];

const HandpickedPackages = () => {
  const ref = useReveal<HTMLDivElement>();
  const { covers } = useDestinationCovers();
  const [tab, setTab] = useState<Tab>("domestic");

  const list = useMemo(() => {
    if (tab === "international") return internationalDestinations;
    return domesticDestinations;
  }, [tab]);

  return (
    <section className="py-20 md:py-28 bg-background pt-[112px]">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3 font-semibold">Quietly Curated</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
            Handpicked <span className="italic text-gold">Holiday Packages</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground font-light text-zinc-800">
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
               className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs uppercase tracking-luxe border rounded-none transition-all duration-300 ${
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

        {/* Single-row horizontal carousel (all viewports) */}
        <div
          ref={ref}
          key={tab}
          className="-mx-4 px-4 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide animate-in fade-in duration-500"
          style={{ scrollbarWidth: "none" }}
        >
          {list.map((d) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start rounded-xl overflow-hidden border border-border/60 hover:border-gold/60 aspect-[3/4] bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-gold"
            >
              <img
                src={covers[d.slug] ?? d.image}
                alt={d.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <h3 className="font-serif text-sm md:text-base text-white leading-tight text-center font-semibold [text-shadow:_0_1px_4px_rgb(0_0_0_/_0.6)]">
                  {d.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HandpickedPackages;