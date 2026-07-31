import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Phone, Building2, ShieldCheck, Bell, LogOut, RotateCcw,
  Check, Globe, Clock, Activity, FolderKanban, AlertOctagon, CheckCircle2,
  TrendingUp, MapPin, Train, FileSearch, ClipboardList, Gauge, Zap,
  ChevronRight, Calendar, Award, Target, Eye,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";
import { Avatar } from "@/design-system/primitives/Avatar";
import { Pill, RiskPill } from "@/design-system/primitives/Pill";
import { Modal } from "@/design-system/primitives/Modal";
import {
  AREA_LABELS, STAGE_LABELS, STAGE_STATUS, riskCategory,
} from "@/lib/types";
import { cn, relativeTime, formatDateTime, slaState, daysUntil } from "@/lib/utils";

export function Profile() {
  const { currentUser, setRole, resetAll, cases, notifications } = useStore();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Estadísticas reales conectadas a los datos del sistema
  const stats = useMemo(() => {
    const open = cases.filter((c) => STAGE_STATUS[c.stage] === "abierto").length;
    const closed = cases.filter((c) => STAGE_STATUS[c.stage] === "cerrado").length;
    const critical = cases.filter((c) => riskCategory(c.riskLevel) === "inaceptable" && STAGE_STATUS[c.stage] === "abierto").length;
    const overdue = cases.filter((c) => STAGE_STATUS[c.stage] === "abierto" && slaState(c.slaDueDate, c.stage) === "overdue").length;
    const closureRate = cases.length > 0 ? Math.round((closed / cases.length) * 100) : 0;
    return { total: cases.length, open, closed, critical, overdue, closureRate };
  }, [cases]);

  // Actividad reciente del usuario (timeline)
  const myActivity = useMemo(() => {
    return cases
      .flatMap((c) => c.timeline.map((t) => ({ ...t, caseId: c.id, caseTitle: c.title, riskLevel: c.riskLevel })))
      .filter((t) => t.actorRole === "seguridad")
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 6);
  }, [cases]);

  // Casos que gestiono actualmente
  const myCases = useMemo(() => {
    return cases
      .filter((c) => STAGE_STATUS[c.stage] === "abierto")
      .sort((a, b) => {
        const aCritical = riskCategory(a.riskLevel) === "inaceptable" ? 0 : 1;
        const bCritical = riskCategory(b.riskLevel) === "inaceptable" ? 0 : 1;
        if (aCritical !== bCritical) return aCritical - bCritical;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      })
      .slice(0, 4);
  }, [cases]);

  // Notificaciones no leídas
  const unreadNotifs = notifications.filter((n) => !n.read && n.audience !== "reportante").length;

  // Permisos del rol Seguridad Operativa
  const myPermissions = [
    { label: "Ver y gestionar casos", icon: FolderKanban, granted: true },
    { label: "Aprobar / rechazar reportes", icon: CheckCircle2, granted: true },
    { label: "Investigación de casos", icon: FileSearch, granted: true },
    { label: "Crear planes de acción", icon: ClipboardList, granted: true },
    { label: "Verificar y cerrar casos", icon: ShieldCheck, granted: true },
    { label: "Ver KPIs y estadísticas", icon: Gauge, granted: true },
    { label: "Exportar reportes PDF", icon: TrendingUp, granted: true },
    { label: "Acceso al Centro de Administración", icon: Building2, granted: true },
  ];

  return (
    <SegShell>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Mi Perfil</h1>
          <p className="text-[13px] text-ink-quiet mt-1">Información de la cuenta, actividad y preferencias del sistema.</p>
        </div>
        <Pill tone="brand" dot><ShieldCheck className="h-3 w-3" /> Seguridad Operativa</Pill>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        {/* Columna izquierda — Profile + Stats + Quick Access */}
        <div className="space-y-5">
          {/* Profile card */}
          <Card className="text-center overflow-hidden">
            {/* Banner gradient */}
            <div className="h-20 bg-gradient-to-br from-brand-600 to-brand-800 relative">
              <div className="absolute inset-0 bg-mesh opacity-20" />
            </div>
            <div className="px-5 pb-5 -mt-10">
              <div className="mx-auto h-20 w-20 rounded-full bg-brand-700 text-white grid place-items-center text-[26px] font-bold ring-4 ring-white shadow-lg">
                {currentUser.initials}
              </div>
              <h2 className="mt-3 text-[18px] font-bold text-ink">{currentUser.name}</h2>
              <p className="text-[12.5px] text-ink-quiet mt-0.5">{currentUser.email}</p>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                <Pill tone="brand" dot><ShieldCheck className="h-3 w-3" /> Seguridad Operativa</Pill>
                <Pill tone="info" dot><Activity className="h-3 w-3" /> En línea</Pill>
              </div>
            </div>
          </Card>

          {/* Stats conectadas a datos reales */}
          <Card padded={false}>
            <div className="p-4 border-b border-line-soft">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Resumen Operativo</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <StatBlock icon={<FolderKanban className="h-4 w-4" />} label="Casos gestionados" value={stats.total} tone="info" />
              <StatBlock icon={<Activity className="h-4 w-4" />} label="Casos activos" value={stats.open} tone="brand" />
              <StatBlock icon={<AlertOctagon className="h-4 w-4" />} label="Críticos" value={stats.critical} tone="critical" />
              <StatBlock icon={<CheckCircle2 className="h-4 w-4" />} label="Cerrados" value={stats.closed} tone="brand" />
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-lg bg-surface p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-ink-quiet uppercase tracking-wider">Tasa de cierre</span>
                  <span className="text-[14px] font-bold text-brand-700 tabular-nums">{stats.closureRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500" style={{ width: `${stats.closureRate}%` }} />
                </div>
              </div>
              {stats.overdue > 0 && (
                <div className="mt-2 rounded-lg bg-critical-soft border border-critical/20 px-3 py-2 flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 text-critical shrink-0" />
                  <span className="text-[11.5px] text-critical-ink">{stats.overdue} caso(s) con SLA vencido</span>
                </div>
              )}
            </div>
          </Card>

          {/* Accesos rápidos enlazados */}
          <Card padded={false}>
            <div className="p-4 border-b border-line-soft">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Accesos Rápidos</p>
            </div>
            <div className="p-2">
              <QuickLink to="/seguridad" icon={<Gauge className="h-4.5 w-4.5" />} label="Dashboard Ejecutivo" />
              <QuickLink to="/seguridad/casos" icon={<FolderKanban className="h-4.5 w-4.5" />} label="Gestión de Casos" badge={stats.open} />
              <QuickLink to="/seguridad/decisiones" icon={<ClipboardList className="h-4.5 w-4.5" />} label="Centro de Decisiones" />
              <QuickLink to="/seguridad/alertas" icon={<Bell className="h-4.5 w-4.5" />} label="Alertas" badge={unreadNotifs} badgeTone="critical" />
              <QuickLink to="/seguridad/kpis" icon={<TrendingUp className="h-4.5 w-4.5" />} label="KPIs" />
              <QuickLink to="/seguridad/estadisticas" icon={<Activity className="h-4.5 w-4.5" />} label="Estadísticas" />
              <QuickLink to="/seguridad/usuarios" icon={<User className="h-4.5 w-4.5" />} label="Administración de Usuarios" />
            </div>
          </Card>
        </div>

        {/* Columna derecha — Configuración + Actividad + Permisos */}
        <div className="lg:col-span-2 space-y-5">
          {/* Datos personales */}
          <Card>
            <CardHeader icon={<User className="h-4.5 w-4.5" />} title="Datos personales" subtitle="Información de la cuenta institucional" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombres y apellidos">
                <Input defaultValue={currentUser.name} />
              </Field>
              <Field label="Correo institucional">
                <Input defaultValue={currentUser.email} />
              </Field>
              <Field label="Teléfono">
                <Input defaultValue="+51 999 887 654" />
              </Field>
              <Field label="Área">
                <Select defaultValue="seguridad">
                  <option value="seguridad">Seguridad Operativa</option>
                </Select>
              </Field>
              <Field label="Cargo">
                <Input defaultValue="Analista Senior de Seguridad Operativa" />
              </Field>
              <Field label="Sede">
                <Select defaultValue="central">
                  <option value="central">Centro de Control · Estación Central</option>
                  <option value="atocongo">Atocongo</option>
                  <option value="ves">Patio Taller Villa El Salvador</option>
                </Select>
              </Field>
            </div>
            <div className="mt-5 pt-4 border-t border-line-soft flex items-center justify-end gap-2">
              {saved && (
                <span className="text-[12px] text-brand-700 font-medium flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Cambios guardados
                </span>
              )}
              <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
                <Check className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </Card>

          {/* Casos que gestiono actualmente */}
          <Card padded={false}>
            <div className="p-4 border-b border-line-soft flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                  <FolderKanban className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-ink">Casos bajo mi gestión</p>
                  <p className="text-[11.5px] text-ink-quiet">Casos activos ordenados por prioridad de riesgo</p>
                </div>
              </div>
              <Link to="/seguridad/casos">
                <Button variant="ghost" size="sm">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
            <div className="divide-y divide-line-soft">
              {myCases.length === 0 && (
                <div className="p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-brand-600 mx-auto" />
                  <p className="text-[13px] font-medium text-ink mt-2">Sin casos activos</p>
                  <p className="text-[11.5px] text-ink-quiet mt-1">Todos los casos están bajo control.</p>
                </div>
              )}
              {myCases.map((c) => {
                const sla = slaState(c.slaDueDate, c.stage);
                const days = daysUntil(c.slaDueDate);
                return (
                  <Link
                    key={c.id}
                    to={`/seguridad/casos/${c.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors group"
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                      riskCategory(c.riskLevel) === "inaceptable" ? "bg-critical-soft text-critical-ink" : "bg-brand-50 text-brand-700"
                    )}>
                      <FileSearch className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11.5px] font-semibold text-brand-700">{c.id}</span>
                        <RiskPill risk={c.riskLevel} />
                      </div>
                      <p className="text-[13px] font-semibold text-ink truncate mt-0.5">{c.title}</p>
                      <p className="text-[11px] text-ink-quiet mt-0.5">
                        {STAGE_LABELS[c.stage]} · {c.station} · {relativeTime(c.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {sla === "overdue" ? (
                        <Pill tone="critical" dot>Vencido {Math.abs(days)}d</Pill>
                      ) : sla === "soon" ? (
                        <Pill tone="warning" dot>{days}d</Pill>
                      ) : (
                        <span className="text-[11px] tabular-nums text-ink-quiet">{days}d</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Actividad reciente */}
          <Card padded={false}>
            <div className="p-4 border-b border-line-soft flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-info-soft text-info-ink grid place-items-center">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-ink">Mi actividad reciente</p>
                  <p className="text-[11.5px] text-ink-quiet">Últimas acciones registradas en el sistema</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-line-soft max-h-[280px] overflow-y-auto">
              {myActivity.length === 0 && (
                <div className="p-6 text-center text-[12.5px] text-ink-quiet">Sin actividad reciente.</div>
              )}
              {myActivity.map((t) => (
                <Link
                  key={t.id}
                  to={`/seguridad/casos/${t.caseId}`}
                  className="flex items-start gap-3 p-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-800 grid place-items-center shrink-0 text-[11px] font-semibold">
                    {t.actor.split(" ").map((p) => p[0] || "").slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-ink">
                      <span className="font-semibold">{t.title}</span>
                    </p>
                    <p className="text-[11px] text-ink-quiet mt-0.5">
                      <span className="font-mono text-brand-700">{t.caseId}</span> · {relativeTime(t.at)}
                    </p>
                  </div>
                  <RiskPill risk={t.riskLevel} />
                </Link>
              ))}
            </div>
          </Card>

          {/* Permisos del rol */}
          <Card padded={false}>
            <div className="p-4 border-b border-line-soft">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-ink">Permisos del rol</p>
                  <p className="text-[11.5px] text-ink-quiet">Funciones habilitadas para Seguridad Operativa</p>
                </div>
              </div>
            </div>
            <div className="p-4 grid sm:grid-cols-2 gap-2.5">
              {myPermissions.map((p) => (
                <div key={p.label} className="flex items-center gap-2.5 rounded-lg border border-line-soft px-3 py-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[12.5px] text-ink-soft flex-1">{p.label}</span>
                  <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                </div>
              ))}
            </div>
          </Card>

          {/* Preferencias */}
          <Card>
            <CardHeader icon={<Bell className="h-4.5 w-4.5" />} title="Preferencias de notificación" subtitle="Cómo y cuándo recibir avisos" />
            <div className="space-y-1">
              <ToggleRow icon={<Mail className="h-4 w-4" />} label="Notificaciones por correo" description="Recibir avisos en el correo institucional" defaultOn />
              <ToggleRow icon={<Bell className="h-4 w-4" />} label="Alertas críticas en tiempo real" description="Avisos inmediatos para casos críticos" defaultOn />
              <ToggleRow icon={<Clock className="h-4 w-4" />} label="Resumen diario" description="Correo con el consolidado del día a las 08:00" />
              <ToggleRow icon={<ShieldCheck className="h-4 w-4" />} label="Notificaciones de SLA" description="Avisos cuando un caso está próximo a vencer" defaultOn />
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Globe className="h-4.5 w-4.5" />} title="Apariencia y región" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Idioma">
                <Select defaultValue="es">
                  <option value="es">Español (Perú)</option>
                  <option value="en">English</option>
                </Select>
              </Field>
              <Field label="Zona horaria">
                <Select defaultValue="lima">
                  <option value="lima">America/Lima (UTC-5)</option>
                </Select>
              </Field>
              <Field label="Tema">
                <Select defaultValue="light">
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </Select>
              </Field>
              <Field label="Formato de fecha">
                <Select defaultValue="dmy">
                  <option value="dmy">DD MMM YYYY</option>
                  <option value="ymd">YYYY-MM-DD</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Danger / session */}
          <Card className="border-critical/20">
            <CardHeader icon={<LogOut className="h-4.5 w-4.5" />} title="Sesión y datos" subtitle="Acciones de la cuenta en este dispositivo" />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setRole(null); navigate("/"); }}>
                  <LogOut className="h-4 w-4" /> Cambiar de perfil
                </Button>
                <Button variant="ghost" size="sm" className="text-critical hover:bg-critical-soft" onClick={() => setResetOpen(true)}>
                  <RotateCcw className="h-4 w-4" /> Restablecer datos de demo
                </Button>
              </div>
              <span className="text-[11.5px] text-ink-faint">Los datos se guardan solo en este navegador.</span>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Restablecer datos de demostración"
        subtitle="Se borrarán todos los cambios y se recargarán los casos sembrados."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { resetAll(); setResetOpen(false); navigate("/seguridad"); }}>
              <RotateCcw className="h-4 w-4" /> Restablecer
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-soft">
          Esta acción devuelve el sistema al estado inicial de demostración. Los casos y
          notificaciones que modificó durante la sesión se perderán.
        </p>
      </Modal>
    </SegShell>
  );
}

/* ─── Stat Block ─── */
function StatBlock({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "info" | "brand" | "critical" }) {
  const tones = {
    info: "bg-info-soft text-info-ink",
    brand: "bg-brand-50 text-brand-700",
    critical: "bg-critical-soft text-critical-ink",
  };
  return (
    <div className="rounded-xl border border-line-soft p-3">
      <div className={cn("h-8 w-8 rounded-lg grid place-items-center mb-2", tones[tone])}>
        {icon}
      </div>
      <p className="text-[20px] font-bold tabular-nums text-ink leading-none">{value}</p>
      <p className="text-[10.5px] text-ink-quiet mt-1">{label}</p>
    </div>
  );
}

/* ─── Quick Link ─── */
function QuickLink({ to, icon, label, badge, badgeTone }: { to: string; icon: React.ReactNode; label: string; badge?: number; badgeTone?: "critical" | "brand" }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors group"
    >
      <span className="text-ink-quiet group-hover:text-brand-700 transition-colors">{icon}</span>
      <span className="flex-1 text-[12.5px] font-medium text-ink-soft group-hover:text-ink transition-colors">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "tabular-nums text-[10px] font-semibold px-1.5 h-4.5 min-w-[18px] grid place-items-center rounded-full",
          badgeTone === "critical" ? "bg-critical text-white" : "bg-brand-100 text-brand-800"
        )} style={{ minHeight: 18 }}>
          {badge}
        </span>
      )}
      <ChevronRight className="h-3.5 w-3.5 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-ink-soft">{label}</span>
      <span className="text-[16px] font-bold tabular-nums text-ink">{value}</span>
    </div>
  );
}

function ToggleRow({ icon, label, description, defaultOn }: { icon: React.ReactNode; label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-line-soft last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-surface-2 text-ink-soft grid place-items-center shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">{label}</p>
          <p className="text-[11.5px] text-ink-quiet mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-brand-600" : "bg-surface-3"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
