"use client";

// Global date-range filter: context shared by all data pages (lives inside
// AppShell so the selection survives navigation) plus the filter UI pieces.
// Presets are relative to the dataset reference date (31.12.2025).

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DATASET_END,
  DATASET_START,
  normalizeRange,
  presetRange,
  type DateRange,
  type RangePreset,
} from "@/lib/date-range";
import { formatDate } from "@/lib/format";

/* ---------- context ---------- */

interface FilterContextValue extends DateRange {
  preset: RangePreset;
  setPreset: (preset: Exclude<RangePreset, "custom">) => void;
  setCustom: (from: string, to: string) => void;
}

const FilterContext = createContext<FilterContextValue>({
  preset: "all",
  from: DATASET_START,
  to: DATASET_END,
  setPreset: () => {},
  setCustom: () => {},
});

export const useFilters = () => useContext(FilterContext);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ preset: RangePreset } & DateRange>({
    preset: "all",
    from: DATASET_START,
    to: DATASET_END,
  });

  const setPreset = useCallback((preset: Exclude<RangePreset, "custom">) => {
    setState({ preset, ...presetRange(preset) });
  }, []);

  const setCustom = useCallback((from: string, to: string) => {
    setState({ preset: "custom", ...normalizeRange(from, to) });
  }, []);

  const value = useMemo(
    () => ({ ...state, setPreset, setCustom }),
    [state, setPreset, setCustom],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

/* ---------- date range filter UI ---------- */

const PRESETS: { id: Exclude<RangePreset, "custom">; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All" },
];

const chipClass = (active: boolean) =>
  `cursor-pointer rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold ${
    active ? "border-mint bg-mint text-on-accent" : "border-line text-sub"
  }`;

export function DateRangeFilter() {
  const { preset, from, to, setPreset, setCustom } = useFilters();
  const [customOpen, setCustomOpen] = useState(preset === "custom");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPreset(p.id);
              setCustomOpen(false);
            }}
            className={chipClass(preset === p.id && !customOpen)}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setCustomOpen((open) => !open)}
          className={chipClass(customOpen || preset === "custom")}
        >
          Custom
        </button>
      </div>

      {customOpen && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Start date"
            value={from}
            min={DATASET_START}
            max={DATASET_END}
            onChange={(e) => e.target.value && setCustom(e.target.value, to)}
            className="flex-1 rounded-[10px] border border-line bg-panel px-2.5 py-1.5 text-xs text-ink"
          />
          <span className="text-xs text-faint">–</span>
          <input
            type="date"
            aria-label="End date"
            value={to}
            min={DATASET_START}
            max={DATASET_END}
            onChange={(e) => e.target.value && setCustom(from, e.target.value)}
            className="flex-1 rounded-[10px] border border-line bg-panel px-2.5 py-1.5 text-xs text-ink"
          />
        </div>
      )}

      <div className="px-0.5 text-[10.5px] text-faint">
        Showing {formatDate(from)} – {formatDate(to)}
      </div>
    </div>
  );
}

/* ---------- secondary filter select ---------- */

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-[10px] border border-line bg-panel py-2 pr-7 pl-3 text-xs font-semibold text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-faint"
      />
    </label>
  );
}
