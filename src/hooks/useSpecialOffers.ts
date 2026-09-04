import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export const OFFERS_PREFIX = "special-offers";

export type SpecialOffer = {
  name: string;
  path: string;
  url: string;
};

/** Banner images uploaded from the admin panel (stored in the offers folder). */
export const useSpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data } = await supabase.storage
      .from("itineraries")
      .list(OFFERS_PREFIX, { limit: 100, sortBy: { column: "name", order: "asc" } });
    const files = (data ?? []).filter((f) => f.id && !f.name.startsWith("."));
    setOffers(
      files.map((f) => ({
        name: f.name,
        path: `${OFFERS_PREFIX}/${f.name}`,
        url: adminPublicUrl(`${OFFERS_PREFIX}/${f.name}`),
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { offers, loading, refetch };
};
