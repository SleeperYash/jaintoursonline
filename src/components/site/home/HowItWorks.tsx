import { useEffect, useRef, useState } from "react";
import { Phone, FileText, CheckCircle2, Plane, Leaf } from "lucide-react";

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
    <section className="relative bg-background overflow-hidden pt-14 pb-28 md:pt-20 md:pb-32">
      {/* Layered mountain silhouettes */}
      <div className="absolute inset-x-0 bottom-0 h-28 md:h-36 pointer-events-none" aria-hidden>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 180" preserveAspectRatio="none">
          <path
            d="M0 103L102 62L188 92L294 35L392 91L500 55L595 104L708 47L817 91L912 59L1019 102L1124 42L1232 87L1341 52L1440 92V180H0Z"
            fill="hsl(var(--primary))"
            opacity="0.06"
          />
          <path
            d="M0 128L118 81L228 119L348 68L473 126L583 88L700 133L814 73L926 120L1039 89L1158 136L1288 82L1440 124V180H0Z"
            fill="hsl(var(--primary))"
            opacity="0.08"
          />
          <path
            d="M0 151L129 111L260 145L385 101L518 154L650 119L785 151L918 105L1061 154L1199 116L1324 151L1440 123V180H0Z"
            fill="hsl(var(--foreground))"
            opacity="0.05"
          />
        </svg>
      </div>

      {/* Soft foreground leaves */}
      <div className="absolute -left-5 bottom-0 h-24 w-32 md:h-36 md:w-44 opacity-[0.09] blur-[1.5px] pointer-events-none text-foreground" aria-hidden>
        <Leaf className="absolute bottom-1 left-2 h-16 w-16 -rotate-12" strokeWidth={1} />
        <Leaf className="absolute bottom-5 left-12 h-20 w-20 rotate-[24deg]" strokeWidth={1} />
        <Leaf className="absolute -bottom-3 left-20 h-16 w-16 rotate-[58deg]" strokeWidth={1} />
      </div>

      {/* Airplane and dotted take-off trail */}
      <div className="absolute bottom-9 right-4 h-16 w-32 md:bottom-11 md:right-10 md:h-20 md:w-52 pointer-events-none text-primary" aria-hidden>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 210 80" fill="none">
          <path d="M4 69C53 70 72 62 100 45C123 31 146 25 182 24" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 6" strokeLinecap="round" opacity="0.55" />
        </svg>
        <Plane className="absolute right-0 top-1 h-5 w-5 md:h-6 md:w-6 -rotate-[18deg]" strokeWidth={1.5} />
      </div>

      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-8 bg-border" />
            <p className="text-[9px] md:text-[10px] tracking-luxe uppercase text-primary font-semibold">How It Works</p>
            <span className="h-px w-8 bg-border" />
          </div>
          <h2 className="font-serif text-[2rem] md:text-4xl lg:text-[2.75rem] text-foreground leading-tight">
            Your Journey in <span className="italic font-normal text-primary">4 Steps</span>
          </h2>
        </div>

        <div ref={ref} className="relative">
          <div
            aria-hidden
            className="hidden md:block absolute left-[12.5%] right-[12.5%] top-8 border-t border-dashed border-primary/30 pointer-events-none"
          />

          <ol className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-6 relative">
            {steps.map(({ n, icon: Icon, title, desc }, i) => (
              <li
                key={n}
                className="group text-center min-w-0 relative"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 700ms ease-out, transform 700ms ease-out",
                  transitionDelay: `${i * 180 + 200}ms`,
                }}
              >
                {i % 2 === 0 && (
                  <span aria-hidden className="md:hidden absolute top-7 left-[calc(50%+1.75rem)] right-[-0.5rem] border-t border-dashed border-primary/30" />
                )}
                <div className="relative z-10 mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full border border-primary/55 bg-background transition-all duration-500 group-hover:border-primary group-hover:-translate-y-1 group-hover:shadow-gold flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] md:w-5 md:h-5 text-primary" strokeWidth={1.35} />
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-primary-foreground text-[8px] font-bold">
                    {n}
                  </span>
                </div>
                <h3 className="font-serif text-base md:text-lg text-foreground mt-3 md:mt-4 font-semibold leading-snug">{title}</h3>
                <p className="mt-1.5 md:mt-2 text-[10px] md:text-[11px] text-muted-foreground leading-relaxed max-w-[155px] md:max-w-[210px] mx-auto font-normal break-words">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative z-10 text-center mt-10 md:mt-12">
          <p className="font-serif italic text-xl md:text-2xl text-primary leading-none">More Than Just a Trip</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-7 md:w-10 bg-primary/45" />
            <p className="text-[8px] md:text-[9px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
              It's a Lifetime Memory
            </p>
            <span className="h-px w-7 md:w-10 bg-primary/45" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
