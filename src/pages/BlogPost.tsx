import { Link, useParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { useSeo } from "@/hooks/useSeo";
import { BLOG_POSTS } from "@/data/blogPosts";
import { BLOG_FAQS } from "@/data/blogFaqs";
import { findDestination } from "@/data/destinations";
import NotFound from "./NotFound";
import { Calendar, Clock, ArrowLeft, Headset } from "lucide-react";
import { BRAND, waLink } from "@/lib/brand";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import TravelAgencyLd from "@/components/site/schema/TravelAgencyLd";

const SITE = "https://jaintoursonline.com";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  useSeo({
    title: post ? `${post.title} | Jain Tours & Travels Blog` : "Blog | Jain Tours & Travels",
    description: post?.excerpt ?? "Travel blog by Jain Tours & Travels.",
    canonicalPath: post ? `/blog/${post.slug}` : "/blog",
    ogImage: post?.cover,
    ogType: "article",
  });

  if (!post) return <NotFound />;

  const faqs = BLOG_FAQS[post.slug] ?? [];

  const rel = post.related ?? {};
  const relatedDestinations = (rel.destinations ?? [])
    .map((slug) => findDestination(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const relatedPosts = (rel.posts ?? [])
    .map((s) => BLOG_POSTS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedServices = rel.services ?? [];
  const hasRelated =
    relatedDestinations.length > 0 || relatedPosts.length > 0 || relatedServices.length > 0;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.cover],
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: BRAND.name, url: SITE },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${post.slug}` },
    articleSection: post.category,
  };

  const faqLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  // Derive a short "trip name" for the CTA copy — e.g. "Kashmir", "Bali".
  const tripName = (() => {
    const firstDest = relatedDestinations[0]?.name;
    if (firstDest) return firstDest;
    // fallback: pull the first capitalised word from the title
    const m = post.title.match(/\b([A-Z][a-zA-Z]+)\b/);
    return m?.[1] ?? "next";
  })();

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      <TravelAgencyLd id="ld-agency-blogpost" pagePath={`/blog/${post.slug}`} />

      <article className="container py-16 max-w-3xl">
        <Breadcrumbs
          ldId="ld-breadcrumb-blogpost"
          className="mb-6"
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
            { label: post.title },
          ]}
        />
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-gold hover:underline mb-8">
          <ArrowLeft className="w-3 h-3" /> All posts
        </Link>

        <p className="text-[11px] uppercase tracking-luxe text-gold mb-3">{post.category}</p>
        <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
          {post.title}
        </h1>
        <div className="mt-5 flex items-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readMinutes} min read</span>
        </div>

        <div className="mt-10 aspect-[16/9] overflow-hidden rounded-lg">
          <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="mt-12 space-y-6 text-foreground/90 leading-relaxed">
          {post.content.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} className="font-serif text-2xl md:text-3xl text-foreground mt-10 mb-2">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="list-disc pl-6 space-y-2 text-foreground/85">
                  {block.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              );
            }
            return <p key={i} className="text-base md:text-lg text-foreground/85">{block.text}</p>;
          })}
        </div>

        <aside className="mt-16 p-6 md:p-8 rounded-lg bg-card border border-border/60">
          <h3 className="font-serif text-xl text-foreground">Planning this trip?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Talk to our team in Mumbai for a customised quote — typical response under 4 working hours.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/contact" className="px-5 py-2.5 bg-ink text-white text-[11px] uppercase tracking-luxe rounded-full hover:bg-ink/90 transition">
              Start an Enquiry
            </Link>
            <a href={waLink(`Hi, I read your blog on "${post.title}" and would like a quote.`)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-gold/60 text-gold text-[11px] uppercase tracking-luxe rounded-full hover:bg-gold hover:text-primary-foreground transition">
              WhatsApp Us
            </a>
          </div>
        </aside>

        {faqs.length > 0 && (
          <section aria-labelledby="faq-heading" className="mt-16">
            <p className="text-[11px] uppercase tracking-luxe text-gold mb-3">FAQ</p>
            <h2 id="faq-heading" className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="border border-border/60 rounded-lg overflow-hidden bg-card divide-y divide-border/60">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b-0">
                  <AccordionTrigger className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-medium text-foreground hover:bg-secondary/50 hover:no-underline gap-4">
                    <span className="flex-1">
                      <span className="text-gold mr-2 font-serif">Q{i + 1}.</span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6 pb-5 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Branded CTA banner (matches design reference) */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-xl bg-ink text-white px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-6 border border-gold/20">
            <div className="hidden sm:flex shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold/15 text-gold items-center justify-center ring-1 ring-gold/40">
              <Headset className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg md:text-2xl leading-tight">
                Planning your {tripName} trip?
              </p>
              <p className="mt-1 text-xs md:text-sm text-white/70">
                Get a customised itinerary &amp; best deals from our travel experts.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center justify-center px-5 md:px-7 py-3 bg-gold text-primary-foreground text-[11px] md:text-xs uppercase tracking-luxe font-medium rounded-md hover:bg-gold/90 transition w-full md:w-auto"
            >
              Get a Free Quote
            </Link>
          </div>
        </section>

        {hasRelated && (
          <section aria-labelledby="related-heading" className="mt-16">
            <h2 id="related-heading" className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Related on Jain Tours
            </h2>

            {relatedDestinations.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-luxe text-gold mb-3">Destinations</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedDestinations.map((d) => (
                    <Link
                      key={d.slug}
                      to={`/destinations/${d.slug}`}
                      className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60 hover:border-gold/50 transition"
                    >
                      <img src={d.image} alt={d.name} loading="lazy" className="w-16 h-16 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="font-serif text-base text-foreground group-hover:text-gold transition-colors truncate">{d.name}</p>
                        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">{d.region}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedServices.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-luxe text-gold mb-3">Services</p>
                <div className="flex flex-wrap gap-2">
                  {relatedServices.map((name) => (
                    <Link
                      key={name}
                      to="/services"
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-border text-xs text-foreground hover:border-gold/50 hover:text-gold transition"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedPosts.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-luxe text-gold mb-3">Continue reading</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/blog/${p.slug}`}
                      className="group block p-4 rounded-lg bg-card border border-border/60 hover:border-gold/50 transition"
                    >
                      <p className="text-[10px] uppercase tracking-luxe text-gold mb-1.5">{p.category}</p>
                      <p className="font-serif text-base text-foreground group-hover:text-gold transition-colors">{p.title}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </article>
    </SiteLayout>
  );
};

export default BlogPost;