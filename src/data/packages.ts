export type Package = {
  id: string;
  destinationSlug: string;
  title: string;
  duration: string;
  category: "Honeymoon" | "Family" | "Group" | "Corporate" | "Cruise" | "All-Inclusive";
  fromPrice: string;
  image: string;
};

import { destinations } from "./destinations";

const byImg = (slug: string) =>
  destinations.find((d) => d.slug === slug)?.image as string;

export const packages: Package[] = [
  { id: "p1", destinationSlug: "maldives", title: "Maldives Overwater Romance", duration: "5N / 6D", category: "Honeymoon", fromPrice: "₹ 1,85,000", image: byImg("maldives") },
  { id: "p2", destinationSlug: "bali", title: "Bali Honeymoon in a Private Villa", duration: "6N / 7D", category: "Honeymoon", fromPrice: "₹ 1,15,000", image: byImg("bali") },
  { id: "p3", destinationSlug: "kerala", title: "Kerala Backwaters & Hills", duration: "6N / 7D", category: "Family", fromPrice: "₹ 20,000", image: byImg("kerala") },
  { id: "p4", destinationSlug: "sri-lanka", title: "Classical Sri Lanka", duration: "7N / 8D", category: "Family", fromPrice: "₹ 78,000", image: byImg("sri-lanka") },
  { id: "p5", destinationSlug: "europe", title: "Grand Europe — 4 Countries", duration: "10N / 11D", category: "Group", fromPrice: "₹ 2,75,000", image: byImg("europe") },
  { id: "p6", destinationSlug: "dubai", title: "Dubai Skyline & Desert", duration: "4N / 5D", category: "Family", fromPrice: "₹ 58,000", image: byImg("dubai") },
  { id: "p7", destinationSlug: "goa", title: "Cordelia India Coastal Cruise", duration: "4N / 5D", category: "Cruise", fromPrice: "₹ 15,000", image: byImg("goa") },
  { id: "p8", destinationSlug: "europe", title: "Mediterranean Signature Cruise", duration: "8N / 9D", category: "Cruise", fromPrice: "₹ 1,95,000", image: byImg("europe") },
  { id: "p9", destinationSlug: "dubai", title: "Corporate Off-site · Dubai", duration: "3N / 4D", category: "Corporate", fromPrice: "On request", image: byImg("dubai") },
  { id: "p10", destinationSlug: "maldives", title: "All-Inclusive Maldives Family Resort", duration: "5N / 6D", category: "All-Inclusive", fromPrice: "₹ 2,15,000", image: byImg("maldives") },
  { id: "p11", destinationSlug: "sri-lanka", title: "Sri Lanka MICE Group Tour", duration: "5N / 6D", category: "Group", fromPrice: "On request", image: byImg("sri-lanka") },
  { id: "p12", destinationSlug: "europe", title: "Swiss Alps Family Escape", duration: "7N / 8D", category: "Family", fromPrice: "₹ 2,25,000", image: byImg("europe") },
];

export const packageCategories = [
  "All",
  "Honeymoon",
  "Family",
  "Group",
  "Corporate",
  "Cruise",
  "All-Inclusive",
] as const;
