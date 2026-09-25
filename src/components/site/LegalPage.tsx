import { ReactNode } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { useSeo } from "@/hooks/useSeo";

export type LegalSection = { title: string; body: ReactNode };

const LegalPage = ({ title, crumb, path, description, updated, sections }: {
  title: string; crumb: string; path: string; description: string; updated: string; sections: LegalSection[];
}) => {
  useSeo({ title: `${title} | Jain Tours & Travels`, description, canonicalPath: path });
  return (
    <SiteLayout>
      <PageHero title={title} crumb={crumb} />
      <article className="container max-w-3xl py-14 md:py-20">
        <p className="text-xs uppercase tracking-luxe text-muted-foreground mb-10">Last updated: {updated}</p>
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-2xl text-foreground mb-3">{s.title}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_strong]:text-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
};

export default LegalPage;
