import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";

const heroImg =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1920";

interface PageHeroProps {
  title: string;
  crumb: string;
}

const PageHero = ({ title, crumb }: PageHeroProps) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      className="relative w-full h-[240px] md:h-[360px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(217 60% 12% / 0.5), hsl(217 60% 12% / 0.75)), url('${heroImg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div ref={ref} className="reveal text-center px-6">
        <h1 className="font-serif text-[32px] md:text-[48px] text-white tracking-[0.15em] uppercase">
          {title}
        </h1>
        <p className="mt-3 text-[13px] text-white/70">
          <Link to="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{crumb}</span>
        </p>
      </div>
    </section>
  );
};

export default PageHero;
