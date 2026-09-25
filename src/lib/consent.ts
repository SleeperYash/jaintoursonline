export const CONSENT_KEY = "jt-cookie-consent";
export const OPEN_PREFS_EVENT = "jt-open-cookie-prefs";

export type Consent = { analytics: boolean; date: string };

export function getConsent(): Consent | null {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, date: new Date().toISOString() }));
  const w = window as unknown as { __loadGA?: () => void; "ga-disable-G-BNXFBV2MFW"?: boolean };
  if (analytics) {
    w["ga-disable-G-BNXFBV2MFW"] = false;
    w.__loadGA?.();
  } else {
    w["ga-disable-G-BNXFBV2MFW"] = true;
  }
}

export const openCookiePreferences = () => window.dispatchEvent(new Event(OPEN_PREFS_EVENT));
