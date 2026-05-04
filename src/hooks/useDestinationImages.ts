import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export type DestinationImage = {
  id: string;
  destination_slug: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  position: number;
  is_cover: boolean;
};

export const useDestinationImages = (slug: string) => {
  const [images, setImages] = useState<DestinationImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const { data } = await supabase
      .from("destination_images")
      .select("id,destination_slug,file_path,file_size,content_type,position,is_cover")
      .eq("destination_slug", slug)
      .order("position", { ascending: true });
    setImages(data ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const cover = images.find((i) => i.is_cover) ?? images[0] ?? null;
  const coverUrl = cover ? adminPublicUrl(cover.file_path) : null;

  return { images, loading, cover, coverUrl, refetch: fetchImages };
};
