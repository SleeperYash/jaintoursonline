import SiteLayout from "@/components/site/SiteLayout";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { BRAND } from "@/lib/brand";
import { Link } from "react-router-dom";
import {
  Smile,
  Bookmark,
  Users,
  ClipboardList,
  Contact,
  IndianRupee,
  Coffee,
  Globe,
  CheckCircle2,
  CircleDashed,
  Gem,
  Handshake,
} from "lucide-react";

const FOUNDED = 1996;
const YEARS = new Date().getFullYear() - FOUNDED;

const heroImg =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1920";
const whoImg =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200";

const whatWeDoImgs = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600", // Paris
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=600", // Spain
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600", // Bali
  "/src/assets/rajasthan-jaipur.jpg", // Jaipur
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600", // London
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=600", // Japan
  "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=600", // Vietnam
  "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&q=80&w=600", // Louvre
  "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&q=80&w=600", // Greece
];

const believeImgs = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&q=80&w=600",
];

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center mb-12 md:mb-16">
    <h2 className="font-serif text-[26px] md:text-[36px] tracking-[0.18em] text-foreground inline-block">
      {children}
    </h2>
    <div className="mt-3 mx-auto h-[3px] w-[120px] bg-primary" />
  </div>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-serif text-[22px] tracking-[0.15em] text-foreground mb-6 md:text-sm">
    {children}
  </h3>
);

const IconStat = ({
  Icon,
  title,
  sub,
}: {
  Icon: typeof Smile;
  title: string;
  sub: string;
}) => (
  <div className="items-start justify-start flex flex-row gap-[12px]">
    <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
      <Icon className="w-5 h-5" strokeWidth={2} />
    </span>
    <div className="leading-snug">
      <div className="text-[15px] font-medium text-foreground md:text-xs">{title}</div>
      <div className="text-[15px] text-foreground/80 md:text-xs">{sub}</div>
    </div>
  </div>
);

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
      {/* HERO */}
      <section
        className="relative w-full h-[240px] md:h-[360px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(217 60% 12% / 0.5), hsl(217 60% 12% / 0.75)), url('${heroImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Reveal className="text-center px-6">
          <h1 className="font-serif text-[32px] md:text-[48px] text-white tracking-[0.15em]">
            ABOUT {BRAND.name.toUpperCase()}
          </h1>
          <p className="mt-3 text-[13px] text-white/70">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">About Us</span>
          </p>
        </Reveal>
      </section>

      {/* SECTION 1 — ABOUT US / WHO WE ARE */}
      <section className="bg-background py-16 md:py-24 px-5">
        <div className="container max-w-6xl">
          <Reveal><SectionHeading>ABOUT US</SectionHeading></Reveal>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <SubHeading>WHO WE ARE?</SubHeading>
              <div className="space-y-5 text-[15px] md:text-[16px] text-foreground/85" style={{ lineHeight: 1.85 }}>
                <p>
                  Founded in {FOUNDED} and proudly completing {YEARS} incredible years,{" "}
                  <strong className="text-foreground">{BRAND.name}</strong> is based in Mumbai and driven by Mr. Dinesh Punamia. Our mission has always been simple — to make travel
                  planning, booking, and organizing effortless for every traveller.
                </p>
                <p>
                  With thoughtfully curated group tours, seamless booking experiences, and a focus on
                  comfort and trust, we help our guests explore the world without hassle. Backed by
                  innovation, genuine care, and years of industry expertise,{" "}
                  <strong className="text-foreground">{BRAND.name}</strong> is your trusted companion in creating
                  unforgettable journeys — easy, joyful, and truly memorable.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                <IconStat Icon={Bookmark} title={`${YEARS}+ Years`} sub="of experience" />
                <IconStat Icon={Smile} title="5000+" sub="Happy Families" />
                <IconStat Icon={ClipboardList} title="100+ Superb" sub="Itineraries" />
              </div>
            </Reveal>

            <Reveal className="lg:pt-2">
              <div className="overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <img src={whoImg} alt={`${BRAND.name} team`} className="w-full h-[360px] md:h-[460px] object-cover border-8" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT WE DO */}
      <section className="bg-background py-16 md:py-24 px-5 border-t border-border/60">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {whatWeDoImgs.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl">
                    <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <SubHeading>WHAT WE DO?</SubHeading>
              <div className="space-y-5 text-[15px] md:text-[16px] text-foreground/85" style={{ lineHeight: 1.85 }}>
                <p>
                  {BRAND.name} is your one-stop travel partner, proudly crafting memorable vacations
                  for thousands of families since {FOUNDED}.
                </p>
                <p>
                  We specialize in all-inclusive group tours guided by experienced in-house tour
                  managers, ensuring a smooth and enjoyable experience every step of the way. For
                  those seeking personalised getaways, we also offer tailor-made holidays based on
                  individual preferences, themes, and travel styles.
                </p>
                <p>
                  Our signature touch includes delicious vegetarian and Jain-friendly meals, along
                  with a variety of international cuisines to suit every palate.
                </p>
                <p>
                  Whether you're planning a honeymoon, self-drive adventure, or need help with
                  flights, visas, cruises, or hotel bookings — {BRAND.name} has you covered with
                  reliable, end-to-end services.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                <IconStat Icon={Contact} title="Expert in-house" sub="tour managers" />
                <IconStat Icon={IndianRupee} title="Budget-friendly" sub="travel packages" />
                <IconStat Icon={Coffee} title="Pure vegetarian" sub="& Jain meals" />
                <IconStat Icon={Globe} title="All-inclusive" sub="global tours" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT WE BELIEVE */}
      <section className="bg-background py-16 md:py-24 px-5 border-t border-border/60">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <SubHeading>WHAT WE BELIEVE?</SubHeading>
              <div className="space-y-5 text-[15px] md:text-[16px] text-foreground/85" style={{ lineHeight: 1.85 }}>
                <p>
                  At {BRAND.name}, we believe that travel inspires growth, and great journeys create
                  lasting value. For us, it's more than a business — it's a passion rooted in care,
                  trust, and meaningful connections.
                </p>
                <p>
                  As a family-run company, we prioritize transparency, personalized service, and
                  delivering quality travel experiences to every guest. Our loyal customers are our
                  proudest ambassadors, and our dedicated team is the heart of everything we do.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
                <IconStat Icon={CheckCircle2} title="Trust-driven" sub="service" />
                <IconStat Icon={CircleDashed} title="Transparent" sub="pricing" />
                <IconStat Icon={Gem} title="Quality-crafted" sub="tours" />
                <IconStat Icon={Handshake} title="End-to-end" sub="support" />
              </div>
            </Reveal>

            <Reveal>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {believeImgs.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl">
                    <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 4 — OUR STRENGTH */}
      <section className="bg-secondary py-16 md:py-24 px-5">
        <div className="container max-w-6xl">
          <Reveal><SectionHeading>OUR STRENGTH</SectionHeading></Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
            {[
              { n: `${YEARS}+`, l: "Years Experience" },
              { n: "5000+", l: "Happy Families" },
              { n: "100+", l: "Superb Itineraries" },
              { n: "50+", l: "Team of Professionals" },
            ].map((s) => (
              <Reveal key={s.l}>
                <div className="font-serif text-[40px] md:text-[56px] font-bold text-foreground leading-none">{s.n}</div>
                <div className="mt-3 text-[14px] md:text-[15px] text-foreground/75">{s.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;