import SiteLayout from "@/components/site/SiteLayout";
import SectionTitle from "@/components/site/SectionTitle";
import InquiryBand from "@/components/site/InquiryBand";
import { reviews, ratingDistribution } from "@/data/reviews";
import { BRAND } from "@/lib/brand";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { Star, ExternalLink } from "lucide-react";

const Reviews = () => {
  useSeo({
    title: "Reviews — 4.9★ from 142+ Guests | Jain Tours & Travels",
    description:
      "Read 142+ Google reviews of Jain Tours & Travels, Mumbai. Honest words from real guests on cruises, honeymoons, family and corporate trips.",
    canonicalPath: "/reviews",
  });

  const total = ratingDistribution.reduce((s, r) => s + r.count, 0);

  return (
    <SiteLayout>
      <header className="pt-40 pb-12 container">
        <SectionTitle eyebrow="Guest Words" title="Quietly spoken. Honestly meant." />
      </header>

      <section className="container pb-24">
        <div className="grid lg:grid-cols-3 gap-12 items-center bg-card border border-border/60 p-10 md:p-14">
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
                <div className="flex-1 h-1.5 bg-border/60 overflow-hidden">
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

      <ReviewWall />

      <section className="container py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-5">Travelled with us?</h2>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          A line on Google means the world — it helps the next family find a name they can trust.
        </p>
        <a
          href="https://www.google.com/search?q=Jain+Tours+%26+Travels+Goregaon+West+Mumbai"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 border border-gold text-gold text-xs uppercase tracking-luxe hover:bg-gold hover:text-primary-foreground transition"
        >
          Leave a Google Review <ExternalLink className="w-4 h-4" />
        </a>
      </section>

      <InquiryBand />
    </SiteLayout>
  );
};

const ReviewWall = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="container pb-12">
      <div ref={ref} className="reveal columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
        {reviews.map((r) => (
          <figure key={r.name} className="break-inside-avoid mb-6 bg-card border border-border/60 p-8">
            <div className="flex gap-1 text-gold mb-4">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="font-serif text-lg text-foreground/90 leading-relaxed">"{r.text}"</blockquote>
            <figcaption className="mt-6 pt-5 border-t border-border/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-gold text-xs">
                {r.initials}
              </div>
              <div>
                <p className="text-sm text-foreground">{r.name}</p>
                <p className="text-[11px] text-muted-foreground tracking-wide">{r.source} · {r.date}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Reviews;
