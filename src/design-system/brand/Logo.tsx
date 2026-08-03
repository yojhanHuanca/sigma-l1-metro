import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  tone?: "light" | "dark";
}

export function Logo({ size = 100, className, withWordmark = true, tone = "dark" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/logo.png"
        alt="SIGMA L1 Logo"
        width={size}
        height={size}
        className="shrink-0"
      />
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
