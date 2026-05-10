import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { BRAND } from "@/lib/brand";

const HeroLuxe = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=80"
          alt="Luxury travel landscape"
          className="w-full h-full object-cover opacity-40 animate-[ken-burns_20s_ease-in-out_infinite_alternate]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--gold) / 0.15) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center px-6 py-32 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 bg-background/40 backdrop-blur-sm mb-10">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span className="text-xs tracking-wide text-foreground/90">
            {BRAND.rating} · Reviews
          </span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.05] tracking-tight">
          Journeys{" "}
          <span className="italic text-gold">Crafted in Gold.</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground font-light leading-relaxed">
          From Mumbai to the world — <br /> curated holidays, seamless bookings, and unforgettable journeys tailored just for you.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-gold text-primary-foreground text-xs uppercase tracking-luxe font-medium shadow-gold hover:shadow-luxe transition-all hover:-translate-y-0.5"
          >
            Plan My Trip
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/destinations"
            className="inline-flex items-center px-8 py-4 rounded-full border border-gold/60 text-foreground text-xs uppercase tracking-luxe hover:bg-gold/10 hover:border-gold transition-all"
          >
            Explore Destinations
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-[10px] tracking-luxe uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default HeroLuxe;
