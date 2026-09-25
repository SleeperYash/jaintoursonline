import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, saveConsent, OPEN_PREFS_EVENT } from "@/lib/consent";

const CookieBanner = () => {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const c = getConsent();
    if (!c) setOpen(true);
    else setAnalytics(c.analytics);
    const h = () => { setOpen(true); setPrefs(true); };
    window.addEventListener(OPEN_PREFS_EVENT, h);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, h);
  }, []);

  if (!open) return null;

  const done = (a: boolean) => { saveConsent(a); setOpen(false); setPrefs(false); };

  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed bottom-0 inset-x-0 z-[60] border-t border-border bg-card/95 backdrop-blur-md shadow-luxe">
      <div className="container py-3 md:py-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <p className="text-xs md:text-sm text-foreground/90 pr-16 md:pr-0">
            We use cookies to improve your browsing experience and analyze traffic.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => done(true)} className="px-4 py-2 text-[11px] uppercase tracking-luxe bg-primary text-primary-foreground rounded-md hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Accept
            </button>
            <button onClick={() => setPrefs((p) => !p)} aria-expanded={prefs} className="px-4 py-2 text-[11px] uppercase tracking-luxe border border-border text-foreground rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Preferences
            </button>
            <Link to="/privacy" className="px-2 py-2 text-[11px] uppercase tracking-luxe text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
        {prefs && (
          <div className="border-t border-border pt-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between text-xs">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" checked disabled /> Essential (always on)
              </label>
              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics (Google Analytics)
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => done(false)} className="px-4 py-2 text-[11px] uppercase tracking-luxe border border-border rounded-md hover:bg-secondary">Reject non-essential</button>
              <button onClick={() => done(analytics)} className="px-4 py-2 text-[11px] uppercase tracking-luxe bg-primary text-primary-foreground rounded-md hover:opacity-90">Save preferences</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
