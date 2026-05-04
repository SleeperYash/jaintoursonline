import SiteLayout from "@/components/site/SiteLayout";
import SectionTitle from "@/components/site/SectionTitle";
import InquiryBand from "@/components/site/InquiryBand";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { BRAND } from "@/lib/brand";
import { Heart, Compass, Headphones, ShieldCheck } from "lucide-react";
import kerala from "@/assets/hero-kerala.jpg";

const About = () => {
  useSeo({
    title: "About — Jain Tours & Travels, Mumbai",
    description:
      "Mumbai-based travel atelier crafting bespoke holidays since 2008. Led by Dinesh Jain. 4.9★ rated, with quiet, considered service.",
    canonicalPath: "/about",
  });

  const ref = useReveal<HTMLDivElement>();
  const ref2 = useReveal<HTMLDivElement>();

  const values = [
    { icon: Heart, title: "Personal", text: "One curator, your point of contact from first idea to safe return." },
    { icon: Compass, title: "Considered", text: "Itineraries paced for the way you actually like to travel." },
    { icon: Headphones, title: "Always Available", text: "24×7 reachable — even at midnight, even abroad." },
    { icon: ShieldCheck, title: "Trusted", text: "Transparent pricing, honest advice, no hidden upsells." },
  ];

  return (
    <SiteLayout>
      <header className="pt-40 pb-20 container">
        <SectionTitle
          eyebrow="Our Story"
          title="A small Mumbai atelier with a long memory."
          description="We've been planning quietly extraordinary trips out of Goregaon for over a decade — for honeymooners, growing families, retiring couples and corporate teams alike."
        />
      </header>

      <section className="container pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div ref={ref} className="reveal aspect-[4/5] overflow-hidden">
          <img src={kerala} alt="A Jain Tours curated journey" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div ref={ref2} className="reveal">
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight">
            Travel, the way it used to feel.
          </h2>
          <div className="mt-8 space-y-5 text-muted-foreground font-light leading-relaxed">
            <p>
              {BRAND.name} was founded with a simple idea: that a holiday should
              feel personal, not packaged. That you should know the name of the
              person planning your trip — and that they should pick up the phone
              when something matters.
            </p>
            <p>
              Today, led by <span className="text-foreground">Dinesh Jain</span> and
              his team, we plan over a thousand journeys a year. From overwater
              villas in the Maldives to tea estates in Munnar, every itinerary is
              hand-built for the family it's meant for.
            </p>
            <p>
              We are quietly proud of our 4.9★ rating on Google — but we measure
              ourselves by the families who book again, and the children who grow
              up with us.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-border/60 py-24">
        <div className="container">
          <SectionTitle eyebrow="What we believe" title="Four quiet promises." />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 border border-border/60">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card p-9">
                <Icon className="w-7 h-7 text-gold mb-5" strokeWidth={1.25} />
                <h3 className="font-serif text-2xl text-foreground">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InquiryBand />
    </SiteLayout>
  );
};

export default About;
