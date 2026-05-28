import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, MapPin, Plane } from "lucide-react";
import { motion } from "framer-motion";
import {
  domesticDestinations,
  internationalDestinations,
} from "@/data/destinations";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { useReveal } from "@/hooks/useReveal";
import { packages } from "@/data/packages";
import { generateEstimatedPrice, formatINR } from "@/lib/estimatedPrice";

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

  // Aggregate package count + lowest price per destination slug
  const stats = useMemo(() => {
    const map: Record<string, { count: number; min: number | null; label: string | null }> = {};
    for (const p of packages) {
      const m = map[p.destinationSlug] ?? { count: 0, min: null, label: null };
      m.count += 1;
      const num = parseInt(p.fromPrice.replace(/[^\d]/g, ""), 10);
      if (!Number.isNaN(num) && (m.min === null || num < m.min)) {
        m.min = num;
        m.label = p.fromPrice;
      }
      map[p.destinationSlug] = m;
    }
    return map;
  }, []);

  return (
    <section className="py-20 md:py-28 bg-background pt-[112px]">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs tracking-luxe uppercase text-gold mb-3 font-semibold">Quietly Curated</p>
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

        {/* Single-row horizontal carousel (circular tiles) */}
        <motion.div
          ref={ref}
          key={tab}
          className="-mx-4 px-4 flex gap-5 sm:gap-7 md:gap-9 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide animate-in fade-in duration-500"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {list.map((d) => {
            const s = stats[d.slug];
            const count = s?.count ?? 0;
            const displayCount = count > 0 ? `${count}+ Packages` : "On request";
            const priceValue = s?.min ?? generateEstimatedPrice(d.slug, d.region);
            return (
              <motion.div
                key={d.slug}
                className="shrink-0 snap-start"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <Link
                  to={`/destinations/${d.slug}`}
                  className="group block w-[160px] sm:w-[200px] md:w-[230px] text-left"
                >
                  <div className="relative aspect-square w-full rounded-full overflow-hidden bg-card ring-1 ring-border/60 group-hover:ring-gold/60 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-gold">
                    <img
                      src={covers[d.slug] ?? d.image}
                      alt={d.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-3 md:mt-4 px-1">
                    <h3 className="font-serif text-base sm:text-lg md:text-xl text-foreground leading-tight truncate">
                      {d.name}
                    </h3>
                    <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">{displayCount}</p>
                    <p className="mt-2 text-[9px] md:text-[10px] tracking-luxe uppercase text-muted-foreground/80">
                      Starting From
                    </p>
                    <p className="mt-0.5 text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatINR(priceValue)}/-
                      <span className="ml-1 text-[10px] md:text-[11px] font-normal text-muted-foreground">
                        per person
                      </span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HandpickedPackages;