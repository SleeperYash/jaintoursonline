import { useReveal } from "@/hooks/useReveal";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

const SectionTitle = ({ eyebrow, title, description, align = "center" }: SectionTitleProps) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p className="text-xs tracking-luxe uppercase text-gold mb-4">{eyebrow}</p>
      )}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base text-muted-foreground font-light leading-relaxed">
          {description}
        </p>
      )}
      <div className={`mt-6 h-px w-16 bg-gold ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
};

export default SectionTitle;
