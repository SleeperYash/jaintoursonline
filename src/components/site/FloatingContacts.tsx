import { Phone, MessageCircle } from "lucide-react";
import { BRAND, waLink } from "@/lib/brand";

const FloatingContacts = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Jain Tours"
        className="w-14 h-14 rounded-full bg-[hsl(140_60%_38%)] shadow-luxe flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
      <a
        href={`tel:${BRAND.phoneDigits}`}
        aria-label="Call Jain Tours"
        className="w-14 h-14 rounded-full bg-gold shadow-gold flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
};

export default FloatingContacts;
