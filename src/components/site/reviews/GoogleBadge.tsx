import { Star } from "lucide-react";

const GoogleG = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

export const GoogleRatingBadge = ({ rating = 4.9, count = 142 }: { rating?: number; count?: number }) => (
  <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md border border-gold/30 rounded-full pl-2 pr-3 py-1.5 shadow-sm text-base">
    <GoogleG />
    <span className="text-xs font-medium text-foreground tabular-nums">{rating.toFixed(1)}</span>
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-2.5 h-2.5 fill-rating-star text-rating-star" />
      ))}
    </div>
    <span className="text-[10px] text-muted-foreground tracking-wide text-slate-100">({count})</span>
  </div>
);

export const VerifiedTag = () => (
  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-luxe text-gold border border-gold/40 px-2 py-0.5 rounded-full bg-gold/5">
    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1l2.39 4.84L20 6.84l-4 3.9.94 5.5L12 13.77l-4.94 2.6L8 10.74l-4-3.9 5.61-1z" />
    </svg>
    Verified Traveller
  </span>
);
