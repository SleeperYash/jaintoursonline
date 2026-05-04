import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import SectionTitle from "./SectionTitle";

const GlobeStrip = () => {
  const cards = destinations.slice(0, 12);
  const Card = ({ d }: { d: (typeof cards)[number] }) => (
    <Link
      to={`/destinations/${d.slug}`}
      className="group relative shrink-0 w-[260px] md:w-[300px] aspect-[3/4] overflow-hidden bg-card border border-border/60 mr-5"
    >
      <img
        src={d.image}
        alt={`${d.name} — ${d.region}`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] tracking-luxe uppercase text-gold mb-1">{d.region}</p>
        <h3 className="font-serif text-2xl text-foreground">{d.name}</h3>
        <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold/60 text-[10px] uppercase tracking-luxe text-gold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          Discover <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Dotted-map background */}
      <div aria-hidden className="absolute inset-0 bg-dotted-map opacity-[0.07]" />

      <div className="container relative">
        <SectionTitle
          eyebrow="Scroll the World"
          title="Where shall we wander?"
          description="A drifting rail of places our guests fell in love with — pause anywhere to look closer."
        />
      </div>

      <div className="relative mt-16 group/marquee">
        {/* edge fades */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-marquee-x pause-on-hover">
          <div className="flex shrink-0">
            {cards.map((d) => <Card key={d.slug} d={d} />)}
          </div>
          <div className="flex shrink-0" aria-hidden>
            {cards.map((d) => <Card key={`dup-${d.slug}`} d={d} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobeStrip;
