// Locale formatting helpers.
// UI copy is English, but values keep Turkish conventions:
// ₺ amounts in tr-TR number format, dates as DD.MM.YYYY.

export const formatTL = (n: number): string =>
  `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n)} ₺`;

/** Compact ₺ for chart axes and KPI cards, e.g. "47,7M ₺". */
export const formatTLCompact = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M ₺`;
  if (abs >= 1_000)
    return `${(n / 1_000).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}K ₺`;
  return formatTL(n);
};

/** ISO date → DD.MM.YYYY */
export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

export const formatPct = (n: number, digits = 1): string =>
  `${n >= 0 ? "+" : "−"}%${Math.abs(n).toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

// Chart colors are theme-dependent — read them via useTheme().chart
// (components/theme.tsx), which resolves the CSS variables in globals.css.
