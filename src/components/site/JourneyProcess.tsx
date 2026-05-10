import { Ear, Compass, ClipboardCheck, Headphones } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionTitle from "./SectionTitle";

const steps = [
  { icon: Ear, title: "Listen", desc: "We hear what kind of holiday you dream of." },
  { icon: Compass, title: "Curate", desc: "A bespoke itinerary, hand-stitched for you." },
  { icon: ClipboardCheck, title: "Confirm", desc: "Honest pricing. Clear inclusions. Zero surprises." },
  { icon: Headphones, title: "Concierge", desc: "24×7 support while you travel — even abroad." },
];

const JourneyProcess = () => {
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
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="bg-card border-y border-border/60 py-24 md:py-32">
      <div className="container">
        <SectionTitle
          eyebrow="The Jain Tours Way"
          title="Four quiet steps. One unforgettable journey."
        />

        <div ref={ref} className="relative mt-20">
          {/* Animated gold line (desktop only) */}
          <svg
            aria-hidden
            className="hidden md:block absolute left-0 right-0 top-10 mx-auto pointer-events-none"
            width="100%"
            height="2"
            viewBox="0 0 1000 2"
            preserveAspectRatio="none"
          >
            <line
              x1="0" y1="1" x2="1000" y2="1"
              stroke="hsl(var(--gold))"
              strokeWidth="1"
              strokeDasharray="1000"
              strokeDashoffset={active ? 0 : 1000}
              style={{ transition: "stroke-dashoffset 1800ms ease-out" }}
            />
          </svg>

          <ol className="grid md:grid-cols-4 gap-12 md:gap-6 relative">
            {steps.map(({ icon: Icon, title, desc }, idx) => (
              <li
                key={title}
                className="text-center transition-all duration-700"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
                  transitionDelay: `${idx * 200 + 400}ms`,
                }}
              >
                <div className="relative mx-auto w-20 h-20 rounded-full bg-background border border-gold/60 flex items-center justify-center shadow-gold">
                  <Icon className="w-7 h-7 text-gold" strokeWidth={1.25} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold text-primary-foreground text-[11px] font-medium flex items-center justify-center">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-foreground mt-6">{title}</h3>
                <p className="text-sm text-muted-foreground font-light mt-2 max-w-xs mx-auto leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default JourneyProcess;
