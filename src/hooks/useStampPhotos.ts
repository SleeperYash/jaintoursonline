import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export type StampKey =
  | "malaysia"
  | "singapore"
  | "thailand"
  | "sri-lanka"
  | "kashmir"
  | "himalayas"
  | "andaman"
  | "north-east-india";

export type StampSlot = {
  key: StampKey;
  label: string;
  borderColor: string;
  slug: string;
};

export const STAMP_SLOTS: StampSlot[] = [
  { key: "malaysia", label: "MALAYSIA", borderColor: "#D4860B", slug: "singapore-malaysia" },
  { key: "singapore", label: "GEORGIA", borderColor: "#1A6FA8", slug: "georgia" },
  { key: "thailand", label: "THAILAND", borderColor: "#C0392B", slug: "thailand" },
  { key: "sri-lanka", label: "SRI LANKA", borderColor: "#2E7D32", slug: "sri-lanka" },
  { key: "kashmir", label: "KASHMIR", borderColor: "#5C7FA3", slug: "kashmir" },
  { key: "himalayas", label: "HIMALAYAS", borderColor: "#2C6B6B", slug: "himachal" },
  { key: "andaman", label: "ANDAMAN", borderColor: "#00897B", slug: "andaman" },
  { key: "north-east-india", label: "LEH LADAKH", borderColor: "#558B2F", slug: "leh-ladakh" },
];

export const useStampPhotos = () => {
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from("stamp_photos")
      .select("stamp_key,image_path");
    const map: Record<string, string | null> = {};
    for (const row of data ?? []) {
      map[row.stamp_key] = row.image_path ? adminPublicUrl(row.image_path) : null;
    }
    setPhotos(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { photos, loading, refetch };
};