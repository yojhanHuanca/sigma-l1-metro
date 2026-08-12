import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Plus,
  History,
  BarChart3,
  Settings,
  Activity,
  ChevronRight,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/design-system/brand/Logo";
import { Avatar } from "@/design-system/primitives/Avatar";

const MONITOR_USER = { name: "María Torres", role: "Monitoreo", initials: "MT" };

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavItem[];
}

const groups: NavGroup[] = [
  {
    id: "eventos",
    label: "Eventos",
    icon: FileText,
    children: [
      { to: "/monitoreo/eventos", label: "Monitoreo", icon: Activity },
      { to: "/monitoreo/nuevo", label: "Registrar evento", icon: Plus },
      { to: "/monitoreo/historial", label: "Historial", icon: History },
    ],
  },
];

const standalone: NavItem[] = [
  { to: "/monitoreo/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/monitoreo/indicadores", label: "Indicadores", icon: Activity },
  { to: "/monitoreo/configuracion", label: "Configuración", icon: Settings },
];

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/monitoreo": { title: "Dashboard de Monitoreo", crumb: "Inicio / Dashboard" },
  "/monitoreo/eventos": { title: "Monitoreo de Eventos", crumb: "Eventos / Monitoreo" },
  "/monitoreo/nuevo": { title: "Registrar evento", crumb: "Eventos / Nuevo evento" },
  "/monitoreo/editar": { title: "Editar evento", crumb: "Eventos / Editar" },
  "/monitoreo/eventos/": { title: "Detalle del evento", crumb: "Eventos / Detalle" },
  "/monitoreo/historial": { title: "Historial de eventos", crumb: "Eventos / Historial" },
  "/monitoreo/reportes": { title: "Reportes", crumb: "Análisis / Reportes" },
  "/monitoreo/indicadores": { title: "Indicadores", crumb: "Análisis / Indicadores" },
  "/monitoreo/configuracion": { title: "Configuración", crumb: "Sistema / Configuración" },
};

function isEventoDetalle(pathname: string) {
  return /^\/monitoreo\/eventos\/[^/]+$/.test(pathname);
}

function titleFor(pathname: string) {
  if (pathname === "/monitoreo") return TITLES["/monitoreo"];
  if (pathname.startsWith("/monitoreo/editar")) return TITLES["/monitoreo/editar"];
  if (isEventoDetalle(pathname)) return TITLES["/monitoreo/eventos/"];
  return TITLES[pathname] ?? TITLES["/monitoreo"];
}

export function MonitoreoShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = titleFor(location.pathname);

  const childActive = (to: string) => {
    if (to === "/monitoreo/eventos") {
      return location.pathname === "/monitoreo/eventos" || isEventoDetalle(location.pathname);
    }
    if (to === "/monitoreo/nuevo") {
      return location.pathname === "/monitoreo/nuevo" || location.pathname.startsWith("/monitoreo/editar");
    }
    return location.pathname === to;
  };

  const isActive = (to: string) =>
    to === "/monitoreo" ? location.pathname === "/monitoreo" : childActive(to);

  const groupOpen = groups.some((g) => g.children.some((c) => isActive(c.to)));

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ─── Sidebar ─── */}
      <aside className="w-[260px] shrink-0 h-screen sticky top-0 bg-white border-r border-line flex flex-col">
        <div className="px-5 h-16 flex items-center border-b border-line-soft">
          <Link to="/monitoreo">
            <Logo size={110} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
          <p className="px-3 text-[10px] font-semibold tracking-[0.16em] uppercase text-ink-faint mb-2">
            Monitoreo de Eventos
          </p>

          <div className="space-y-1">
            <Link
              to="/monitoreo"
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors",
                location.pathname === "/monitoreo"
                  ? "bg-brand-50 text-brand-800"
                  : "text-ink-soft hover:bg-surface hover:text-ink"
              )}
            >
              <LayoutDashboard className={cn("h-[18px] w-[18px] shrink-0", location.pathname === "/monitoreo" ? "text-brand-700" : "text-ink-quiet")} />
              <span className="flex-1">Dashboard</span>
            </Link>

            {groups.map((group) => (
              <div key={group.id}>
                <div
                  className={cn(
                    "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium",
                    groupOpen ? "text-ink bg-surface" : "text-ink-soft"
                  )}
                >
                  <group.icon className={cn("h-[18px] w-[18px] shrink-0", groupOpen ? "text-brand-700" : "text-ink-quiet")} />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("h-4 w-4 text-ink-faint transition-transform", groupOpen && "rotate-180")} />
                </div>
                {groupOpen && (
                  <div className="mt-0.5 mb-1.5 ml-3 pl-3 border-l border-line-soft space-y-0.5 reveal-up">
                    {group.children.map((item) => {
                      const active = isActive(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            "flex items-center gap-2.5 pl-3 pr-2 h-9 rounded-md text-[12.5px] font-medium transition-all",
                            active ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-surface hover:text-ink"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-700" : "text-ink-faint")} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {active && <ChevronRight className="h-3.5 w-3.5 text-brand-600" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="h-px bg-line-soft my-3 mx-3" />

          <div className="space-y-1">
            {standalone.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-800" : "text-ink-soft hover:bg-surface hover:text-ink"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand-700" : "text-ink-quiet")} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-line-soft">
          <div className="rounded-xl bg-surface p-3 flex items-center gap-3">
            <Avatar initials={MONITOR_USER.initials} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink truncate">{MONITOR_USER.name}</p>
              <p className="text-[11px] text-ink-quiet truncate">{MONITOR_USER.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 min-w-0 flex flex-col">
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
              <Link
                to="/monitoreo/nuevo"
                className="inline-flex items-center gap-2 h-10 px-4 text-[13.5px] font-medium rounded-lg bg-brand-700 text-white shadow-sm hover:bg-brand-800 transition-all"
              >
                <Plus className="h-4 w-4" />
                Registrar evento
              </Link>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 h-10 px-3 text-[13px] font-medium rounded-lg text-ink-soft hover:bg-surface hover:text-ink transition-all"
                title="Cambiar de perfil"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Cambiar de perfil</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-7 py-7 max-w-[1500px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
