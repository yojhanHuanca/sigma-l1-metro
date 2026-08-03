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
        "relative overflow-hidden rounded-[20px] text-white shadow-[var(--shadow-plate)]",
        className
      )}
      style={{
        backgroundImage: "url('/banner-bg.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Mesh glow */}
      <div className="absolute inset-0 bg-mesh opacity-80" />
      {/* Dark overlay for text visibility */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative px-7 py-6 sm:px-9 sm:py-7 max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white mb-2">
          Línea 1 · Metro de Lima
        </p>
        <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-[1.1] font-display text-balance text-white">
          {greeting}
        </h1>
        <p className="text-[13.5px] text-white mt-2.5 max-w-xl">{subtitle}</p>
        {meta && <div className="mt-5 flex flex-wrap gap-2.5">{meta}</div>}
      </div>
    </div>
  );
}
