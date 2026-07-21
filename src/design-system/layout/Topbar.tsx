import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, ChevronRight, Settings, LogOut, HelpCircle } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar } from "@/design-system/primitives/Avatar";

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/seguridad": { title: "Dashboard Ejecutivo", crumb: "Inicio / Dashboard" },
  "/seguridad/decisiones": { title: "Centro de Decisiones", crumb: "Inicio / Decisiones" },
  "/seguridad/alertas": { title: "Alertas", crumb: "Inicio / Alertas" },
  "/seguridad/casos": { title: "Gestión de Casos", crumb: "Inicio / Casos" },
  "/seguridad/kpis": { title: "Indicadores KPI", crumb: "Reportes / KPIs" },
  "/seguridad/estadisticas": { title: "Estadísticas", crumb: "Reportes / Estadísticas" },
  "/seguridad/exportar": { title: "Exportar Reportes", crumb: "Reportes / Exportar" },
  "/seguridad/notificaciones": { title: "Notificaciones", crumb: "Inicio / Notificaciones" },
  "/seguridad/perfil": { title: "Mi Perfil", crumb: "Inicio / Perfil" },
};

export function Topbar({ right }: { right?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, currentUser, setRole } = useStore();
  const unread = notifications.filter((n) => !n.read && n.audience !== "reportante").length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const base = location.pathname.split("/").slice(0, 3).join("/");
  const meta = TITLES[base] ?? (location.pathname.includes("/casos/") ? { title: "Expediente Digital", crumb: "Inicio / Casos / Expediente" } : TITLES["/seguridad"]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-xl border-b border-line">
      <div className="h-full px-7 flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[11px] text-ink-quiet flex items-center gap-1">
            <span>SIGMA L1</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-soft font-medium">{meta.crumb}</span>
          </p>
          <h2 className="text-[16px] font-semibold text-ink leading-tight truncate">{meta.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-lg bg-surface border border-line text-ink-quiet w-[280px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              placeholder="Buscar caso por código, título o estación…"
              className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) navigate(`/seguridad/casos?q=${encodeURIComponent(q)}`);
                }
              }}
            />
            <kbd className="text-[10px] font-medium text-ink-faint bg-white border border-line rounded px-1.5 py-0.5">↵</kbd>
          </div>

          {right}

          <Link
            to="/seguridad/notificaciones"
            className="relative h-10 w-10 grid place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-white" />
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 h-10 pl-1.5 pr-2 rounded-lg hover:bg-surface transition-colors"
            >
              <Avatar initials={currentUser.initials} size="sm" />
              <span className="hidden lg:block text-[12.5px] font-medium text-ink">{currentUser.name}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-60 rounded-xl bg-white border border-line shadow-[var(--shadow-pop)] py-1.5 animate-[riseUp_0.18s_ease-out]">
                <div className="px-3.5 py-2.5 border-b border-line-soft">
                  <p className="text-[13px] font-semibold text-ink">{currentUser.name}</p>
                  <p className="text-[11.5px] text-ink-quiet truncate">{currentUser.email}</p>
                </div>
                <div className="py-1">
                  <Link to="/seguridad/perfil" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 h-9 text-[13px] text-ink-soft hover:bg-surface hover:text-ink rounded-md mx-1">
                    <Settings className="h-4 w-4 text-ink-faint" /> Mi Perfil
                  </Link>
                  <Link to="/seguridad/notificaciones" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 h-9 text-[13px] text-ink-soft hover:bg-surface hover:text-ink rounded-md mx-1">
                    <Bell className="h-4 w-4 text-ink-faint" /> Notificaciones
                  </Link>
                  <a href="#" className="flex items-center gap-2.5 px-3.5 h-9 text-[13px] text-ink-soft hover:bg-surface hover:text-ink rounded-md mx-1">
                    <HelpCircle className="h-4 w-4 text-ink-faint" /> Centro de ayuda
                  </a>
                </div>
                <div className="h-px bg-line-soft my-1" />
                <button
                  onClick={() => {
                    setRole(null);
                    navigate("/");
                  }}
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
  );
}
