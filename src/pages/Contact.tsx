import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import InquiryForm from "@/components/site/InquiryForm";
import { BRAND, waLink } from "@/lib/brand";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { Phone, MapPin, Mail, Clock, MessageCircle } from "lucide-react";

const Contact = () => {
  useSeo({
    title: "Contact Jain Tours & Travels — Mumbai",
    description:
      "Speak to a Jain Tours travel curator. Call, WhatsApp or send an enquiry — we reply within hours, 24×7. Office in Goregaon West, Mumbai.",
    canonicalPath: "/contact",
  });

  const ref = useReveal<HTMLDivElement>();

  const items = [
    { icon: Phone, label: "Call us", value: BRAND.phoneDisplay, href: `tel:${BRAND.phoneDigits}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with a curator", href: waLink() },
    { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: Clock, label: "Hours", value: BRAND.hours, href: undefined },
  ];

  return (
    <SiteLayout>
      <PageHero title="CONTACT US" crumb="Contact" />

      <section className="container py-16 md:py-24 grid lg:grid-cols-5 gap-16">
        <div ref={ref} className="reveal lg:col-span-3 bg-card border border-border/60 p-8 md:p-12">
          <h2 className="font-serif text-3xl text-foreground mb-2">Send an enquiry</h2>
          <p className="text-sm text-muted-foreground mb-10">We reply within a few hours, every day.</p>
          <InquiryForm />
        </div>

        <aside className="lg:col-span-2 space-y-10">
          <div>
            <p className="text-xs tracking-luxe uppercase text-gold mb-4">Reach us directly</p>
            <h3 className="font-serif text-3xl text-foreground">Always a real person.</h3>
            <p className="mt-4 text-muted-foreground font-light leading-relaxed">
              Day or night — even mid-trip — there is always a team member at the other end.
            </p>
          </div>

          <ul className="space-y-px bg-border/60 border border-border/60">
            {items.map(({ icon: Icon, label, value, href }) => {
              const Inner = (
                <div className="bg-card p-6 flex gap-4 items-start hover:bg-secondary transition-colors">
                  <Icon className="w-5 h-5 text-gold mt-1 shrink-0" strokeWidth={1.25} />
                  <div>
                    <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">{label}</p>
                    <p className="text-sm text-foreground mt-1">{value}</p>
                  </div>
                </div>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">
                      {Inner}
                    </a>
                  ) : Inner}
                </li>
              );
            })}
          </ul>

          <div className="bg-card border border-border/60 p-7">
            <p className="text-[10px] uppercase tracking-luxe text-gold mb-3">Visit our office</p>
            <p className="text-sm text-foreground/90 leading-relaxed flex gap-3">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              {BRAND.address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center text-xs uppercase tracking-luxe text-gold gold-underline"
            >
              Open in Google Maps
            </a>
          </div>
        </aside>
      </section>

      <section className="container pb-24">
        <div className="aspect-[16/7] w-full overflow-hidden border border-border/60 bg-card">
          <iframe
            title="Jain Tours office location"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(BRAND.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full grayscale-[0.6] contrast-110"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
