import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "brand",
  showLabel = false,
}: {
  value: number;
  className?: string;
  tone?: "brand" | "warning" | "critical";
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color = tone === "warning" ? "bg-warning" : tone === "critical" ? "bg-critical" : "bg-brand-600";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11.5px] tabular-nums font-medium text-ink-quiet w-9 text-right">{pct}%</span>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-line-strong bg-surface/40",
        className
      )}
    >
      {icon && (
        <div className="h-12 w-12 rounded-xl bg-white border border-line grid place-items-center text-ink-faint mb-4">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {description && <p className="text-[13px] text-ink-quiet mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-700 mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[22px] font-bold text-ink leading-tight tracking-tight">{title}</h1>
        {description && <p className="text-[13.5px] text-ink-quiet mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
