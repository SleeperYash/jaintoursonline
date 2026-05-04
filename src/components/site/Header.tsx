import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  
  { to: "/destinations", label: "Destinations" },
  { to: "/services", label: "Services" },
  { to: "/reviews", label: "Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled || open
          ? "bg-background/90 backdrop-blur-md border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex flex-col leading-none group">
          <span className="font-serif text-2xl tracking-wide text-foreground">
            Jain <span className="text-gold italic text-xl">Tours & Travels</span>
          </span>
          <span className="tracking-luxe uppercase text-muted-foreground mt-1 text-xs">
            · Mumbai
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-xs uppercase tracking-luxe gold-underline transition-colors",
                  isActive ? "text-gold" : "text-foreground/80 hover:text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden lg:inline-flex items-center px-6 py-3 border border-gold text-gold text-xs uppercase tracking-luxe hover:bg-gold hover:text-primary-foreground transition-colors"
        >
          Plan Journey
        </Link>

        <button
          className="lg:hidden text-foreground p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <nav className="container flex flex-col py-6 gap-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "text-sm uppercase tracking-luxe",
                    isActive ? "text-gold" : "text-foreground/80"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center px-6 py-3 border border-gold text-gold text-xs uppercase tracking-luxe"
            >
              Plan Journey
            </Link>
            <a
              href={`tel:${BRAND.phoneDigits}`}
              className="text-xs text-muted-foreground"
            >
              {BRAND.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
