import { useEffect, useState, useCallback } from "react";

const ADMIN_KEY = "jt_admin_pwd";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export const adminPublicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/itineraries/${path}`;

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const useAdminAuth = () => {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY);
    if (saved) {
      setPwd(saved);
      setAuthed(true);
    }
  }, []);

  const callAdmin = useCallback(
    async (action: string, payload: Record<string, unknown> = {}, overridePwd?: string) => {
      const usePwd = overridePwd ?? pwd;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-itineraries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": usePwd,
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem(ADMIN_KEY);
          setPwd("");
          setAuthed(false);
        }
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      return data;
    },
    [pwd],
  );

  const unlock = useCallback(
    async (candidatePwd: string) => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-itineraries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": candidatePwd },
        body: JSON.stringify({ action: "verify" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Invalid password");
      sessionStorage.setItem(ADMIN_KEY, candidatePwd);
      setPwd(candidatePwd);
      setAuthed(true);
    },
    [],
  );

  return { pwd, setPwd, authed, callAdmin, unlock };
};
