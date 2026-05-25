import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import { useReveal } from "@/hooks/useReveal";

const FEATURED_SLUGS = ["dubai", "singapore-malaysia", "kashmir", "kerala", "thailand", "europe"];

const FeaturedDestinations = () => {
  const ref = useReveal<HTMLDivElement>();
  const items = FEATURED_SLUGS
    .map((s) => destinations.find((d) => d.slug === s))
    .filter(Boolean) as typeof destinations;

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="tracking-luxe uppercase text-gold mb-3 text-sm font-semibold">Featured</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Signature Experiences
            </h2>
          </div>
        </div>

        <div ref={ref} className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((d, i) => (
            <Link
              key={d.slug}
              to={`/destinations/${d.slug}`}
              className="group relative block overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-gold/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-gold"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-110 object-fill"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>


              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <p className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-2">
                  {d.country}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-foreground leading-tight">
                  {d.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground font-light line-clamp-1">
                  {d.tagline}
                </p>
                <div className="mt-5 flex items-center justify-between pt-5 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxe text-gold group-hover:gap-3 transition-all">
                    Explore <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
