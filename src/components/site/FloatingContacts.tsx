import { Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import HolidayPlanner from "./HolidayPlanner";

const FloatingContacts = () => {
  return (
    <>
      <HolidayPlanner />
      <div
        className="fixed right-4 md:right-6 z-40"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
      <a
        href={`tel:${BRAND.phoneDigits}`}
        aria-label="Call Jain Tours"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold shadow-gold flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
      >
        <Phone className="w-5 h-5 md:w-6 md:h-6" />
      </a>
      </div>
    </>
  );
};

export default FloatingContacts;
