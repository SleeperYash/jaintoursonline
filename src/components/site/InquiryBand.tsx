import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useReveal } from "@/hooks/useReveal";

const InquiryBand = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 md:py-32 bg-emerald-deep overflow-hidden pt-[50px] pb-[50px]">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
           style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--gold)) 0%, transparent 40%)" }} />
      <div ref={ref} className="reveal container text-center max-w-3xl">
        <p className="text-xs tracking-luxe uppercase text-gold mb-5">Begin the journey</p>
        <h2 className="font-serif text-4xl md:text-6xl text-foreground leading-tight">
          Let us craft something <span className="italic text-gold">unforgettable.</span>
        </h2>
        <p className="mt-6 text-muted-foreground font-light leading-relaxed">
          Share a few details about your dream trip — our travel curator will reply within hours,
          with a quietly bespoke proposal.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition shadow-gold"
          >
            Start an Enquiry
          </Link>
          <a
            href={`tel:${BRAND.phoneDigits}`}
            className="inline-flex items-center gap-2 px-8 py-4 border border-foreground/30 text-foreground text-xs uppercase tracking-luxe hover:border-gold hover:text-gold transition"
          >
            <Phone className="w-4 h-4" /> {BRAND.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
};

export default InquiryBand;
