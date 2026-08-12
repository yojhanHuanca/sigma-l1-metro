import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CalendarDays,
  Clock,
  CalendarRange,
  Timer,
  Plus,
  History,
  Search,
  Activity,
} from "lucide-react";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { cn } from "@/lib/utils";
import { useMonitoreoStore, formatoHoy, parseFecha, formatoDemora } from "@/lib/monitoreoStore";
import { TIPO_INCIDENTE_LABELS } from "@/lib/types";
import { EventoTable, EstadoFiltroPills } from "./EventoTable";

function fechaEsHoy(fecha: string): boolean {
  const dt = parseFecha(fecha);
  if (!dt) return false;
  const hoy = new Date();
  return (
    dt.getFullYear() === hoy.getFullYear() &&
    dt.getMonth() === hoy.getMonth() &&
    dt.getDate() === hoy.getDate()
  );
}

function fechaEnUltimos7Dias(fecha: string): boolean {
  const dt = parseFecha(fecha);
  if (!dt) return false;
  const hoy = new Date();
  const limite = hoy.getTime() - 6 * 86400000;
  const ts = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  const hoyTs = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  return ts >= limite && ts <= hoyTs;
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: "brand" | "warning" | "neutral";
}) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-quiet">{label}</span>
        <span
          className={cn(
            "h-9 w-9 rounded-lg grid place-items-center",
            tone === "brand" && "bg-brand-50 text-brand-700",
            tone === "warning" && "bg-yellow-50 text-yellow-600",
            tone === "neutral" && "bg-surface-2 text-ink-soft"
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-[26px] font-bold text-ink leading-none tracking-tight tabular-nums">{value}</p>
      {hint && <p className="text-[11.5px] text-ink-faint">{hint}</p>}
    </Card>
  );
}

export function MonitoreoDashboard() {
  const { eventos } = useMonitoreoStore();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");

  const kpis = useMemo(() => {
    const hoy = eventos.filter((e) => fechaEsHoy(e.fecha));
    const pendientes = eventos.filter((e) => e.estado === "pendiente");
    const semana = eventos.filter((e) => fechaEnUltimos7Dias(e.fecha));
    const conDemora = eventos.filter((e) => e.demora !== null && e.demora !== undefined);
    const prom =
      conDemora.length > 0
        ? Math.round(conDemora.reduce((acc, e) => acc + (e.demora ?? 0), 0) / conDemora.length)
        : null;
    return { total: eventos.length, hoy: hoy.length, pendientes: pendientes.length, semana: semana.length, prom };
  }, [eventos]);

  const recientes = useMemo(() => {
    const term = q.trim().toLowerCase();
    return eventos
      .filter((e) => {
        if (estado !== "todos" && e.estado !== estado) return false;
        if (!term) return true;
        return (
          e.codigo.toLowerCase().includes(term) ||
          e.descripcion.toLowerCase().includes(term) ||
          e.nroMR.toLowerCase().includes(term) ||
          e.nroCarrera.toLowerCase().includes(term) ||
          TIPO_INCIDENTE_LABELS[e.tipoIncidente].toLowerCase().includes(term)
        );
      })
      .slice(0, 8);
  }, [eventos, q, estado]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Eventos registrados" value={String(kpis.total)} icon={<ClipboardList className="h-4 w-4" />} hint="Total acumulado" />
        <KpiCard label="Eventos de hoy" value={String(kpis.hoy)} icon={<CalendarDays className="h-4 w-4" />} hint={formatoHoy()} />
        <KpiCard label="Eventos pendientes" value={String(kpis.pendientes)} icon={<Clock className="h-4 w-4" />} hint="Requieren atención" tone="warning" />
        <KpiCard label="Eventos de esta semana" value={String(kpis.semana)} icon={<CalendarRange className="h-4 w-4" />} hint="Últimos 7 días" />
        <KpiCard label="Tiempo promedio de demora" value={kpis.prom !== null ? `${kpis.prom} min` : "—"} icon={<Timer className="h-4 w-4" />} hint="Promedio general" />
      </div>

      {/* Acciones rápidas */}
      <div className="rounded-[14px] bg-white border border-line shadow-[var(--shadow-card)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Acciones rápidas</h3>
            <p className="text-[12.5px] text-ink-quiet mt-0.5">Registre un nuevo evento operativo o consulte el historial completo.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/monitoreo/nuevo">
            <Button size="md">
              <Plus className="h-4 w-4" /> Registrar nuevo evento
            </Button>
          </Link>
          <Link to="/monitoreo/historial">
            <Button variant="outline" size="md">
              <History className="h-4 w-4" /> Ver historial
            </Button>
          </Link>
        </div>
      </div>

      {/* Recientes */}
      <Card className="p-0">
        <div className="px-5 pt-5 pb-4 space-y-4">
          <CardHeader
            title="Eventos recientes"
            subtitle="Últimos eventos registrados en el sistema"
            action={
              <Link to="/monitoreo/historial" className="text-[12.5px] font-semibold text-brand-700 hover:underline whitespace-nowrap">
                Ver todos
              </Link>
            }
          />
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-surface border border-line text-ink-quiet md:w-[320px]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por código, descripción, Nro. MR o carrera…"
                className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
              />
            </div>
            <EstadoFiltroPills value={estado} onChange={setEstado} />
          </div>
        </div>
        <div className="px-5 pb-5">
          <EventoTable eventos={recientes} />
        </div>
      </Card>
    </div>
  );
}
