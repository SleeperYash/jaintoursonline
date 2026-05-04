import {
  Plane, Hotel, Ship, Globe, Heart, Briefcase, FileCheck, ShieldCheck,
  Car, Bus, Users, GraduationCap, Headphones, MapPin, Ticket, Building2,
} from "lucide-react";

export const serviceGroups = [
  {
    title: "Air & Hotels",
    items: [
      { icon: Plane, name: "Domestic & International Flights", desc: "Best fares, premium-cabin upgrades and 24×7 reissue support." },
      { icon: Hotel, name: "Hotel Bookings", desc: "Curated 4★ and 5★ properties globally, including villas and resorts." },
      { icon: Ticket, name: "Online Ticketing", desc: "Easy & quick booking for flights, trains and attractions." },
    ],
  },
  {
    title: "Holidays & Cruises",
    items: [
      { icon: Globe, name: "International Holidays", desc: "Maldives, Sri Lanka, Dubai, Europe, Far East and the Americas." },
      { icon: MapPin, name: "Domestic Holidays", desc: "South India, Kashmir, Ladakh, Northeast and Goa packages." },
      { icon: Ship, name: "Cruise Bookings", desc: "Cordelia, Royal Caribbean, MSC, NCL and luxury liners." },
      { icon: Heart, name: "Honeymoon Specialists", desc: "Romantic add-ons, private dinners and signature touches." },
    ],
  },
  {
    title: "Corporate & Group",
    items: [
      { icon: Briefcase, name: "Corporate Travel", desc: "Managed business travel, MICE and offsite planning." },
      { icon: Users, name: "Group & Family Travel", desc: "Custom group itineraries with dedicated tour leaders." },
      { icon: GraduationCap, name: "Student Travel", desc: "Educational tours and student exchange travel support." },
    ],
  },
  {
    title: "Visa & Insurance",
    items: [
      { icon: FileCheck, name: "Visa Support", desc: "Tourist, business and Schengen visa assistance end-to-end." },
      { icon: ShieldCheck, name: "Travel Insurance", desc: "International and group employee insurance plans." },
      { icon: Building2, name: "Holiday Visa Packages", desc: "Bundled holiday + visa for stress-free planning." },
    ],
  },
  {
    title: "Ground & Support",
    items: [
      { icon: Car, name: "Car Rental", desc: "Self-drive and chauffeured cars across India and overseas." },
      { icon: Bus, name: "Bus Booking & Routes", desc: "Inter-city and tourist bus reservations." },
      { icon: Headphones, name: "24×7 Support", desc: "We pick up — day or night, wherever you are." },
    ],
  },
] as const;
