import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Found | Jain Tours & Travels",
    description:
      "This page could not be found. Explore our tour packages, destinations and travel services instead.",
    noIndex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
        <nav aria-label="Helpful links" className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <a href="/destinations" className="underline hover:text-primary">Destinations</a>
          <a href="/services" className="underline hover:text-primary">Services</a>
          <a href="/blog" className="underline hover:text-primary">Travel Blog</a>
          <a href="/contact" className="underline hover:text-primary">Contact</a>
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
