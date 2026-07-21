import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "ink";
  className?: string;
}

const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-[12px]",
  lg: "h-11 w-11 text-[14px]",
};

export function Avatar({ initials, size = "md", tone = "brand", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-semibold shrink-0",
        SIZES[size],
        tone === "brand" ? "bg-brand-100 text-brand-800" : "bg-surface-2 text-ink-soft",
        className
      )}
    >
      {initials}
    </span>
  );
}
