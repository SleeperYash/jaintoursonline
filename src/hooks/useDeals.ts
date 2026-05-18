import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export type Deal = {
  id: string;
  destination_name: string;
  duration: string;
  price: number;
  price_label: string;
  inc_hotel: boolean;
  inc_breakfast: boolean;
  inc_sightseeing: boolean;
  inc_transport: boolean;
  image_path: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export const useDeals = (opts: { activeOnly?: boolean } = {}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    let q = supabase
      .from("deals")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (opts.activeOnly) q = q.eq("active", true);
    const { data } = await q;
    setDeals((data ?? []) as Deal[]);
    setLoading(false);
  }, [opts.activeOnly]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { deals, loading, refetch };
};

export const dealImageUrl = (path: string | null) =>
  path ? adminPublicUrl(path) : null;