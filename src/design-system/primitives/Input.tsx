import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-line-strong bg-white text-ink placeholder:text-ink-faint transition-all duration-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 focus:outline-none disabled:bg-surface-2 disabled:text-ink-quiet";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, "h-10 px-3 text-[13.5px]", className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(base, "px-3 py-2.5 text-[13.5px] leading-relaxed resize-y min-h-[96px]", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(base, "h-10 px-3 pr-8 text-[13.5px] appearance-none bg-no-repeat", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23767f79' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundPosition: "right 10px center",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Field({
  label,
  hint,
  required,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-center gap-1 text-[12px] font-medium text-ink-soft mb-1.5">
        {label}
        {required && <span className="text-critical">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11.5px] text-ink-faint mt-1.5">{hint}</span>}
      {error && <span className="block text-[11.5px] text-critical mt-1.5">{error}</span>}
    </label>
  );
}
