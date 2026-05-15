import SiteLayout from "@/components/site/SiteLayout";
import InquiryBand from "@/components/site/InquiryBand";
import { reviews, ratingDistribution } from "@/data/reviews";
import { clientReviews } from "@/data/clientPhotos";
import { BRAND } from "@/lib/brand";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { useClientReviews, type DisplayReview } from "@/hooks/useClientReviews";
import { Star, ExternalLink, MapPin, Quote } from "lucide-react";
import { GoogleRatingBadge, VerifiedTag } from "@/components/site/reviews/GoogleBadge";
import ReviewsCardStack from "@/components/site/home/ReviewsCardStack";

const Reviews = () => {
  const { display: dbReviews } = useClientReviews();
  useSeo({
    title: "Guest Reviews — 4.9★ on Google | Jain Tours & Travels Mumbai",
    description:
      "Real photos, real words. Read 142+ Google reviews from honeymooners, families and corporate guests of Jain Tours & Travels, Mumbai.",
    canonicalPath: "/reviews",
  });

  const total = ratingDistribution.reduce((s, r) => s + r.count, 0);
  const galleryReviews = dbReviews.filter((r) => r.image);
  const wallReviews = dbReviews.length > 0 ? dbReviews : reviews;

  return (
    <SiteLayout>
      {/* Hero */}
      <header className="relative pt-40 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(var(--gold)) 0%, transparent 60%)" }}
        />
        <div className="container relative text-center">
          <div className="flex justify-center mb-6">
            <GoogleRatingBadge rating={BRAND.rating} count={BRAND.reviewCount} />
          </div>
          <p className="text-xs tracking-luxe uppercase text-gold mb-4">Guest Words · Real Trips</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
            Quietly spoken.<br />
            <span className="italic text-gold">Honestly meant.</span>
          </h1>
          <div className="mt-8 h-px w-20 bg-gold mx-auto" />
        </div>
      </header>

      {/* Rating summary */}
      <section className="container pb-16">
        <div className="grid lg:grid-cols-3 gap-12 items-center bg-card border border-gold/15 rounded-2xl p-10 md:p-14 shadow-luxe">
          <div className="text-center lg:text-left lg:border-r lg:border-border/60 lg:pr-10">
            <p className="font-serif text-7xl md:text-8xl text-gold leading-none">{BRAND.rating}</p>
            <div className="flex justify-center lg:justify-start gap-1 text-gold mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs tracking-luxe uppercase text-muted-foreground mt-4">
              {BRAND.reviewCount} Google reviews
            </p>
          </div>
          <div className="lg:col-span-2 space-y-3">
            {ratingDistribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-8 tracking-wide">{r.stars}★</span>
                <div className="flex-1 h-1.5 bg-border/60 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gold transition-all duration-1000"
                    style={{ width: `${(r.count / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured carousel — same as homepage */}
      <ReviewsCardStack />

      {/* Photo gallery wall */}
      <PhotoGallery items={galleryReviews.length > 0 ? galleryReviews : clientReviews} />

      {/* Text-only reviews wall */}
      <ReviewWall items={wallReviews} />

      {/* CTA */}
      <section className="container py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-5">Travelled with us?</h2>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          A line on Google means the world — it helps the next family find a name they can trust.
        </p>
        <a
          href="https://www.google.com/search?q=Jain+Tours+%26+Travels+Goregaon+West+Mumbai"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 border border-gold text-gold text-xs uppercase tracking-luxe hover:bg-gold hover:text-primary-foreground transition rounded-full"
        >
          Leave a Google Review <ExternalLink className="w-4 h-4" />
        </a>
      </section>

      <InquiryBand />
    </SiteLayout>
  );
};

type ReviewDisplayItem = DisplayReview | (typeof clientReviews)[number];
type ReviewWallItem = DisplayReview | (typeof reviews)[number];

const PhotoGallery = ({ items }: { items: ReviewDisplayItem[] }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">Travel Diary</p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground">
          Moments, <span className="italic text-gold">unfiltered</span>
        </h2>
      </div>
      <div ref={ref} className="reveal grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {items.map((c, i) => (
          <figure
            key={`${c.name}-${i}`}
            className={`group relative overflow-hidden rounded-xl border border-gold/10 bg-card shadow-luxe ${
              i % 7 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
            }`}
          >
            <img
              src={c.image ?? ""}
              alt={`${c.name} in ${c.destination}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
              style={{
                background:
                  "linear-gradient(180deg, transparent 30%, hsl(220 50% 6% / 0.4) 60%, hsl(220 50% 4% / 0.95) 100%)",
              }}
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-4 md:p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3 text-gold" />
                <span className="text-[10px] uppercase tracking-luxe text-gold">{c.destination}</span>
              </div>
              <p className="text-sm font-serif italic text-foreground line-clamp-2 leading-snug">
                "{c.text.slice(0, 90)}…"
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 tracking-wide">— {c.name}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

const ReviewWall = ({ items }: { items: ReviewWallItem[] }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="container py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs tracking-luxe uppercase text-gold mb-3">All Reviews</p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground">
          In their <span className="italic text-gold">own words</span>
        </h2>
      </div>
      <div ref={ref} className="reveal columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
        {items.map((r, i) => (
          <figure
            key={`${r.name}-${i}`}
            className="break-inside-avoid mb-6 bg-card border border-gold/10 rounded-xl p-7 hover:border-gold/30 transition-colors relative"
          >
            <Quote className="absolute top-5 right-5 w-7 h-7 text-gold/15" />
            <div className="flex gap-1 text-gold mb-4">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="font-serif text-lg text-foreground/90 leading-relaxed">
              "{r.text}"
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs">
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm text-foreground">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                    Google · {r.date}
                  </p>
                </div>
              </div>
              <VerifiedTag />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Reviews;
