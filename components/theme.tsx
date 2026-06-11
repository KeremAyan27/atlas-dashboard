"use client";

// Theme system: light (default) / dark, persisted in localStorage.
// The class on <html> is applied before first paint by an inline script in
// app/layout.tsx; this provider syncs React state with it and exposes the
// current chart palette, read live from the CSS variables in globals.css so
// Recharts (which needs literal color values) always matches the theme.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

export interface ChartPalette {
  bg: string;
  panel2: string;
  line: string;
  text: string;
  sub: string;
  faint: string;
  mint: string;
  amber: string;
  red: string;
  blue: string;
  violet: string;
}

const VAR_OF: Record<keyof ChartPalette, string> = {
  bg: "--color-bg",
  panel2: "--color-panel2",
  line: "--color-line",
  text: "--color-ink",
  sub: "--color-sub",
  faint: "--color-faint",
  mint: "--color-mint",
  amber: "--color-amber",
  red: "--color-red",
  blue: "--color-blue",
  violet: "--color-violet",
};

// Server-render placeholder only (charts mount client-side after data
// loads, where the real values are read from CSS). Mirrors the light theme.
const SSR_PALETTE: ChartPalette = {
  bg: "#f7f8fa",
  panel2: "#eff2f6",
  line: "#e4e8ef",
  text: "#1a2230",
  sub: "#4d5a70",
  faint: "#626e85",
  mint: "#127a53",
  amber: "#9a6700",
  red: "#c92a2a",
  blue: "#2563c9",
  violet: "#6741d9",
};

function readPalette(): ChartPalette {
  const styles = getComputedStyle(document.documentElement);
  const palette = { ...SSR_PALETTE };
  for (const key of Object.keys(VAR_OF) as (keyof ChartPalette)[]) {
    const value = styles.getPropertyValue(VAR_OF[key]).trim();
    if (value) palette[key] = value;
  }
  return palette;
}

function syncMetaThemeColor() {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-bg")
        .trim(),
    );
}

interface ThemeContextValue {
  theme: ThemeMode;
  toggle: () => void;
  chart: ChartPalette;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  chart: SSR_PALETTE,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The pre-paint script in layout.tsx has already applied the stored theme
  // to <html>, so the initial state can be read straight from the DOM.
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );
  const [chart, setChart] = useState<ChartPalette>(() =>
    typeof document !== "undefined" ? readPalette() : SSR_PALETTE,
  );

  // Keep the browser chrome color in sync with the restored theme.
  useEffect(() => {
    syncMetaThemeColor();
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("atlas-theme", next);
    } catch {
      // storage unavailable (private mode) — theme still applies this session
    }
    setTheme(next);
    setChart(readPalette());
    syncMetaThemeColor();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, chart }}>
      {children}
    </ThemeContext.Provider>
  );
}
