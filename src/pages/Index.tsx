import SiteLayout from "@/components/site/SiteLayout";
import HeroLuxe from "@/components/site/home/HeroLuxe";
import HeroTrustBadges from "@/components/site/home/HeroTrustBadges";
import TopTrending from "@/components/site/home/TopTrending";
import DealsYouCantMiss from "@/components/site/home/DealsYouCantMiss";
import HandpickedPackages from "@/components/site/home/HandpickedPackages";
import HowItWorks from "@/components/site/home/HowItWorks";
import ReviewsCardStack from "@/components/site/home/ReviewsCardStack";
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
      <HeroTrustBadges />
      <TopTrending />
      <DealsYouCantMiss />
      <HandpickedPackages />
      <HowItWorks />
      <ReviewsCardStack />
      <InquiryBand />
    </SiteLayout>
  );
};

export default Index;
