import { Link } from "react-router-dom";
import { BLOG_POSTS } from "@/data/blogPosts";
import { ArrowRight, Clock } from "lucide-react";

const BlogStrip = () => {
  const posts = [...BLOG_POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <section aria-labelledby="blog-strip-title" className="py-10 md:py-14 border-t border-border/40">
      <div className="container">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-luxe text-gold">From the Blog</p>
            <h2 id="blog-strip-title" className="font-serif text-xl md:text-3xl text-foreground mt-1">
              Travel Stories & Guides
            </h2>
          </div>
          <Link to="/blog" className="shrink-0 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-luxe text-foreground/70 hover:text-gold transition">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group snap-start shrink-0 w-[260px] md:w-[300px] bg-card rounded-lg overflow-hidden border border-border/60 hover:shadow-luxe transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-4">
                <p className="text-[9px] uppercase tracking-luxe text-gold mb-1.5">{post.category}</p>
                <h3 className="font-serif text-[15px] md:text-base leading-snug text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />{post.readMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogStrip;