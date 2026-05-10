import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import InquiryBand from "@/components/site/InquiryBand";
import ItineraryViewer from "@/components/site/ItineraryViewer";

import { findDestination } from "@/data/destinations";
import { useSeo } from "@/hooks/useSeo";
import { useReveal } from "@/hooks/useReveal";
import { useDestinationImages } from "@/hooks/useDestinationImages";
import { adminPublicUrl } from "@/hooks/useAdminAuth";
import { Check, Clock, MapPin, ArrowLeft, ImageOff, Star } from "lucide-react";

const PLACEHOLDER = "/placeholder.svg";

const GalleryTile = ({ src, alt, isCover }: { src: string; alt: string; isCover: boolean }) => {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className={`relative group overflow-hidden rounded-lg aspect-[4/3] bg-card border transition-all ${
        isCover ? "border-gold ring-2 ring-gold/40" : "border-border/60 hover:border-gold/40"
      }`}
    >
      {errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-foreground/60 text-[10px] uppercase tracking-luxe">
          <ImageOff className="w-5 h-5 text-destructive" />
          Failed to load
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      {isCover && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gold text-primary-foreground text-[10px] uppercase tracking-luxe px-2 py-1 shadow-md">
          <Star className="w-3 h-3" /> Cover
        </span>
      )}
    </div>
  );
};

const DestinationDetail = () => {
  const { slug = "" } = useParams();
  const d = findDestination(slug);
  const { images, coverUrl } = useDestinationImages(slug);
  const [coverError, setCoverError] = useState(false);
  const heroSrc = coverError || !coverUrl ? (d?.image ?? PLACEHOLDER) : coverUrl;

  useSeo({
    title: d ? `${d.name} — Luxury Travel | Jain Tours` : "Destination | Jain Tours",
    description: d?.overview ?? "Curated destination by Jain Tours & Travels.",
    canonicalPath: `/destinations/${slug}`,
  });

  const r1 = useReveal<HTMLDivElement>();
  const r3 = useReveal<HTMLDivElement>();

  if (!d) return <Navigate to="/destinations" replace />;

  return (
    <SiteLayout>
      {/* Compact hero with hover animation */}
      <section className="container pt-32 pb-10">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-foreground/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All destinations
          </Link>
          <ManageDestinationDialog destinationSlug={d.slug} destinationName={d.name} />
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-2 group relative overflow-hidden aspect-[4/3] bg-card border border-border/60 hover:border-gold/40 transition-all duration-700 hover:shadow-luxe cursor-pointer rounded-xl">
            <img
              src={heroSrc}
              alt={d.name}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
            />
            {coverError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/90 text-foreground/70 text-xs uppercase tracking-luxe">
                <ImageOff className="w-6 h-6 text-destructive" />
                Cover image failed to load
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs tracking-luxe uppercase text-gold mb-3">{d.region} · {d.country}</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">
              {d.name}
            </h1>
            <p className="mt-4 text-base md:text-lg text-foreground/70 font-light max-w-xl">
              {d.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-xs tracking-luxe uppercase text-foreground/70">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" /> {d.duration}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" /> {d.country}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section ref={r1} className="reveal container py-12 md:py-16">
        <div className="max-w-3xl mx-auto bg-card border border-border/60 rounded-2xl p-6 md:p-10 shadow-md">
          <p className="text-xs uppercase tracking-luxe text-gold mb-5 text-center">Highlights</p>
          <ul className="grid sm:grid-cols-2 gap-3 gap-x-8">
            {d.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm text-foreground/85">
                <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> <span className="break-words">{h}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gold text-primary-foreground text-xs uppercase tracking-luxe hover:bg-gold/90 transition"
            >
              Enquire about {d.name}
            </Link>
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section ref={r3} className="reveal container py-16 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8">What's included</h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
          {d.inclusions.map((inc) => (
            <p
              key={inc}
              className="flex gap-3 text-base text-foreground/85 border-b border-border/60 py-3"
            >
              <Check className="w-4 h-4 text-gold mt-1 shrink-0" /> {inc}
            </p>
          ))}
        </div>
      </section>

      {/* Gallery */}
      {images.length > 0 && (
        <section className="container py-12 md:py-16">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-luxe text-gold mb-2">Gallery</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                Moments from {d.name}
              </h2>
            </div>
            <p className="text-xs uppercase tracking-luxe text-foreground/60">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((img) => (
              <GalleryTile
                key={img.id}
                src={adminPublicUrl(img.file_path)}
                alt={d.name}
                isCover={img.is_cover}
              />
            ))}
          </div>
        </section>
      )}

      <ItineraryViewer destinationSlug={d.slug} destinationName={d.name} />

      <InquiryBand />
    </SiteLayout>
  );
};

export default DestinationDetail;
