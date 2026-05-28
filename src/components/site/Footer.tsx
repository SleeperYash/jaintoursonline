import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Star } from "lucide-react";
import ManageDestinationDialog from "@/components/site/ManageDestinationDialog";
import { BRAND, waLink } from "@/lib/brand";
import jainLogo from "@/assets/jain-tours-logo.jpeg";

const InstagramIcon = () => (
  <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#ig-grad)" />
    <rect x="8" y="8" width="16" height="16" rx="5" fill="none" stroke="#fff" strokeWidth="2" />
    <circle cx="16" cy="16" r="4" fill="none" stroke="#fff" strokeWidth="2" />
    <circle cx="22" cy="10" r="1.4" fill="#fff" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
    <rect x="1" y="6" width="30" height="20" rx="5" fill="#FF0000" />
    <polygon points="13,11 23,16 13,21" fill="#fff" />
  </svg>
);

const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border/60 bg-ink mt-32">
      <div className="container py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 pt-[60px]">
        <div>
          <Link to="/" className="block" aria-label={BRAND.name}>
            <img
              src={jainLogo}
              alt={`${BRAND.name} logo`}
              className="w-56 md:w-64 h-auto rounded-lg bg-white p-3 shadow-luxe"
            />
          </Link>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-light text-slate-300">
            Curating extraordinary journeys for discerning travellers across India and the world.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.instagram.com/jain_tours_n_travels?igsh=MWR6aHN0bjR1M2U0YQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:scale-110 transition-transform"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://youtube.com/@jaintours99?si=rNeje8McJxUIPV8n"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:scale-110 transition-transform"
            >
              <YouTubeIcon />
            </a>
          </div>
          <div className="mt-5 flex items-center gap-2 text-rating-star">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-xs text-muted-foreground ml-2 text-slate-300">
              {BRAND.rating} · {BRAND.reviewCount} reviews
            </span>
          </div>
        </div>

        <div>
          <h4 className="uppercase tracking-luxe mb-6 text-sm text-teal-400">Explore</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            
            <li><Link to="/destinations" className="hover:text-foreground transition text-slate-300">Destinations</Link></li>
            <li><Link to="/services" className="hover:text-foreground transition text-slate-300">Services</Link></li>
            <li><Link to="/reviews" className="hover:text-foreground transition text-slate-300">Reviews</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition text-slate-300">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="uppercase tracking-luxe mb-6 text-sm text-teal-400">Services</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="text-slate-300">International & Domestic Holidays</li>
            <li className="text-slate-300">Honeymoon Packages</li>
            <li className="text-slate-300">Cruise Bookings</li>
            <li className="text-slate-300">Corporate Travel</li>
            <li className="text-slate-300">Visa & Travel Insurance</li>
          </ul>
        </div>

        <div>
          <h4 className="uppercase tracking-luxe mb-6 text-sm text-teal-400">Reach Us</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
              <span className="leading-relaxed text-slate-300">{BRAND.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 border-sky-300 text-teal-400" />
              <a href={`tel:${BRAND.phoneDigits}`} className="hover:text-foreground text-slate-300">{BRAND.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-foreground text-slate-300">{BRAND.email}</a>
            </li>
            <li className="flex gap-3">
              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
              <span className="text-slate-300">{BRAND.hours}</span>
            </li>
          </ul>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center px-5 py-2.5 border border-gold/50 text-gold text-[11px] uppercase tracking-luxe hover:bg-gold hover:text-primary-foreground transition border-sky-300 bg-sky-600 text-black"
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="text-slate-300">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <ManageDestinationDialog
              allowSwitcher
              triggerLabel="Manage"
              triggerClassName="text-[10px] uppercase tracking-luxe text-foreground/30 hover:text-gold inline-flex items-center gap-1.5 transition-colors"
            />
            <p className="tracking-wide text-slate-300">Crafted with care in Mumbai · India</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;