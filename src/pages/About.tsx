import SiteLayout from "@/components/site/SiteLayout";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { BRAND } from "@/lib/brand";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Headphones,
  Wallet,
  Users,
  Star,
  Plane,
  Check,
  Linkedin,
  Instagram,
} from "lucide-react";

const FOUNDED = 2008;
const YEARS = new Date().getFullYear() - FOUNDED;

const heroImg =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1920";
const introImg =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1000";
const missionImg =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1400";
const ctaImg =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920";

const team = [
  {
    name: "Rajesh Jain",
    role: "Founder & Director",
    bio: "15+ years in travel. Personally oversees every major package to ensure quality.",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Priya Sharma",
    role: "Head of International Tours",
    bio: "Specialist in Europe and Southeast Asia. Loves crafting first-time international experiences.",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Amit Desai",
    role: "Customer Experience Lead",
    bio: "Your point of contact from booking to landing. Known for going the extra mile.",
    photo:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600",
  },
];

const whyCards = [
  { icon: ShieldCheck, title: "100% Trusted", text: "Verified packages, transparent pricing, and zero hidden charges — always." },
  { icon: MapPin, title: "Expert Local Knowledge", text: "Our team has personally explored every destination we offer. No guesswork, ever." },
  { icon: Headphones, title: "24/7 Support", text: "From the moment you book to the moment you're back home, we're always reachable." },
  { icon: Wallet, title: "Best Value Guaranteed", text: "Competitive pricing without compromising on quality. We believe great travel shouldn't break the bank." },
  { icon: Users, title: "Personalised Itineraries", text: "Every trip is tailored to your group, preferences, and pace — not a copy-paste package." },
  { icon: Star, title: "4.9★ Rated on Google", text: "Hundreds of happy travellers have shared their experiences — and we're proud of every review." },
];

const timeline = [
  { year: "2008", title: "The Beginning", text: "Jain Tours & Travels was founded in Mumbai with a simple vision: to make quality travel accessible to every Indian family. We started with domestic tours and a small but dedicated team." },
  { year: "2013", title: "Growing Our Reach", text: "We expanded into international tours, adding Southeast Asia, Europe, and the Middle East to our portfolio. Our client base grew through word of mouth and genuine care for every traveller." },
  { year: "2019", title: "Digital Transformation", text: "We embraced technology to serve our customers better — from online booking to AI-powered trip planning, making travel planning easier and more personalised than ever." },
  { year: "Today", title: "Trusted by Mumbai", text: "Today, Jain Tours & Travels stands as one of Mumbai's most reliable travel partners — offering curated packages, expert guidance, and end-to-end travel support for every kind of traveller." },
];

const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
};

const About = () => {
  useSeo({
    title: `About — ${BRAND.name}, Mumbai`,
    description: `Mumbai-based travel partner since ${FOUNDED}. ${BRAND.rating}★ rated, crafting personal journeys across India and the world.`,
    canonicalPath: "/about",
  });

  return (
    <SiteLayout>
      {/* SECTION 1 — HERO */}
      <section
        className="relative w-full h-[280px] md:h-[420px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(217 60% 12% / 0.45) 0%, hsl(217 60% 12% / 0.75) 100%), url('${heroImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Reveal className="text-center px-6 max-w-2xl">
          <p className="text-[12px] font-medium uppercase text-white/80 mb-4" style={{ letterSpacing: "0.2em" }}>
            Our Story
          </p>
          <h1 className="font-serif text-[32px] md:text-[52px] leading-tight text-white">
            About {BRAND.name}
          </h1>
          <p className="mt-4 text-[15px] md:text-[18px] font-light text-white/80 max-w-[560px] mx-auto">
            Mumbai's trusted travel partner since {FOUNDED} — crafting journeys that last a lifetime.
          </p>
          <p className="mt-5 text-[13px] text-white/60">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">About Us</span>
          </p>
        </Reveal>
      </section>

      {/* SECTION 2 — INTRO SPLIT */}
      <section className="py-[50px] md:py-[90px] px-5 md:px-0">
        <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img src={introImg} alt="Our team crafting journeys" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Est. {FOUNDED}
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2"
              style={{ transform: "translate(-20px, 20px)" }}
            >
              <Plane className="w-5 h-5 text-primary" />
              <div className="text-sm font-semibold text-foreground">500+ Happy Travellers</div>
            </div>
          </Reveal>

          <Reveal>
            <p className="text-[11px] font-medium uppercase text-primary mb-3" style={{ letterSpacing: "0.2em" }}>
              Who We Are
            </p>
            <h2 className="font-serif text-[26px] md:text-[38px] leading-tight text-foreground">
              Crafting Unforgettable Journeys from the Heart of Mumbai
            </h2>
            <div className="mt-6 space-y-5 text-[16px] text-muted-foreground" style={{ lineHeight: 1.8 }}>
              <p>
                {BRAND.name} is a Mumbai-based travel company passionate about creating seamless, memorable experiences for every traveller — whether you're exploring the snowy peaks of Kashmir, the golden beaches of Goa, or the iconic streets of Europe.
              </p>
              <p>
                Founded with a simple belief — that every journey should feel personal — we have grown into one of Mumbai's most trusted travel partners, serving families, couples, solo travellers, and corporate groups across India and the world.
              </p>
              <p>Every itinerary we design is built around you: your budget, your interests, your pace.</p>
            </div>
            <Link
              to="/destinations"
              className="mt-8 inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Explore Our Packages
            </Link>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3 — STATS */}
      <section className="bg-primary py-[50px]">
        <Reveal className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center">
            {[
              { n: "500+", l: "Happy Travellers" },
              { n: "10+", l: "Years of Experience" },
              { n: "100+", l: "Destinations Covered" },
              { n: "4.9★", l: "Google Rating" },
            ].map((s, i) => (
              <div key={s.l} className={`relative ${i > 0 ? "md:border-l md:border-white/20" : ""}`}>
                <div className="font-serif text-[36px] md:text-[48px] font-bold text-white leading-none">{s.n}</div>
                <div className="mt-3 text-[14px] text-white/75 uppercase" style={{ letterSpacing: "0.1em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* SECTION 4 — TIMELINE */}
      <section className="bg-secondary py-[50px] md:py-[90px] px-5 md:px-0">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-medium uppercase text-primary mb-3" style={{ letterSpacing: "0.2em" }}>
              Our Journey
            </p>
            <h2 className="font-serif text-[28px] md:text-[40px] leading-tight text-foreground">
              How We Started & Where We're Going
            </h2>
            <div className="mt-4 mx-auto h-[2px] w-10 bg-primary" />
          </Reveal>

          <div className="relative mt-16 max-w-4xl mx-auto">
            {/* Spine */}
            <div className="absolute top-0 bottom-0 left-4 md:left-1/2 w-[2px] bg-primary md:-translate-x-1/2" />

            <div className="space-y-10">
              {timeline.map((item, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <Reveal key={item.title} className="relative md:grid md:grid-cols-2 md:gap-12 items-center">
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 top-6 w-[14px] h-[14px] rounded-full bg-primary border-2 border-white -translate-x-1/2 z-10" />

                    <div className={`pl-12 md:pl-0 ${isLeft ? "md:pr-8 md:text-right" : "md:col-start-2 md:pl-8"}`}>
                      <div className="bg-white rounded-xl px-7 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                        <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                          {item.year}
                        </span>
                        <h3 className="font-serif text-[20px] text-foreground">{item.title}</h3>
                        <p className="mt-2 text-[15px] text-muted-foreground" style={{ lineHeight: 1.7 }}>{item.text}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHY CHOOSE US */}
      <section className="bg-background py-[50px] md:py-[90px] px-5 md:px-0">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-medium uppercase text-primary mb-3" style={{ letterSpacing: "0.2em" }}>
              Why Jain Tours
            </p>
            <h2 className="font-serif text-[28px] md:text-[40px] leading-tight text-foreground">
              What Makes Us Different
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map(({ icon: Icon, title, text }) => (
              <Reveal key={title}>
                <div className="group h-full bg-white border border-border rounded-xl p-7 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:border-primary hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300">
                  <Icon className="w-9 h-9 text-primary mb-5" strokeWidth={1.5} />
                  <h3 className="font-serif text-[20px] text-foreground">{title}</h3>
                  <p className="mt-2 text-[15px] text-muted-foreground" style={{ lineHeight: 1.7 }}>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — TEAM */}
      <section className="bg-secondary py-[50px] md:py-[90px] px-5 md:px-0">
        <div className="container">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-medium uppercase text-primary mb-3" style={{ letterSpacing: "0.2em" }}>
              The People Behind Your Journey
            </p>
            <h2 className="font-serif text-[28px] md:text-[40px] leading-tight text-foreground">Meet Our Team</h2>
            <p className="mt-3 text-base text-muted-foreground">
              Passionate travellers who turn your dreams into itineraries.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((m) => (
              <Reveal key={m.name}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.07)] h-full">
                  <div className="aspect-square overflow-hidden">
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-[18px] font-semibold text-foreground">{m.name}</h3>
                    <p className="mt-1 text-[13px] font-medium uppercase text-primary" style={{ letterSpacing: "0.08em" }}>
                      {m.role}
                    </p>
                    <p className="mt-3 text-[14px] text-muted-foreground" style={{ lineHeight: 1.6 }}>{m.bio}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <a href="#" aria-label="LinkedIn" className="text-primary hover:opacity-70 transition-opacity">
                        <Linkedin className="w-[18px] h-[18px]" />
                      </a>
                      <a href="#" aria-label="Instagram" className="text-primary hover:opacity-70 transition-opacity">
                        <Instagram className="w-[18px] h-[18px]" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — MISSION & VALUES */}
      <section className="grid lg:grid-cols-2">
        <div className="min-h-[320px] lg:min-h-[520px]">
          <img src={missionImg} alt="Our mission" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="bg-ink text-white px-6 py-16 md:px-16 md:py-20 flex items-center">
          <Reveal>
            <p className="text-[11px] font-medium uppercase text-white/70 mb-3" style={{ letterSpacing: "0.2em" }}>
              Our Mission
            </p>
            <h2 className="font-serif text-[28px] md:text-[36px] leading-tight text-white">
              Travel That Feels Personal
            </h2>
            <p className="mt-5 text-[15px] md:text-base text-white/80" style={{ lineHeight: 1.8 }}>
              We exist to make every traveller feel seen, heard, and cared for — from the first enquiry to the final goodbye at the airport. Travel is not a transaction for us. It's a relationship.
            </p>
            <div className="mt-6 h-[2px] w-[50px] bg-white" />
            <ul className="mt-6 space-y-3">
              {[
                "Honesty in every transaction",
                "Quality without compromise",
                "Personalised attention always",
                "Experiences over itineraries",
              ].map((v) => (
                <li key={v} className="flex items-center gap-3 text-[16px] font-medium text-white">
                  <Check className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
                  {v}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* SECTION 8 — CTA BANNER */}
      <section
        className="relative py-20 px-5 text-center"
        style={{
          backgroundImage: `linear-gradient(hsl(217 100% 14% / 0.78), hsl(217 100% 14% / 0.78)), url('${ctaImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Reveal className="max-w-2xl mx-auto">
          <h2 className="font-serif text-[28px] md:text-[42px] leading-tight text-white">
            Ready to Start Your Next Journey?
          </h2>
          <p className="mt-4 text-[16px] md:text-[18px] font-light text-white/80">
            Let us handle everything while you focus on making memories.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-primary rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              View Our Packages
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-white text-white rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
};

export default About;
