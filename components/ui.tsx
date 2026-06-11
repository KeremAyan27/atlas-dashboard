"use client";

// Small shared UI primitives following the prototype's design language.

import type { AlertSeverity } from "@/types/atlas";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-card border border-line bg-panel shadow-card ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export const SEVERITY: Record<
  AlertSeverity,
  { label: string; text: string; chipBg: string; border: string; dot: string }
> = {
  high: {
    label: "High",
    text: "text-red",
    chipBg: "bg-red/10",
    border: "border-red/30",
    dot: "bg-red",
  },
  medium: {
    label: "Medium",
    text: "text-amber",
    chipBg: "bg-amber/10",
    border: "border-amber/30",
    dot: "bg-amber",
  },
  low: {
    label: "Low",
    text: "text-blue",
    chipBg: "bg-blue/10",
    border: "border-blue/30",
    dot: "bg-blue",
  },
  info: {
    label: "Info",
    text: "text-mint",
    chipBg: "bg-mint/10",
    border: "border-mint/30",
    dot: "bg-mint",
  },
};

export function SeverityPill({ severity }: { severity: AlertSeverity }) {
  const s = SEVERITY[severity];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.text} ${s.chipBg}`}
    >
      {s.label}
    </span>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-0.5 text-[12.5px] text-sub">{children}</div>;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-sub">
      <span className="size-7 animate-spin rounded-full border-2 border-line border-t-mint" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function EmptyState({
  message = "No data in selected range.",
}: {
  message?: string;
}) {
  return (
    <Card className="p-6 text-center">
      <div className="text-[13px] font-semibold">{message}</div>
      <div className="mt-1 text-xs text-sub">
        Adjust the filters above to widen the selection.
      </div>
    </Card>
  );
}

/** Compact 2–3 card strip summarizing the filtered slice. */
export function SummaryStrip({
  items,
}: {
  items: { label: string; value: string; note: string }[];
}) {
  return (
    <div className={`grid gap-2 ${items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {items.map((item) => (
        <Card key={item.label} className="p-2.5">
          <div className="text-[9.5px] font-semibold tracking-wide text-faint uppercase">
            {item.label}
          </div>
          <div className="font-display mt-0.5 text-[15px] font-bold tracking-tight">
            {item.value}
          </div>
          <div className="mt-0.5 text-[9.5px] leading-snug text-sub">
            {item.note}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-4 my-8 rounded-card border border-red/30 bg-red/10 p-4 text-center">
      <div className="text-[13px] font-semibold text-red">
        Something went wrong
      </div>
      <div className="mt-1 text-xs text-sub">{message}</div>
    </div>
  );
}
