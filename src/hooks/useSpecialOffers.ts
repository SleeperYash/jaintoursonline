import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export const OFFERS_PREFIX = "special-offers";

export type SpecialOfferVariant = {
  name: string;
  path: string;
  url: string;
};

export type SpecialOffer = {
  id: string;
  name: string;
  desktop: SpecialOfferVariant | null;
  mobile: SpecialOfferVariant | null;
  legacy: SpecialOfferVariant | null;
};

const toVariant = (folder: string, name: string): SpecialOfferVariant => {
  const path = `${OFFERS_PREFIX}/${folder ? `${folder}/` : ""}${name}`;
  return { name, path, url: adminPublicUrl(path) };
};

const offerIdFromName = (name: string) => name.split("--", 1)[0] ?? name;

/** Banner images uploaded from the admin panel (stored in the offers folder). */
export const useSpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const listOptions = { limit: 100, sortBy: { column: "name", order: "asc" as const } };
    const [{ data: rootData }, { data: desktopData }, { data: mobileData }] = await Promise.all([
      supabase.storage.from("itineraries").list(OFFERS_PREFIX, listOptions),
      supabase.storage.from("itineraries").list(`${OFFERS_PREFIX}/desktop`, listOptions),
      supabase.storage.from("itineraries").list(`${OFFERS_PREFIX}/mobile`, listOptions),
    ]);

    const paired = new Map<string, SpecialOffer>();
    const addVariant = (folder: "desktop" | "mobile", name: string) => {
      const id = offerIdFromName(name);
      const current = paired.get(id) ?? { id, name: name.split("--").slice(1).join("--") || name, desktop: null, mobile: null, legacy: null };
      current[folder] = toVariant(folder, name);
      paired.set(id, current);
    };

    (desktopData ?? []).filter((file) => file.id && !file.name.startsWith(".")).forEach((file) => addVariant("desktop", file.name));
    (mobileData ?? []).filter((file) => file.id && !file.name.startsWith(".")).forEach((file) => addVariant("mobile", file.name));

    const legacy = (rootData ?? [])
      .filter((file) => file.id && !file.name.startsWith("."))
      .map((file) => {
        const variant = toVariant("", file.name);
        return { id: `legacy-${file.name}`, name: file.name, desktop: null, mobile: null, legacy: variant };
      });

    setOffers([...legacy, ...Array.from(paired.values())]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { offers, loading, refetch };
};
