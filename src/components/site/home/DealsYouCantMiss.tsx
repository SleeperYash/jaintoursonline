import { Link } from "react-router-dom";
import { Flame, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { packages } from "@/data/packages";
import { useDestinationCovers } from "@/hooks/useDestinationCovers";
import { destinations } from "@/data/destinations";
import { useReveal } from "@/hooks/useReveal";

const FEATURED_IDS = ["p1", "p2", "p5", "p6", "p10", "p12"];

const DealsYouCantMiss = () => {
  const ref = useReveal<HTMLDivElement>();
  const { covers } = useDestinationCovers();
  const deals = packages.filter((p) => FEATURED_IDS.includes(p.id));

  return (
    <section className="py-20 md:py-28 bg-card/30 border-y border-border/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="inline-flex items-center gap-2 tracking-luxe uppercase text-gold mb-3 font-semibold text-sm">
            <Flame className="w-3.5 h-3.5" /> Limited Time
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
            Deals You <span className="italic text-gold">Can't Miss</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground font-light">
            Curated packages with all-inclusive premium experiences.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {deals.map((p, i) => {
            const d = destinations.find((x) => x.slug === p.destinationSlug);
            const img = covers[p.destinationSlug] ?? p.image;
            return (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <Link
                  to={`/destinations/${p.destinationSlug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-gold/60 hover:-translate-y-1.5 hover:shadow-gold transition-all duration-500"
                >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={img}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-luxe text-gold bg-background/60 backdrop-blur-sm border border-gold/30 px-2.5 py-1 rounded-full">
                    {p.category}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] uppercase tracking-luxe text-foreground bg-gold/90 px-2.5 py-1 rounded-full">
                    {p.duration}
                  </span>
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mb-1.5">
                    {d?.country ?? p.destinationSlug}
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl text-foreground leading-tight line-clamp-2">
                    {p.title}
                  </h3>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">From</p>
                      <p className="font-serif text-lg text-gold">{p.fromPrice}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-luxe text-gold group-hover:gap-3 transition-all">
                      View deal <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
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

export default DealsYouCantMiss;