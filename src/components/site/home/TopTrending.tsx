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

        {/* Single-row horizontal carousel (all viewports) */}
        <div
          ref={ref}
          className="reveal -mx-4 px-4 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((d) => (
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

export default TopTrending;