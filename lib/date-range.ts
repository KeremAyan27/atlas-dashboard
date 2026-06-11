// Dataset window and date-range helpers shared by API routes and client
// filter components (string-based ISO dates, no server-only imports).
//
// IMPORTANT: all presets are relative to the dataset reference date
// (31.12.2025), not the real clock — the mock dataset covers exactly 2025.

export const DATASET_START = "2025-01-01";
export const DATASET_END = "2025-12-31";
export const REFERENCE_DATE = DATASET_END;

export type RangePreset = "week" | "month" | "year" | "all" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function clampIso(iso: string): string {
  if (iso < DATASET_START) return DATASET_START;
  if (iso > DATASET_END) return DATASET_END;
  return iso;
}

/** Inclusive day count of a range. */
export function rangeDays({ from, to }: DateRange): number {
  const MS_PER_DAY = 86_400_000;
  return (
    Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY) + 1
  );
}

export function presetRange(preset: Exclude<RangePreset, "custom">): DateRange {
  switch (preset) {
    case "week": // last 7 days ending at the reference date
      return { from: addDaysIso(REFERENCE_DATE, -6), to: REFERENCE_DATE };
    case "month": // calendar month of the reference date
      return { from: `${REFERENCE_DATE.slice(0, 7)}-01`, to: REFERENCE_DATE };
    case "year":
    case "all": // the dataset covers exactly one year
      return { from: DATASET_START, to: DATASET_END };
  }
}

/** Normalize arbitrary from/to inputs: validate, clamp, swap if inverted. */
export function normalizeRange(from?: string | null, to?: string | null): DateRange {
  let f = from && ISO_DATE.test(from) ? clampIso(from) : DATASET_START;
  let t = to && ISO_DATE.test(to) ? clampIso(to) : DATASET_END;
  if (f > t) [f, t] = [t, f];
  return { from: f, to: t };
}
