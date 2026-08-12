import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  History, 
  BarChart3, 
  Settings,
  ChevronRight,
  Activity,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Monitoreo",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/monitoreo" },
      { label: "Registrar Evento", icon: Plus, path: "/monitoreo/nuevo" },
      { label: "Historial", icon: History, path: "/monitoreo/historial" },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Indicadores", icon: BarChart3, path: "/monitoreo/indicadores" },
      { label: "Reportes", icon: Activity, path: "/monitoreo/reportes" },
    ],
  },
];

export function MonitoreoSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-line flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-line flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00A94F] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-ink text-sm">Monitoreo</h1>
            <p className="text-xs text-ink-quiet">Incidentes Operativos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 flex-shrink-0">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-[11px] font-semibold text-ink-quiet uppercase tracking-wider mb-2 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== "/monitoreo" && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-[#00A94F] text-white shadow-sm"
                        : "text-ink-soft hover:bg-surface hover:text-ink"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-line flex-shrink-0 space-y-3">
        <a
          href="https://sofia.lineauno.pe/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#00A94F] text-white shadow-sm hover:bg-[#008F42] transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="flex-1">SOFIA</span>
        </a>
        <div className="text-xs text-ink-quiet text-center">
          <p>Línea 1 Metro de Lima</p>
          <p className="mt-1">Sistema de Monitoreo v1.0</p>
        </div>
      </div>
    </aside>
  );
}
