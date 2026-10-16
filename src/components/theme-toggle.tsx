"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeProvider() {
  useEffect(() => {
    const sync = () => {
      try {
        document.documentElement.dataset.theme =
          localStorage.getItem("bagyt-theme") === "dark" ? "dark" : "light";
      } catch {
        document.documentElement.dataset.theme = "light";
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return null;
}
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () =>
      setDark(document.documentElement.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <button
      className="bagyt-theme-toggle"
      type="button"
      aria-label={
        dark ? "Ашық режим / Светлая тема" : "Қараңғы режим / Тёмная тема"
      }
      title={dark ? "Light" : "Dark"}
      aria-pressed={dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("bagyt-theme", next);
        } catch {}
        setDark(!dark);
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
