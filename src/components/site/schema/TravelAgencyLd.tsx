import JsonLd from "@/components/site/JsonLd";
import { BRAND } from "@/lib/brand";

const SITE = "https://jaintoursonline.com";

const SERVICE_AREAS = [
  "Mumbai",
  "Navi Mumbai",
  "Thane",
  "Mira Road",
  "Borivali",
  "Kandivali",
  "Malad",
  "Andheri",
  "Pan India",
];

/**
 * TravelAgency (LocalBusiness) structured data.
 * Use one per page; pass a unique `id` when multiple LD blocks are on the same page.
 */
export const TravelAgencyLd = ({
  id = "ld-travel-agency",
  pagePath,
}: {
  id?: string;
  pagePath?: string;
}) => {
  const url = pagePath ? `${SITE}${pagePath}` : SITE;

  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE}/#travelagency`,
    name: BRAND.name,
    alternateName: BRAND.shortName,
    description:
      "Mumbai-based travel agency offering curated domestic & international tour packages, honeymoons, cruises, visa services, flights, hotels and travel insurance.",
    url,
    telephone: BRAND.phone,
    email: BRAND.email,
    image: `${SITE}/favicon.svg`,
    logo: `${SITE}/favicon.svg`,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Shop No 06, 1st Floor, Vinay Kumkum Shopping Arcade, above Canara Bank, Kakaji Nagar, Jawahar Nagar",
      addressLocality: "Goregaon West",
      addressRegion: "Maharashtra",
      postalCode: "400104",
      addressCountry: "IN",
    },
    areaServed: SERVICE_AREAS.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "19:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BRAND.rating,
      reviewCount: BRAND.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [] as string[],
  };

  return <JsonLd id={id} data={data} />;
};

export default TravelAgencyLd;