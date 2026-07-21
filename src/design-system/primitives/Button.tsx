import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-700/40",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200 disabled:bg-brand-50/60",
  outline:
    "bg-white text-ink border border-line-strong hover:bg-surface-2 hover:border-ink-faint active:bg-surface-3",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-2 hover:text-ink active:bg-surface-3",
  danger:
    "bg-critical text-white shadow-sm hover:bg-critical/90 active:bg-critical-ink disabled:bg-critical/40",
  subtle: "bg-surface-2 text-ink-soft hover:bg-surface-3 active:bg-line-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[13.5px] gap-2 rounded-lg",
  lg: "h-11 px-5 text-[14px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
