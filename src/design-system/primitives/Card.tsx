import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ className, hover, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-white border border-line shadow-[var(--shadow-card)]",
        hover && "transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-line-strong",
        padded && "p-5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-[12.5px] text-ink-quiet mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
