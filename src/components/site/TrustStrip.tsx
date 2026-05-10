import { Star, Users, Award, Headphones, ShieldCheck } from "lucide-react";

const items = [
  { icon: Star, label: "4.9★ Google Rated" },
  { icon: Users, label: "142+ Happy Guests" },
  { icon: Award, label: "15+ Years Curated" },
  { icon: Headphones, label: "24×7 Concierge" },
  { icon: ShieldCheck, label: "ATOI Certified" },
];

const Row = () => (
  <>
    {items.map(({ icon: Icon, label }, idx) => (
      <div key={`${label}-${idx}`} className="flex items-center gap-3 px-8 shrink-0">
        <Icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
        <span className="text-xs tracking-luxe uppercase text-foreground/80 whitespace-nowrap">{label}</span>
        <span className="ml-8 text-gold/40">·</span>
      </div>
    ))}
  </>
);

const TrustStrip = () => {
  return (
    <section className="bg-card border-y border-border/60 py-5 overflow-hidden">
      {/* Mobile: marquee */}
      <div className="md:hidden flex animate-marquee-x">
        <div className="flex shrink-0"><Row /></div>
        <div className="flex shrink-0" aria-hidden><Row /></div>
      </div>
      {/* Desktop: static, centered */}
      <div className="hidden md:flex container items-center justify-between">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
            <span className="text-xs tracking-luxe uppercase text-foreground/80">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustStrip;
