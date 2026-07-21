import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Plus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Logo } from "@/design-system/brand/Logo";
import { Avatar } from "@/design-system/primitives/Avatar";
import { Button } from "@/design-system/primitives/Button";

const NAV: { to: string; label: string }[] = [
  { to: "/reportante", label: "Inicio" },
  { to: "/reportante/nuevo", label: "Nuevo reporte" },
  { to: "/reportante/mis-reportes", label: "Mis reportes" },
  { to: "/reportante/notificaciones", label: "Notificaciones" },
];

export function ReportanteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, currentUser, setRole } = useStore();
  const unread = notifications.filter((n) => !n.read && n.audience !== "seguridad").length;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (to: string) =>
    to === "/reportante" ? location.pathname === "/reportante" : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1200px] mx-auto h-16 px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link to="/reportante">
              <Logo size={32} />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative h-9 px-3.5 inline-flex items-center text-[13px] font-medium rounded-lg transition-colors",
                    isActive(item.to)
                      ? "text-brand-800 bg-brand-50"
                      : "text-ink-soft hover:bg-surface hover:text-ink"
                  )}
                >
                  {item.label}
                  {item.to === "/reportante/notificaciones" && unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-critical ring-2 ring-white" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/reportante/nuevo">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Registrar reporte
              </Button>
            </Link>
            <Link
              to="/reportante/notificaciones"
              className="relative h-9 w-9 grid place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-critical ring-2 ring-white" />
              )}
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-surface transition-colors"
              >
                <Avatar initials={currentUser.initials} size="sm" />
                <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-xl bg-white border border-line shadow-[var(--shadow-pop)] py-1.5 animate-[riseUp_0.18s_ease-out]">
                  <div className="px-3.5 py-2.5 border-b border-line-soft">
                    <p className="text-[13px] font-semibold text-ink">{currentUser.name}</p>
                    <p className="text-[11.5px] text-ink-quiet truncate">{currentUser.email}</p>
                  </div>
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

      <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-quiet">
          <p>SIGMA L1 · Sistema de Gestión de Seguridad Operativa — Línea 1 del Metro de Lima</p>
          <p>Prototipo de demostración · Datos persistentes en este dispositivo</p>
        </div>
      </footer>
    </div>
  );
}
