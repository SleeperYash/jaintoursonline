import { ALL_KEYWORDS } from "@/lib/seoKeywords";
import SiteLayout from "@/components/site/SiteLayout";
import HeroLuxe from "@/components/site/home/HeroLuxe";
import HeroTrustBadges from "@/components/site/home/HeroTrustBadges";
import TopTrending from "@/components/site/home/TopTrending";
import SpecialOffersBanner from "@/components/site/home/SpecialOffersBanner";
import SignatureTravelCollections from "@/components/site/home/SignatureTravelCollections";
import HandpickedPackages from "@/components/site/home/HandpickedPackages";
import HowItWorks from "@/components/site/home/HowItWorks";
import ReviewsCardStack from "@/components/site/home/ReviewsCardStack";
import BlogStrip from "@/components/site/home/BlogStrip";
import InquiryBand from "@/components/site/InquiryBand";
import { MotionReveal } from "@/components/site/MotionReveal";
import { useSeo } from "@/hooks/useSeo";
import TravelAgencyLd from "@/components/site/schema/TravelAgencyLd";

const Index = () => {
  useSeo({
    title:
      "Jain Tours & Travels | Trusted Travel Agency in Mumbai | International & Domestic Tour Packages | Visa Services",
    description:
      "Jain Tours & Travels is a trusted travel agency in Mumbai with 30+ years of experience. We offer international & domestic tour packages, visa services, air tickets, hotels, cruises and customized holidays with personalized service.",
    canonicalPath: "/",
    keywords: ALL_KEYWORDS,
  });

  return (
    <SiteLayout>
      <TravelAgencyLd id="ld-agency-home" pagePath="/" />
      <HeroLuxe />
      <MotionReveal><HeroTrustBadges /></MotionReveal>
      <MotionReveal><TopTrending /></MotionReveal>
      <MotionReveal><SpecialOffersBanner /></MotionReveal>
      <MotionReveal><SignatureTravelCollections /></MotionReveal>
      <MotionReveal><HandpickedPackages /></MotionReveal>
      <MotionReveal><HowItWorks /></MotionReveal>
      <MotionReveal><ReviewsCardStack /></MotionReveal>
      <MotionReveal><InquiryBand /></MotionReveal>
      <MotionReveal><BlogStrip /></MotionReveal>
    </SiteLayout>
  );
};

export default Index;
