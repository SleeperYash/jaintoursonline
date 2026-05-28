import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import InquiryBand from "@/components/site/InquiryBand";
import { serviceGroups } from "@/data/services";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";

const Services = () => {
  useSeo({
    title: "Travel Services: Flights, Visas & Cruises | Jain Tours",
    description:
      "Full-service travel partner: flights, hotels, visas, cruises, corporate travel, insurance and 24×7 support. Mumbai-based, globally trusted.",
    canonicalPath: "/services",
  });

  return (
    <SiteLayout>
      <PageHero title="OUR SERVICES" crumb="Services" />

      <section className="container py-16 md:py-24 space-y-20">
        {serviceGroups.map((group) => (
          <ServiceGroup key={group.title} group={group} />
        ))}
      </section>

      <InquiryBand />
    </SiteLayout>
  );
};

const ServiceGroup = ({ group }: { group: typeof serviceGroups[number] }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal">
      <div className="flex items-baseline justify-between mb-10 border-b border-border/60 pb-5">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground">{group.title}</h2>
        <span className="text-xs tracking-luxe uppercase text-gold">{group.items.length} services</span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.items.map(({ icon: Icon, name, desc }) => (
          <article key={name} className="bg-card border border-border/60 p-8 hover:border-gold/40 transition-colors">
            <Icon className="w-7 h-7 text-gold mb-5" strokeWidth={1.25} />
            <h3 className="font-serif text-xl text-foreground">{name}</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light">{desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Services;
