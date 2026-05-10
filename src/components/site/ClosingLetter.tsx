import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { BRAND, waLink } from "@/lib/brand";
import { useReveal } from "@/hooks/useReveal";

const ClosingLetter = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="container py-24 md:py-32">
      <div
        ref={ref}
        className="reveal max-w-3xl mx-auto relative bg-card border border-gold/40 p-10 md:p-16 shadow-luxe"
      >
        {/* corner ornaments */}
        <span aria-hidden className="absolute top-3 left-3 w-6 h-6 border-t border-l border-gold/60" />
        <span aria-hidden className="absolute top-3 right-3 w-6 h-6 border-t border-r border-gold/60" />
        <span aria-hidden className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-gold/60" />
        <span aria-hidden className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-gold/60" />

        <p className="text-[10px] tracking-luxe uppercase text-gold text-center mb-6">A Letter From Us</p>
        <p className="font-serif text-2xl md:text-3xl text-foreground/90 leading-relaxed italic text-center">
          "Travel, to us, is never a transaction. It's the quiet pride of watching a family discover a new horizon —
          and the trust they place in us to take them there. Whenever you're ready, we'd be honoured to plan yours."
        </p>
        <p className="mt-8 font-serif text-xl text-gold text-center">— The Jain Family</p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition shadow-gold"
          >
            Plan Your Journey <ArrowUpRight className="w-4 h-4" />
          </Link>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-gold/60 text-gold text-xs uppercase tracking-luxe hover:bg-gold/10 transition"
          >
            WhatsApp Us
          </a>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wide text-muted-foreground">
          {BRAND.shortAddress} · {BRAND.hours}
        </p>
      </div>
    </section>
  );
};

export default ClosingLetter;
