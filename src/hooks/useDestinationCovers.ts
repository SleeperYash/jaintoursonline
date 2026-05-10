import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

/**
 * Fetches the cover image URL for every destination that has uploaded images.
 * Returns a map of destination_slug -> public URL of the cover (or first) image.
 */
export const useDestinationCovers = () => {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("destination_images")
        .select("destination_slug,file_path,is_cover,position")
        .order("position", { ascending: true });

      if (cancelled) return;

      const map: Record<string, { path: string; isCover: boolean }> = {};
      for (const row of data ?? []) {
        const existing = map[row.destination_slug];
        // Prefer is_cover; otherwise keep first by position
        if (!existing || (row.is_cover && !existing.isCover)) {
          map[row.destination_slug] = { path: row.file_path, isCover: row.is_cover };
        }
      }

      const urls: Record<string, string> = {};
      for (const [slug, v] of Object.entries(map)) {
        urls[slug] = adminPublicUrl(v.path);
      }
      setCovers(urls);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { covers, loading };
};
