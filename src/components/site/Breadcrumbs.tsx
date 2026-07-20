import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";

const SITE = "https://jaintoursonline.com";

export interface Crumb {
  label: string;
  href?: string; // omit for current page
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** Override the schema id if multiple breadcrumb blocks appear on one page. */
  ldId?: string;
  /** Hide the visible bar but still emit BreadcrumbList JSON-LD. */
  visible?: boolean;
  className?: string;
}

/**
 * Renders a visible breadcrumb trail plus BreadcrumbList JSON-LD.
 * The final item is treated as the current page (no link).
 */
export const Breadcrumbs = ({
  items,
  ldId = "ld-breadcrumb",
  visible = true,
  className = "",
}: BreadcrumbsProps) => {
  const withHome: Crumb[] =
    items[0]?.href === "/" ? items : [{ label: "Home", href: "/" }, ...items];

  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: withHome.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd id={ldId} data={ld} />
      {visible && (
        <nav
          aria-label="Breadcrumb"
          className={`text-[11px] md:text-xs uppercase tracking-luxe text-muted-foreground ${className}`}
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            {withHome.map((c, i) => {
              const isLast = i === withHome.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {c.href && !isLast ? (
                    <Link to={c.href} className="hover:text-gold transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/80" aria-current={isLast ? "page" : undefined}>
                      {c.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-3 h-3 opacity-60" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
};

export default Breadcrumbs;