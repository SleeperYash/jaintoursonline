import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { destinations } from "@/data/destinations";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { useReveal } from "@/hooks/useReveal";

const TRENDING = ["dubai", "maldives", "bali", "kashmir", "switzerland", "thailand", "kerala", "japan"];

const TopTrending = () => {
  const ref = useReveal<HTMLDivElement>();
  const { covers } = useDestinationCovers();
  const items = TRENDING
    .map((s) => destinations.find((d) => d.slug === s))
    .filter(Boolean) as typeof destinations;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-gold mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Trending Now
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
              Top Trending <span className="italic text-gold">Destinations</span>
            </h2>
          </div>
          <Link to="/destinations" className="hidden md:inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-gold hover:gap-3 transition-all">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile: horizontal swipe carousel */}
        <div
          ref={ref}
          className="reveal -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:hidden scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((d) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative shrink-0 w-[78%] snap-start rounded-2xl overflow-hidden border border-border/60 aspect-[4/5] bg-card"
            >
              <img src={covers[d.slug] ?? d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[10px] tracking-luxe uppercase text-gold mb-1">{d.country}</p>
                <h3 className="font-serif text-2xl text-white leading-tight">{d.name}</h3>
                <p className="mt-1 text-xs text-white/80 line-clamp-1">{d.tagline}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: grid with hover lift */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((d, i) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-border/60 hover:border-gold/60 bg-card aspect-[4/5] transition-all duration-500 hover:-translate-y-2 hover:shadow-gold"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img
                src={covers[d.slug] ?? d.image}
                alt={d.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <span className="absolute top-3 left-3 text-[9px] uppercase tracking-luxe text-gold bg-background/40 backdrop-blur-sm border border-gold/30 px-2 py-1 rounded-full">
                {d.region}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[10px] tracking-luxe uppercase text-white/70 mb-1">{d.country}</p>
                <h3 className="font-serif text-2xl text-white leading-tight">{d.name}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-luxe text-gold opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all">
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

export default TopTrending;