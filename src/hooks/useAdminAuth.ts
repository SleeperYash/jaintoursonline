import { useState, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const adminHeaders = (password: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };

  if (SUPABASE_PUBLISHABLE_KEY) {
    headers.apikey = SUPABASE_PUBLISHABLE_KEY;
    headers.Authorization = `Bearer ${SUPABASE_PUBLISHABLE_KEY}`;
  }

  return headers;
};

export const adminPublicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/itineraries/${path}`;

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image file"));
        return;
      }
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const useAdminAuth = () => {
  const [pwd, setPwd] = useState("");
  const [authed, setAuthed] = useState(false);

  const callAdmin = useCallback(
    async (action: string, payload: Record<string, unknown> = {}, overridePwd?: string) => {
      const usePwd = overridePwd ?? pwd;
      if (!usePwd) {
        setAuthed(false);
        throw new Error("Admin session expired. Please unlock the panel again.");
      }
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-itineraries`, {
        method: "POST",
        headers: adminHeaders(usePwd),
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok === false) {
        setPwd("");
        setAuthed(false);
        throw new Error(data?.error ?? "Request failed");
      }
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
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
      if (!candidatePwd) throw new Error("Enter the admin password");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-itineraries`, {
        method: "POST",
        headers: adminHeaders(candidatePwd),
        body: JSON.stringify({ action: "verify" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok === false) throw new Error(data?.error ?? "Invalid password");
      if (!res.ok) throw new Error(data?.error ?? "Invalid password");
      setPwd(candidatePwd);
      setAuthed(true);
    },
    [],
  );

  return { pwd, setPwd, authed, callAdmin, unlock };
};
