import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "jtt-theme";

const getInitial = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
};

export const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  root.classList.toggle("dark", theme === "dark");
  window.setTimeout(() => root.classList.remove("theme-anim"), 350);
};

const ThemeToggle = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitial);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-full border border-gold/30 text-gold hover:border-gold hover:shadow-gold transition-all duration-300",
        className
      )}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;