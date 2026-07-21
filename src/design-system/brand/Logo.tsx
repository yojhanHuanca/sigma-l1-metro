import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  tone?: "light" | "dark";
}

export function Logo({ size = 36, className, withWordmark = true, tone = "dark" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <rect width="64" height="64" rx="14" fill="#0F6B3E" />
        <path d="M16 40h32" stroke="#6FBD86" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        <rect x="20" y="22" width="24" height="16" rx="4" fill="#fff" />
        <rect x="23" y="26" width="5" height="6" rx="1.2" fill="#0F6B3E" />
        <rect x="29.5" y="26" width="5" height="6" rx="1.2" fill="#0F6B3E" />
        <rect x="36" y="26" width="5" height="6" rx="1.2" fill="#0F6B3E" />
        <circle cx="26" cy="42" r="2.4" fill="#fff" />
        <circle cx="38" cy="42" r="2.4" fill="#fff" />
      </svg>
      {withWordmark && (
        <div className="leading-tight">
          <p
            className={cn(
              "text-[15px] font-bold tracking-tight font-display",
              tone === "light" ? "text-white" : "text-ink"
            )}
          >
            SIGMA<span className="text-brand-600"> L1</span>
          </p>
          <p
            className={cn(
              "text-[10px] font-medium tracking-wide",
              tone === "light" ? "text-white/70" : "text-ink-quiet"
            )}
          >
            Seguridad Operativa · Metro de Lima
          </p>
        </div>
      )}
    </div>
  );
}
