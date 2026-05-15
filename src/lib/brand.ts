// Shared brand constants for Jain Tours & Travels
export const BRAND = {
  name: "Jain Tours & Travels",
  shortName: "Jain Tours",
  phone: "+91 98212 35678",
  phoneDigits: "919821235678", // for tel: and wa.me
  phoneDisplay: "+91 98212 35678",
  whatsappMessage: "Hello Jain Tours, I'd like to plan a journey.",
  email: "jaintours.travels@gmail.com",
  address: "Shop No 06, 1st Floor, Vinay Kumkum Shopping Arcade, above Canara Bank, Kakaji Nagar, Jawahar Nagar, Goregaon West, Mumbai, Maharashtra 400104",
  shortAddress: "Goregaon West, Mumbai",
  hours: "Open 11 am · Closes 7 pm",
  rating: 4.9,
  reviewCount: 142,
  tagline: "Curated Journeys. Crafted Memories.",
} as const;

export const waLink = (msg: string = BRAND.whatsappMessage) =>
  `https://wa.me/${BRAND.phoneDigits}?text=${encodeURIComponent(msg)}`;
