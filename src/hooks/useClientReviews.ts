import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminPublicUrl } from "@/hooks/useAdminAuth";

export type DbClientReview = {
  id: string;
  name: string;
  destination: string | null;
  text: string;
  rating: number;
  date_label: string | null;
  image_path: string | null;
  position: number;
  created_at: string;
};

export type DisplayReview = {
  id: string;
  image: string | null;
  destination: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "•";

export const useClientReviews = () => {
  const [reviews, setReviews] = useState<DbClientReview[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_reviews")
      .select("*")
      .order("position", { ascending: true });
    setReviews(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const display: DisplayReview[] = reviews.map((r) => ({
    id: r.id,
    image: r.image_path ? adminPublicUrl(r.image_path) : null,
    destination: r.destination ?? "",
    name: r.name,
    initials: initialsOf(r.name),
    rating: r.rating,
    date: r.date_label ?? "",
    text: r.text,
    verified: true,
  }));

  return { reviews, display, loading, refetch };
};
