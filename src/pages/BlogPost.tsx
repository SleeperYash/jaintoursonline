import { Link, useParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { useSeo } from "@/hooks/useSeo";
import { BLOG_POSTS } from "@/data/blogPosts";
import NotFound from "./NotFound";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { BRAND, waLink } from "@/lib/brand";

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

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <article className="container py-16 max-w-3xl">
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
      </article>
    </SiteLayout>
  );
};

export default BlogPost;