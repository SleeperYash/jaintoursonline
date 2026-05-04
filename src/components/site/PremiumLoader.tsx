import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

/** First-load luxury loader: gold airplane traces a dotted arc, then fades away. */
const PremiumLoader = () => {
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("jt_loaded")) {
      setHidden(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 400 : 2000;
    const t1 = setTimeout(() => setLeaving(true), total - 500);
    const t2 = setTimeout(() => {
      setHidden(true);
      sessionStorage.setItem("jt_loaded", "1");
    }, total);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-[280px] h-[120px]">
          <svg viewBox="0 0 280 120" className="absolute inset-0 w-full h-full overflow-visible">
            <path
              d="M 10 100 Q 140 -20 270 100"
              fill="none"
              stroke="hsl(var(--gold) / 0.3)"
              strokeWidth="1.5"
              strokeDasharray="3 6"
            />
          </svg>
          <div className="absolute inset-0 loader-plane">
            <Plane className="w-7 h-7 text-gold -rotate-12" fill="currentColor" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-serif text-2xl text-foreground tracking-wide">
            Jain <span className="text-gold italic">Tours & Travels</span>
          </p>
          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-2">
            Crafting your journey…
          </p>
        </div>
      </div>

      <style>{`
        .loader-plane {
          offset-path: path("M 10 100 Q 140 -20 270 100");
          offset-rotate: auto;
          animation: loader-fly 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          width: 28px;
          height: 28px;
        }
        @keyframes loader-fly {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-plane { animation: none; offset-distance: 50%; }
        }
      `}</style>
    </div>
  );
};

export default PremiumLoader;
