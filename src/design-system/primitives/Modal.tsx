import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, subtitle, footer, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white border border-line shadow-[var(--shadow-pop)] animate-[riseUp_0.25s_ease-out]",
          SIZES[size]
        )}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-line-soft">
            <div className="min-w-0">
              {title && <h2 className="text-[16px] font-semibold text-ink leading-tight">{title}</h2>}
              {subtitle && <p className="text-[13px] text-ink-quiet mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 h-8 w-8 grid place-items-center rounded-lg text-ink-quiet hover:bg-surface-2 hover:text-ink transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-line-soft bg-surface/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
