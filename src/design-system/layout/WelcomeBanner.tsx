import { cn } from "@/lib/utils";

/**
 * Welcome banner inspired by Línea 1 del Metro de Lima.
 * Shows a stylized elevated transit line with stations and a moving train,
 * over an institutional green gradient. Used on portal home screens.
 */
export function WelcomeBanner({
  className,
  greeting = "Bienvenida al Centro de Control de Seguridad Operativa",
  subtitle = "Gestión integral de casos · Línea 1 del Metro de Lima",
  meta,
}: {
  className?: string;
  greeting?: string;
  subtitle?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] bg-brand-gradient text-white shadow-[var(--shadow-plate)]",
        className
      )}
    >
      {/* Mesh glow */}
      <div className="absolute inset-0 bg-mesh opacity-80" />
      {/* Decorative diagonal rail */}
      <svg
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-90"
        width="320"
        height="220"
        viewBox="0 0 320 220"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path d="M-20 170 Q 80 120 180 150 T 360 110" stroke="url(#rail)" strokeWidth="2" fill="none" />
        <path d="M-20 178 Q 80 128 180 158 T 360 118" stroke="url(#rail)" strokeWidth="1" fill="none" opacity="0.5" />
        {[40, 90, 140, 190, 240, 290].map((x, i) => (
          <circle key={i} cx={x} cy={160 - Math.sin((x / 320) * Math.PI) * 22} r="3" fill="#ffffff" opacity="0.7" />
        ))}
      </svg>

      {/* Train illustration */}
      <svg
        className="absolute right-6 bottom-4 hidden sm:block opacity-95"
        width="150"
        height="80"
        viewBox="0 0 150 80"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="trainBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d4ecd9" />
          </linearGradient>
        </defs>
        <path d="M6 50 Q6 26 30 24 H120 Q144 26 144 50 V64 H6 Z" fill="url(#trainBody)" />
        <rect x="16" y="32" width="20" height="14" rx="3" fill="#0F6B3E" opacity="0.85" />
        <rect x="42" y="32" width="20" height="14" rx="3" fill="#0F6B3E" opacity="0.85" />
        <rect x="68" y="32" width="20" height="14" rx="3" fill="#0F6B3E" opacity="0.85" />
        <rect x="94" y="32" width="20" height="14" rx="3" fill="#0F6B3E" opacity="0.85" />
        <path d="M120 32 h16 a4 4 0 0 1 4 4 v10 h-20 z" fill="#1F9D52" opacity="0.7" />
        <circle cx="38" cy="66" r="7" fill="#0A3F24" />
        <circle cx="112" cy="66" r="7" fill="#0A3F24" />
        <circle cx="38" cy="66" r="2.5" fill="#a8d8b4" />
        <circle cx="112" cy="66" r="2.5" fill="#a8d8b4" />
        <path d="M6 64 h138" stroke="#6FBD86" strokeWidth="2" strokeDasharray="4 4" className="track-dash" />
      </svg>

      <div className="relative px-7 py-6 sm:px-9 sm:py-7 max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/70 mb-2">
          Línea 1 · Metro de Lima
        </p>
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-[1.1] font-display text-balance">
          {greeting}
        </h1>
        <p className="text-[13.5px] text-white/80 mt-2.5 max-w-xl">{subtitle}</p>
        {meta && <div className="mt-5 flex flex-wrap gap-2.5">{meta}</div>}
      </div>
    </div>
  );
}
