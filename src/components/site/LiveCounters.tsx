import { Users, Globe, Calendar, Star } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

type Stat = {
  icon: typeof Users;
  target: number;
  suffix?: string;
  decimals?: number;
  label: string;
};

const stats: Stat[] = [
  { icon: Users, target: 142, suffix: "+", label: "Happy Guests" },
  { icon: Globe, target: 38, suffix: "", label: "Countries Crafted" },
  { icon: Calendar, target: 15, suffix: "+", label: "Years of Trust" },
  { icon: Star, target: 4.9, decimals: 1, suffix: "★", label: "Average Rating" },
];

const Counter = ({ stat }: { stat: Stat }) => {
  const { ref, value } = useCountUp(stat.target, 1800);
  const display = stat.decimals
    ? value.toFixed(stat.decimals)
    : Math.round(value).toString();
  const Icon = stat.icon;
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="bg-background border border-gold/30 p-8 md:p-10 flex flex-col gap-4 transition-colors hover:border-gold"
    >
      <Icon className="w-6 h-6 text-gold" strokeWidth={1.25} />
      <p className="font-serif text-5xl md:text-6xl text-foreground tabular-nums">
        {display}
        <span className="text-gold">{stat.suffix}</span>
      </p>
      <p className="text-xs tracking-luxe uppercase text-muted-foreground">{stat.label}</p>
    </div>
  );
};

const LiveCounters = () => {
  return (
    <section className="container py-24 md:py-32">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/60">
        {stats.map((s) => (
          <Counter key={s.label} stat={s} />
        ))}
      </div>
    </section>
  );
};

export default LiveCounters;
