// Real client travel photos with associated reviews/destinations
import bali from "@/assets/clients/bali-coconut.png";
import dubaiGarden from "@/assets/clients/dubai-miracle-garden.png";
import dubaiDesert1 from "@/assets/clients/dubai-desert-1.png";
import dubaiDesert2 from "@/assets/clients/dubai-desert-2.png";
import bangkok from "@/assets/clients/bangkok-baiyoke.png";
import thailandLights from "@/assets/clients/thailand-kingdom-lights.png";
import corporate from "@/assets/clients/corporate-meet.png";
import kashmirHotel from "@/assets/clients/kashmir-grand-rayan.png";
import kashmirSnow1 from "@/assets/clients/kashmir-snow-1.png";
import kashmirSnow2 from "@/assets/clients/kashmir-snow-2.png";

export type ClientReview = {
  image: string;
  destination: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
};

export const clientReviews: ClientReview[] = [
  {
    image: bali,
    destination: "Bali, Indonesia",
    name: "Priya Mehta",
    initials: "PM",
    rating: 5,
    date: "8 months ago",
    text: "Our Bali honeymoon was beyond our expectations — coconuts on the beach, private villa, every detail handled with care. Truly the team thinks of everything.",
    verified: true,
  },
  {
    image: dubaiGarden,
    destination: "Dubai Miracle Garden, UAE",
    name: "Rohit Sharma",
    initials: "RS",
    rating: 5,
    date: "1 year ago",
    text: "Family trip to Dubai — the Miracle Garden was magical. Itinerary was perfectly paced, hotels premium and Dinesh ji was a call away the entire time.",
    verified: true,
  },
  {
    image: dubaiDesert1,
    destination: "Dubai Desert Safari",
    name: "Anil & Meera Kapoor",
    initials: "AK",
    rating: 5,
    date: "10 months ago",
    text: "Sunset desert safari was the highlight. From visa to dune-bashing, the team handled everything seamlessly. Already planning our next one with them.",
    verified: true,
  },
  {
    image: kashmirSnow1,
    destination: "Kashmir, India",
    name: "Vikram Patel",
    initials: "VP",
    rating: 5,
    date: "3 months ago",
    text: "Kashmir in winter — snow, warm hosts, and a flawless itinerary. Stayed at lovely properties and every transfer was on time. Highly recommend.",
    verified: true,
  },
  {
    image: thailandLights,
    destination: "Bangkok, Thailand",
    name: "Sneha Iyer",
    initials: "SI",
    rating: 5,
    date: "6 months ago",
    text: "Kingdom of Lights at night was unreal. The Thailand package balanced city, culture and nightlife perfectly. Personal attention throughout.",
    verified: true,
  },
  {
    image: bangkok,
    destination: "Baiyoke Sky, Bangkok",
    name: "Mehul Shah",
    initials: "MS",
    rating: 5,
    date: "10 months ago",
    text: "Loved every moment in Bangkok. Hotels, transfers, sightseeing — handled like clockwork. Visa was sorted in days. Will book again.",
    verified: true,
  },
  {
    image: kashmirSnow2,
    destination: "Gulmarg, Kashmir",
    name: "Kavita R.",
    initials: "KR",
    rating: 5,
    date: "1 year ago",
    text: "First-time skiing in Gulmarg and the team made it stress-free — gear, guide, hotel, all arranged. Transparent pricing and very kind staff.",
    verified: true,
  },
  {
    image: corporate,
    destination: "Annual Partner Meet",
    name: "Noise India Team",
    initials: "NI",
    rating: 5,
    date: "5 months ago",
    text: "Our annual partner meet was executed flawlessly — venue, AV, F&B and ground transport all perfectly synchronized. A true professional outfit.",
    verified: true,
  },
  {
    image: kashmirHotel,
    destination: "Group Tour, Kashmir",
    name: "Yash & Family",
    initials: "Y",
    rating: 5,
    date: "2 years ago",
    text: "Whether day or night, whenever we needed help they were there. Caring towards the client and absolutely professional. Totally recommend.",
    verified: true,
  },
  {
    image: dubaiDesert2,
    destination: "Dubai, UAE",
    name: "Sharma Family",
    initials: "SF",
    rating: 5,
    date: "7 months ago",
    text: "Multi-generational Dubai trip with elders and kids — every age group was looked after. Thoughtful planning is what sets this team apart.",
    verified: true,
  },
];
