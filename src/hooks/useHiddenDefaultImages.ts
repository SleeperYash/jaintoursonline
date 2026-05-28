import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHiddenDefaultImages = (destinationSlug?: string) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!destinationSlug) {
      setHidden(new Set());
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("hidden_default_images")
      .select("image_url")
      .eq("destination_slug", destinationSlug);
    setHidden(new Set((data ?? []).map((r) => r.image_url)));
    setLoading(false);
  }, [destinationSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await refetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return { hidden, loading, refetch };
};