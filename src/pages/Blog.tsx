import { Link } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { useSeo } from "@/hooks/useSeo";
import { BLOG_POSTS } from "@/data/blogPosts";
import { Calendar, Clock } from "lucide-react";

const Blog = () => {
  useSeo({
    title: "Travel Blog — Guides, Itineraries & Tips | Jain Tours & Travels",
    description:
      "Honest travel guides, itineraries and visa tips from Mumbai's trusted travel agency. Updated regularly.",
    canonicalPath: "/blog",
  });

  const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SiteLayout>
      <PageHero title="Travel Blog" crumb="Blog" />
      <section className="container py-16">
        <header className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-luxe text-gold mb-3">Latest Stories</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Real itineraries, real costs, real tips
          </h2>
          <p className="mt-3 text-muted-foreground">
            Written by our team in Mumbai from years of planning trips for Indian travellers.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block bg-card rounded-lg overflow-hidden border border-border/60 hover:shadow-luxe transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-luxe text-gold mb-2">{post.category}</p>
                <h3 className="font-serif text-lg leading-snug text-foreground group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readMinutes} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Blog;