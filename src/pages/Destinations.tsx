import { useState, useMemo } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import InquiryBand from "@/components/site/InquiryBand";
import { domesticDestinations, internationalDestinations, type Destination } from "@/data/destinations";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Plane, Globe, Search, X } from "lucide-react";

type CategoryKey = "domestic" | "international";
type FilterKey = "all" | CategoryKey;

const categoryStyles: Record<
  CategoryKey,
  {
    text: string;
    border: string;
    borderHover: string;
    bgSoft: string;
    separator: string;
    icon: typeof MapPin;
    shadowHover: string;
  }
> = {
  domestic: {
    text: "text-[hsl(var(--accent-domestic))]",
    border: "border-[hsl(var(--accent-domestic)/0.25)]",
    borderHover: "hover:border-[hsl(var(--accent-domestic))]",
    bgSoft: "bg-[hsl(var(--accent-domestic-soft))]",
    separator: "border-[hsl(var(--accent-domestic)/0.4)]",
    icon: MapPin,
    shadowHover: "hover:shadow-[0_20px_50px_-20px_hsl(var(--accent-domestic)/0.55)]",
  },
  international: {
    text: "text-[hsl(var(--accent-international))]",
    border: "border-[hsl(var(--accent-international)/0.25)]",
    borderHover: "hover:border-[hsl(var(--accent-international))]",
    bgSoft: "bg-[hsl(var(--accent-international-soft))]",
    separator: "border-[hsl(var(--accent-international)/0.4)]",
    icon: Plane,
    shadowHover: "hover:shadow-[0_20px_50px_-20px_hsl(var(--accent-international)/0.55)]",
  },
};

const Destinations = () => {
  useSeo({
    title: "Destinations — Domestic & International | Jain Tours",
    description:
      "Hand-picked domestic and international destinations curated for Indian luxury travellers. Explore galleries, inclusions and on-ground support by Jain Tours & Travels.",
    canonicalPath: "/destinations",
  });

  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filterPills: { key: FilterKey; label: string; icon: typeof Globe }[] = [
    { key: "all", label: "All", icon: Globe },
    { key: "domestic", label: "Domestic", icon: MapPin },
    { key: "international", label: "International", icon: Plane },
  ];

  const pillClasses = (key: FilterKey) => {
    const active = filter === key;
    if (key === "all") {
      return active
        ? "bg-gold/15 border-gold text-gold"
        : "bg-transparent border-border text-muted-foreground hover:border-gold/60 hover:text-foreground";
    }
    if (key === "domestic") {
      return active
        ? "bg-[hsl(var(--accent-domestic-soft))] border-[hsl(var(--accent-domestic))] text-[hsl(var(--accent-domestic))] font-medium"
        : "bg-transparent border-border text-muted-foreground hover:bg-[hsl(var(--accent-domestic-soft))] hover:text-[hsl(var(--accent-domestic))] hover:border-[hsl(var(--accent-domestic)/0.4)]";
    }
    return active
      ? "bg-[hsl(var(--accent-international-soft))] border-[hsl(var(--accent-international))] text-[hsl(var(--accent-international))] font-medium"
      : "bg-transparent border-border text-muted-foreground hover:bg-[hsl(var(--accent-international-soft))] hover:text-[hsl(var(--accent-international))] hover:border-[hsl(var(--accent-international)/0.4)]";
  };

  return (
    <SiteLayout>
      <PageHero title="DESTINATIONS" crumb="Destinations" />

      {/* Floating search + filter card, half overlapping hero */}
      <div className="container relative -mt-12 md:-mt-16 z-20 px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold/30 bg-card/90 backdrop-blur-xl shadow-[0_25px_60px_-20px_hsl(var(--gold)/0.35)] ring-1 ring-white/5 p-3 sm:p-4 animate-fade-in space-y-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations…"
              className="w-full h-10 pl-11 pr-10 rounded-full bg-background/80 border border-border focus:border-gold focus:ring-2 focus:ring-gold/30 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div
            role="tablist"
            aria-label="Filter destinations"
            className="flex items-center gap-2 flex-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filterPills.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`shrink-0 inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs uppercase tracking-luxe border rounded-full transition-all duration-300 ${pillClasses(key)}`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-2 container pt-10 md:pt-14">
        <p className="tracking-luxe uppercase text-gold text-center text-base font-serif font-semibold bg-inherit">Curated Worldwide</p>
      </div>

      <DestinationsContent filter={filter} query={query} />

      <InquiryBand />
    </SiteLayout>
  );
};

const DestinationsContent = ({ filter, query }: { filter: FilterKey; query: string }) => {
  const { covers } = useDestinationCovers();
  const q = query.trim().toLowerCase();
  const matches = (d: Destination) =>
    !q ||
    d.name.toLowerCase().includes(q) ||
    d.country?.toLowerCase().includes(q) ||
    d.tagline?.toLowerCase().includes(q);
  const domestic = useMemo(() => domesticDestinations.filter(matches), [q]);
  const international = useMemo(() => internationalDestinations.filter(matches), [q]);
  const noResults =
    (filter === "all" && domestic.length === 0 && international.length === 0) ||
    (filter === "domestic" && domestic.length === 0) ||
    (filter === "international" && international.length === 0);
  return (
    <div key={filter} className="transition-opacity duration-500 animate-in fade-in">
      {noResults && (
        <div className="container py-20 text-center text-muted-foreground">
          No destinations match "{query}".
        </div>
      )}
      {(filter === "all" || filter === "domestic") && domestic.length > 0 && (
        <div className="container py-16 md:py-20 pt-0 pb-[50px]">
          <DestinationGroup
            category="domestic"
            eyebrow="Domestic"
            title="India, intimately known."
            list={domestic}
            covers={covers}
          />
        </div>
      )}

      {(filter === "all" || filter === "international") && international.length > 0 && (
        <div className="container py-16 md:py-20 pt-0 pb-[80px]">
          <DestinationGroup
            category="international"
            eyebrow="International"
            title="The world, quietly arranged."
            list={international}
            covers={covers}
          />
        </div>
      )}
    </div>
  );
};

const DestinationGroup = ({
  category,
  eyebrow,
  title,
  list,
  covers,
}: {
  category: CategoryKey;
  eyebrow: string;
  title: string;
  list: Destination[];
  covers: Record<string, string>;
}) => {
  const ref = useReveal<HTMLDivElement>();
  const styles = categoryStyles[category];
  const Icon = styles.icon;

  return (
    <section>
      <div className={`flex items-end justify-between gap-6 mb-10 border-b ${styles.separator} pb-6`}>
        <div>
          <p className={`flex items-center gap-2 text-[11px] tracking-luxe uppercase mb-2 ${styles.text}`}>
            <Icon className="w-3.5 h-3.5" />
            {eyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">{title}</h2>
        </div>
        <p className={`text-xs tracking-luxe uppercase hidden sm:block ${styles.text}`}>
          {list.length} destinations
        </p>
      </div>

      <div
        ref={ref}
        className="reveal grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
      >
        {list.map((d) => (
          <Link
            key={d.slug}
            to={`/destinations/${d.slug}`}
            className={`group relative block overflow-hidden bg-card aspect-[4/5] rounded-2xl border ${styles.border} ${styles.borderHover} shadow-md ${styles.shadowHover} transition-all duration-500 hover:-translate-y-1`}
          >
            <img
              src={covers[d.slug] ?? d.image}
              alt={`${d.name} — luxury travel by Jain Tours`}
              loading="eager"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = `https://picsum.photos/seed/${encodeURIComponent(d.slug)}/800/1000`;
                }
              }}
              className="w-full h-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-110 group-hover:brightness-110"
            />
            <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[9px] uppercase tracking-luxe rounded-full backdrop-blur-sm ${styles.bgSoft} ${styles.text}`}>
              <Icon className="w-2.5 h-2.5" />
              {eyebrow}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight [text-shadow:_0_2px_8px_rgb(0_0_0_/_0.6)]">
                {d.name}
              </h3>
              <span className={`mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-luxe text-sky-300 transition-all duration-500`}>
                Explore <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Destinations;
