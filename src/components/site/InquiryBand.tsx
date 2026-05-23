import { useReveal } from "@/hooks/useReveal";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const InquiryBand = () => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section 
      className="py-12 md:py-20 overflow-hidden pt-[50px] bg-[linear-gradient(135deg,#e8f4fd_0%,#f0f8ff_50%,#ffffff_100%)] dark:bg-none dark:bg-background"
    >
      <div ref={ref} className="reveal container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Polaroid Photos */}
          <div className="relative flex justify-center items-center mx-auto w-full max-w-[400px] lg:max-w-none h-[340px] md:h-[480px]">
            {/* Gold Glow Behind Photos */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
              <div className="w-[70%] h-[70%] rounded-full bg-gold/20 dark:bg-gold/30 blur-[60px] md:blur-[80px]" />
            </div>
            {/* Big Photo (Paris) */}
            <div 
              className="absolute z-10 w-[65%] md:w-[60%] lg:w-[280px] bg-white dark:bg-card p-2.5 pb-10 md:p-3.5 md:pb-12 shadow-xl rounded-sm border border-black/5 dark:border-gold/20"
              style={{ transform: "rotate(-6deg) translateX(-10%)" }}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800" 
                  alt="Paris" 
                  className="w-full h-[180px] md:h-[280px] object-cover rounded-[2px]"
                />
                {/* Location Pill */}
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3 h-3" />
                  Paris
                </div>
              </div>
            </div>

            {/* Small Photo (Rome) */}
            <div 
              className="absolute z-20 w-[55%] md:w-[50%] lg:w-[240px] bg-white dark:bg-card p-2.5 pb-10 md:p-3.5 md:pb-12 shadow-2xl rounded-sm border border-black/5 dark:border-gold/20"
              style={{ transform: "rotate(4deg) translate(30%, 30%)" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600" 
                alt="Rome" 
                className="w-full h-[140px] md:h-[220px] object-cover rounded-[2px]"
              />
            </div>
          </div>

          {/* Right Side: Text & Stats */}
          <div className="flex flex-col text-center lg:text-left mt-8 lg:mt-0">
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground dark:text-gold leading-tight font-bold mb-4">
              Where Will You Go Next? <br className="hidden md:block" />Let's Plan It.
            </h2>
            <p className="text-muted-foreground dark:text-foreground/80 text-sm md:text-base mb-8 max-w-lg mx-auto lg:mx-0">
              Pick a place, pack your bags, and leave the planning to us — your next adventure is just a click away!
            </p>
            
            <div className="mb-12">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-ink dark:bg-gradient-to-r dark:from-gold dark:to-gold-deep text-white dark:text-primary-foreground rounded-full text-[11px] md:text-xs uppercase tracking-luxe font-medium hover:bg-ink/90 transition-colors shadow-lg"
              >
                Start an Enquiry
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 border-t border-border/40 dark:border-gold/20 pt-8">
              <div>
                <div className="text-2xl md:text-4xl font-bold text-foreground dark:text-gold mb-1">10K+</div>
                <div className="text-[10px] md:text-xs text-muted-foreground dark:text-foreground/70 font-medium uppercase tracking-wider">Happy Travellers & Counting</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-bold text-foreground dark:text-gold mb-1">30+</div>
                <div className="text-[10px] md:text-xs text-muted-foreground dark:text-foreground/70 font-medium uppercase tracking-wider">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl md:text-4xl font-bold text-foreground dark:text-gold mb-1">4.9⭐</div>
                <div className="text-[10px] md:text-xs text-muted-foreground dark:text-foreground/70 font-medium uppercase tracking-wider">Rated By Travellers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryBand;
