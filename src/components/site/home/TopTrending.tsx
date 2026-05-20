import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { destinations } from "@/data/destinations";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { useReveal } from "@/hooks/useReveal";

const TRENDING = ["dubai", "maldives", "bali", "kashmir", "switzerland", "thailand", "kerala", "japan"];

const PRICES: Record<string, number> = {
  dubai: 54999,
  maldives: 89999,
  bali: 49999,
  kashmir: 29999,
  switzerland: 149999,
  thailand: 39999,
  kerala: 19999,
  japan: 124999,
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const TopTrending = () => {
  const ref = useReveal<HTMLDivElement>();
  const { covers } = useDestinationCovers();
  const items = TRENDING
    .map((s) => destinations.find((d) => d.slug === s))
    .filter(Boolean) as typeof destinations;

  return (
    <section className="py-20 md:py-28 bg-background pt-[112px]">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div>
            <p className="inline-flex items-center gap-2 tracking-luxe uppercase text-gold mb-3 text-sm font-semibold">
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
        <motion.div
          ref={ref}
          className="reveal -mx-4 px-4 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {items.map((d) => (
            <motion.div
              key={d.slug}
              className="shrink-0"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <Link
                to={`/destinations/${d.slug}`}
                className="group relative block w-52 h-80 snap-start rounded-3xl overflow-hidden border border-border/60 hover:border-gold/60 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-gold"
              >
              <img
                src={covers[d.slug] ?? d.image}
                alt={d.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-3 py-3 text-white">
                <h3 className="font-serif text-sm leading-tight text-center font-semibold [text-shadow:_0_1px_4px_rgb(0_0_0_/_0.6)]">
                  {d.name}
                </h3>
                <div className="my-2 h-px bg-white/25" />
                <div className="flex items-end justify-between gap-2">
                  <div className="leading-tight">
                    <p className="text-[9px] uppercase tracking-luxe text-white/70">Starting from</p>
                    <p className="font-serif text-base font-semibold">{formatINR(PRICES[d.slug] ?? 49999)}</p>
                    <p className="text-[9px] text-white/70">per person</p>
                  </div>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-gold text-primary-foreground flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TopTrending;