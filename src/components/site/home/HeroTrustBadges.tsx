import { Award, Users, FileCheck, Headphones, ShieldCheck, Briefcase } from "lucide-react";

const badges = [
  { icon: Award, value: "30+", label: "Years Experience" },
  { icon: Users, value: "10,000+", label: "Happy Travelers" },
  { icon: FileCheck, value: "Visa", label: "Assistance" },
  { icon: Headphones, value: "24/7", label: "Support" },
  { icon: ShieldCheck, value: "Travel", label: "Insurance" },
  { icon: Briefcase, value: "MICE", label: "Tourism" },
];

const Row = () => (
  <>
    {badges.map(({ icon: Icon, value, label }, idx) => (
      <div
        key={`${label}-${idx}`}
        className="group relative flex items-center gap-3 md:gap-4 px-5 md:px-6 py-4 md:py-5 mx-2 md:mx-3 rounded-xl bg-card/80 backdrop-blur-md border border-gold/25 shadow-luxe shrink-0"
      >
        <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-gold/10 border border-gold/30">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-gold" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg md:text-2xl text-foreground leading-none whitespace-nowrap">
            {value}
          </p>
          <p className="mt-1.5 text-[10px] md:text-xs uppercase tracking-luxe text-muted-foreground whitespace-nowrap">
            {label}
          </p>
        </div>
        <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gold/60" />
      </div>
    ))}
  </>
);

const HeroTrustBadges = () => {
  return (
    <section className="container -mt-8 md:-mt-12 relative z-20 overflow-hidden">
      <div className="flex animate-marquee-x pause-on-hover">
        <div className="flex shrink-0"><Row /></div>
        <div className="flex shrink-0" aria-hidden><Row /></div>
      </div>
    </section>
  );
};

export default HeroTrustBadges;
