import { useEffect, useRef, useState } from "react";
import { Phone, FileText, CheckCircle2, Plane } from "lucide-react";

const steps = [
  { n: "01", icon: Phone, title: "Reach Out", desc: "Call or message us with your travel details — dates, group size, dream destination." },
  { n: "02", icon: FileText, title: "Custom Plan", desc: "We craft a personalised itinerary with handpicked stays, flights & experiences." },
  { n: "03", icon: CheckCircle2, title: "Confirm & Book", desc: "Approve the plan — we handle every booking, visa and document, transparently." },
  { n: "04", icon: Plane, title: "Travel & Enjoy", desc: "A smooth, concierge-supported journey, with us a call away around the clock." },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative py-14 md:py-20 bg-background overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, hsl(var(--gold)) 0%, transparent 50%)",
        }}
      />

      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-gold mb-3 font-semibold">How It Works</p>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
            Your Journey in <span className="italic text-gold">4 Steps</span>
          </h2>
          <div className="mt-4 h-px w-12 bg-gold mx-auto" />
        </div>

        <div ref={ref} className="relative">
          {/* connector line desktop */}
          <svg
            aria-hidden
            className="hidden md:block absolute left-0 right-0 top-9 mx-auto pointer-events-none"
            width="100%" height="2" viewBox="0 0 1000 2" preserveAspectRatio="none"
          >
            <line
              x1="0" y1="1" x2="1000" y2="1"
              stroke="hsl(var(--gold))" strokeOpacity="0.4"
              strokeWidth="1" strokeDasharray="4 6"
              style={{
                strokeDashoffset: active ? 0 : 1000,
                transition: "stroke-dashoffset 1800ms ease-out",
              }}
            />
          </svg>

          <ol className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-6 relative">
            {steps.map(({ n, icon: Icon, title, desc }, i) => (
              <li
                key={n}
                className="group text-center min-w-0"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 700ms ease-out, transform 700ms ease-out",
                  transitionDelay: `${i * 180 + 200}ms`,
                }}
              >
                <div className="relative mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gold/60 bg-background transition-all duration-500 group-hover:border-gold group-hover:-translate-y-1 group-hover:shadow-gold flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 md:w-5 md:h-5 text-gold" strokeWidth={1.25} />
                  <span className="absolute -top-1.5 -right-1 px-1.5 md:px-2 py-0.5 rounded-full bg-gold text-primary-foreground text-[8px] md:text-[9px] font-semibold tracking-wide">
                    {n}
                  </span>
                </div>
                <h3 className="font-serif text-base md:text-lg text-foreground mt-3 md:mt-4 font-normal leading-snug">{title}</h3>
                <p className="mt-2 text-[11px] md:text-xs text-muted-foreground leading-relaxed max-w-[160px] md:max-w-[220px] mx-auto font-normal break-words">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
