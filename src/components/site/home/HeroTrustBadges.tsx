import { Award, Users, FileCheck, Headphones, ShieldCheck, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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
        className="group relative px-6 md:px-7 py-5 mx-2 md:mx-3 rounded-xl border shrink-0 min-w-[15rem] md:min-w-0 transition-colors duration-500 bg-card/80 backdrop-blur-md border-gold/25 shadow-luxe flex-row gap-[16px] flex items-center justify-start"
      >
        <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center border bg-gold/10 border-gold/30">
          <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-xl md:text-2xl leading-none whitespace-nowrap text-foreground">{value}</p>
          <p className="tracking-luxe uppercase mt-1 text-[9px] md:text-[10px] text-black dark:text-foreground font-medium">{label}</p>
        </div>
        <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gold/60" />
      </div>
    ))}
  </>
);

const HeroTrustBadges = () => {
  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section
      onClick={scrollToReviews}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && scrollToReviews()}
      aria-label="Read reviews from our guests"
      className="container -mt-8 md:-mt-12 relative z-20 overflow-hidden cursor-pointer group rounded-2xl transition-all hover:opacity-95"
    >
      <p className="text-center text-[10px] tracking-luxe uppercase text-gold/80 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
        Built on Trust · Tap to read guest reviews
      </p>
      {/* Mobile: slower marquee, larger min-width so ~1.5 badges fit per view */}
      <div className="md:hidden flex animate-marquee-x pause-on-hover" style={{ animationDuration: "32s" }}>
        <div className="flex shrink-0"><Row /></div>
        <div className="flex shrink-0" aria-hidden><Row /></div>
      </div>
      {/* Desktop: standard marquee speed */}
      <div className="hidden md:flex animate-marquee-x pause-on-hover">
        <div className="flex shrink-0"><Row /></div>
        <div className="flex shrink-0" aria-hidden><Row /></div>
      </div>
    </section>
  );
};

export default HeroTrustBadges;
