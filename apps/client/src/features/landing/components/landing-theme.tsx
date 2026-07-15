"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Mode = "dark" | "light";

const STORAGE_KEY = "hivek-landing-theme";

type Ctx = { mode: Mode; toggle: () => void };
const LandingThemeContext = createContext<Ctx | null>(null);

export const useLandingTheme = (): Ctx => {
  const ctx = useContext(LandingThemeContext);
  if (!ctx) throw new Error("useLandingTheme must be used inside LandingThemeProvider");
  return ctx;
};

/**
 * Landing-only theme. Defaults to dark, persists the user's choice, and marks
 * <html> so the shared header/footer (rendered by the layout, outside the
 * landing tree) can follow the same mode without affecting other routes.
 */
export const LandingThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>("dark");

  // Hydrate from storage after mount (default stays dark for SSR).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  // Reflect the mode on <html> for the out-of-tree header/footer, and clean up.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-landing", mode);
    return () => root.removeAttribute("data-landing");
  }, [mode]);

  const toggle = () =>
    setMode((m) => {
      const next: Mode = m === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });

  return (
    <LandingThemeContext.Provider value={{ mode, toggle }}>{children}</LandingThemeContext.Provider>
  );
};

export const LandingThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { mode, toggle } = useLandingTheme();
  const isDark = mode === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
      className={
        "fixed bottom-6 right-6 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-colors " +
        (isDark
          ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
          : "border-black/10 bg-white text-slate-800 hover:bg-slate-100") +
        (className ? " " + className : "")
      }
    >
      <span className="material-symbols-outlined text-[22px]">{isDark ? "light_mode" : "dark_mode"}</span>
    </button>
  );
};
