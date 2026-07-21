import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell, ChevronRight, Train, Calendar } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "@/design-system/brand/Logo";
import { Avatar } from "@/design-system/primitives/Avatar";
import { AREA_LABELS } from "@/lib/types";

export function JefeShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, currentUser, setRole, cases } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Casos asignados al jefe (área mantenimiento, en ejecución o verificación)
  const assignedCount = cases.filter(
    (c) => c.assigneeArea === "mantenimiento" && (c.stage === "ejecucion" || c.stage === "verificacion")
  ).length;
  const unread = notifications.filter((n) => !n.read && n.audience !== "reportante").length;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1300px] mx-auto h-16 px-6 flex items-center justify-between gap-6">
          <Link to="/jefe" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="hidden sm:inline-block h-6 w-px bg-line" />
            <span className="hidden sm:flex items-center gap-1.5 text-[11.5px] font-medium text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full">
              <Train className="h-3.5 w-3.5" /> Portal del Jefe de Área
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/jefe"
              className={cnNav(location.pathname === "/jefe")}
            >
              <Calendar className="h-4 w-4" /> Mi Plan
              {assignedCount > 0 && (
                <span className="ml-1.5 text-[10.5px] font-semibold tabular-nums bg-brand-700 text-white rounded-full px-1.5" style={{ minWidth: 18, minHeight: 18 }}>
                  {assignedCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/jefe"
              className="relative h-9 w-9 grid place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-white" />}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-surface transition-colors"
              >
                <Avatar initials={currentUser.initials} size="sm" />
                <div className="hidden lg:block text-left leading-tight">
                  <p className="text-[12px] font-semibold text-ink">{currentUser.name}</p>
                  <p className="text-[10.5px] text-ink-quiet">{currentUser.area ? AREA_LABELS[currentUser.area] : "Jefe de Área"}</p>
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-60 rounded-xl bg-white border border-line shadow-[var(--shadow-pop)] py-1.5 animate-[riseUp_0.18s_ease-out]">
                  <div className="px-3.5 py-2.5 border-b border-line-soft">
                    <p className="text-[13px] font-semibold text-ink">{currentUser.name}</p>
                    <p className="text-[11.5px] text-ink-quiet truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-brand-700 mt-1">Jefe · {currentUser.area ? AREA_LABELS[currentUser.area] : "Área"}</p>
                  </div>
                  <button
                    onClick={() => { setRole(null); navigate("/"); }}
                    className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[13px] text-critical hover:bg-critical-soft rounded-md mx-1"
                  >
                    <LogOut className="h-4 w-4" /> Cambiar de perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-6 py-7">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="max-w-[1300px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-quiet">
          <p>SIGMA L1 · Portal del Jefe de Área Responsable — Línea 1 del Metro de Lima</p>
          <p className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" /> Ejecución y seguimiento del Plan de Acción</p>
        </div>
      </footer>
    </div>
  );
}

function cnNav(active: boolean) {
  return `relative h-9 px-3.5 inline-flex items-center gap-2 text-[13px] font-medium rounded-lg transition-colors ${
    active ? "text-brand-800 bg-brand-50" : "text-ink-soft hover:bg-surface hover:text-ink"
  }`;
}
