import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import jainLogo from "@/assets/jain-tours-logo.png";

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
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        solid
          ? "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
          : "bg-transparent border border-transparent"
      )}
    >
      {/* Hairline gold accent on scroll */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-opacity duration-700",
          solid ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "container flex items-center justify-between transition-all duration-300",
          "h-[60px] py-2 px-4 md:h-[70px] md:py-3 md:px-5 lg:h-20 lg:py-4 lg:px-6"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-gold/40 flex items-center justify-center bg-background overflow-hidden shadow-luxe group-hover:border-gold transition-colors">
              <img
                src={jainLogo}
                alt="Jain Tours & Travels logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute -inset-0.5 rounded-full border border-gold/0 group-hover:border-gold/30 group-hover:scale-110 transition-all duration-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-sm md:text-lg lg:text-xl tracking-wide text-foreground">
              Jain <span className="text-gold italic font-bold">Tours & Travels</span>
            </span>
            <span className="tracking-luxe uppercase text-muted-foreground mt-1 text-[8px] md:text-[9px] lg:text-[10px]">
              Mumbai ·
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-4 py-2 text-[11px] uppercase tracking-luxe transition-colors group font-medium",
                  isActive ? "text-gold" : "text-foreground/75 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="font-semibold">{l.label}</span>
                  <span
                    className={cn(
                      "absolute left-4 right-4 -bottom-0.5 h-px bg-gold transition-all duration-500 origin-left",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* CTA + phone */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href={`tel:${BRAND.phoneDigits}`}
            className="flex items-center gap-2 text-[11px] uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors"
            aria-label="Call us"
          >
            <Phone className="w-0 h-0" />
            <span className="tabular-nums">{BRAND.phoneDisplay}</span>
          </a>
          <Link
            to="/contact"
            className="relative inline-flex items-center px-6 py-2.5 text-[11px] uppercase tracking-luxe text-primary-foreground bg-gradient-to-r from-gold to-gold-deep hover:shadow-gold transition-all duration-500 rounded-full overflow-hidden group"
          >
            <span className="relative z-10">Plan Journey</span>
            <span className="absolute inset-0 bg-gradient-to-r from-gold-deep to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground relative w-11 h-11 flex items-center justify-center"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <Menu className={cn("absolute w-5 h-5 transition-all duration-300", open ? "opacity-0 rotate-90" : "opacity-100 rotate-0")} />
          <X className={cn("absolute w-5 h-5 transition-all duration-300", open ? "opacity-100 rotate-0" : "opacity-0 -rotate-90")} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden overflow-hidden border-t border-gold/10 bg-background/95 backdrop-blur-xl transition-all duration-500",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container flex flex-col py-6 gap-1">
          {links.map((l, idx) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${idx * 60}ms` : "0ms" }}
              className={({ isActive }) =>
                cn(
                  "py-3 px-2 text-sm uppercase tracking-luxe border-b border-border/30 transition-all duration-500",
                  open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
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
            className="mt-4 inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-gold to-gold-deep text-primary-foreground text-xs uppercase tracking-luxe rounded-full"
          >
            Plan Journey
          </Link>
          <a
            href={`tel:${BRAND.phoneDigits}`}
            className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-gold transition"
          >
            <Phone className="w-0 h-0" /> {BRAND.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
