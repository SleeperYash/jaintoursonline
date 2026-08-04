import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";

const Destinations = lazy(() => import("./pages/Destinations.tsx"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail.tsx"));
const ItineraryDetailPage = lazy(() => import("./pages/ItineraryDetailPage.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const Reviews = lazy(() => import("./pages/Reviews.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
import PageTransition from "./components/site/PageTransition";
import { trackPageView } from "@/lib/analytics";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
};

const AnalyticsTracker = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const t = window.setTimeout(() => trackPageView(pathname + search), 80);
    return () => window.clearTimeout(t);
  }, [pathname, search]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
        <Route path="/destinations/:slug" element={<PageTransition><DestinationDetail /></PageTransition>} />
        <Route path="/destinations/:slug/:itinerarySlug" element={<PageTransition><ItineraryDetailPage /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnalyticsTracker />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
