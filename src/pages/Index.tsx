import SiteLayout from "@/components/site/SiteLayout";
import HeroLuxe from "@/components/site/home/HeroLuxe";
import FeaturedDestinations from "@/components/site/home/FeaturedDestinations";
import HowItWorks from "@/components/site/home/HowItWorks";
import ReviewsSlider from "@/components/site/home/ReviewsSlider";
import InquiryBand from "@/components/site/InquiryBand";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useSeo({
    title: "Jain Tours & Travels — Curated Luxury Journeys from Mumbai",
    description:
      "Bespoke honeymoons, family escapes, cruises and corporate journeys. Rated 4.9★ by 142+ guests. Mumbai-based, 24×7 support.",
    canonicalPath: "/",
  });

  return (
    <SiteLayout>
      <HeroLuxe />
      <FeaturedDestinations />
      <HowItWorks />
      <ReviewsSlider />
      <InquiryBand />
    </SiteLayout>
  );
};

export default Index;
