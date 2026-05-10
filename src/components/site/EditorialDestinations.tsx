import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import SectionTitle from "./SectionTitle";
import { useReveal } from "@/hooks/useReveal";
import { useParallax } from "@/hooks/useParallax";

const FeatureCard = ({ d, tall = false }: { d: (typeof destinations)[number]; tall?: boolean }) => {
  const imgRef = useParallax<HTMLImageElement>(0.08);
  return (
    <Link
      to={`/destinations/${d.slug}`}
      className={`group relative overflow-hidden bg-card block ${tall ? "h-full min-h-[520px]" : "aspect-[4/5]"}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={d.image}
          alt={`${d.name} luxury travel`}
          loading="lazy"
          className="w-full h-[115%] object-cover transition-transform duration-[1400ms] group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
        <p className="text-[10px] tracking-luxe uppercase text-gold mb-2">{d.region}</p>
        <h3 className={`font-serif text-foreground ${tall ? "text-4xl md:text-5xl" : "text-3xl"}`}>{d.name}</h3>
        <p className="text-sm text-foreground/70 mt-2 font-light max-w-md">{d.tagline}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-luxe text-gold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          Explore <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};

const EditorialDestinations = () => {
  const ref = useReveal<HTMLDivElement>();
  const [feature, ...rest] = destinations.slice(0, 5);

  return (
    <section className="container py-24 md:py-32">
      <SectionTitle
        eyebrow="Signature Destinations"
        title="Quietly extraordinary places."
        description="A curated selection of escapes our guests return to most — each one personally vetted by our team."
      />

      <div ref={ref} className="reveal mt-16 grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Tall feature on the left */}
        <div className="lg:row-span-1">
          <FeatureCard d={feature} tall />
        </div>
        {/* 2x2 cluster on the right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {rest.map((d) => (
            <FeatureCard key={d.slug} d={d} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditorialDestinations;
