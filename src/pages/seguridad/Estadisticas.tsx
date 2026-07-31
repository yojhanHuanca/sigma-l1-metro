import { useMemo } from "react";
import {
  PieChart as PieIcon, BarChart3, Calendar, TrendingUp,
  Activity, Shield, Train, AlertOctagon, Gauge, Layers, Zap, CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Pill } from "@/design-system/primitives/Pill";
import {
  CHART_COLORS,
  DonutChart,
  HBarsChart,
  StackedBarChart,
  TrendAreaChart,
} from "@/design-system/charts/Charts";
import {
  AREA_LABELS, EVENT_LABELS, PRIORITY_LABELS, STAGE_STATUS,
  riskCategory, RISK_CATEGORY_LABELS, RISK_CATEGORY_COLOR,
} from "@/lib/types";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Estadisticas() {
  const { cases } = useStore();

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.type, (map.get(c.type) ?? 0) + 1));
    const palette = [CHART_COLORS.brand, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.critical, CHART_COLORS.brandLight, "#8a6fd6", CHART_COLORS.inkFaint, "#5fb4d4", "#c79a3e", "#6c8a7c"];
    return Array.from(map.entries()).map(([type, value], i) => ({
      name: EVENT_LABELS[type as keyof typeof EVENT_LABELS],
      value,
      color: palette[i % palette.length],
    }));
  }, [cases]);

  const byRisk = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => {
      const cat = riskCategory(c.riskLevel);
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return (["inaceptable", "no_deseable", "aceptable_revision", "aceptable"] as const).map((cat) => ({
      name: RISK_CATEGORY_LABELS[cat],
      value: map.get(cat) ?? 0,
      color: RISK_CATEGORY_COLOR[cat],
    }));
  }, [cases]);

  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.area, (map.get(c.area) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([a, value]) => ({ name: AREA_LABELS[a as keyof typeof AREA_LABELS], value, color: CHART_COLORS.brand }))
      .sort((x, y) => y.value - x.value);
  }, [cases]);

  const weekly = useMemo(() => {
    const weeks = 6;
    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (weeks - 1 - i) * 7);
      const start = new Date(d);
      start.setDate(start.getDate() - 7);
      const inWeek = cases.filter((c) => {
        const t = new Date(c.createdAt);
        return t >= start && t < d;
      });
      return {
        label: `S${i + 1}`,
        abiertos: inWeek.filter((c) => c.stage !== "cierre").length,
        cerrados: inWeek.filter((c) => c.stage === "cierre").length,
      };
    });
  }, [cases]);

  const monthlyTrend = useMemo(() => {
    const days = 30;
    const out: { label: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 3) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const count = cases.filter((c) => c.createdAt.slice(0, 10) === dayKey).length;
      out.push({ label: formatDateShort(d), value: count });
    }
    return out;
  }, [cases]);

  // Datos reales de las tablas SOP
  const byTipoSOP = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => {
      const tipo = c.sop?.tipoSOP ?? "sin_clasificar";
      map.set(tipo, (map.get(tipo) ?? 0) + 1);
    });
    const tipos: Record<string, string> = {
      hallazgo: "Hallazgo",
      incidente: "Incidente",
      reporte_voluntario: "Reporte Voluntario",
      accidente: "Accidente",
      sin_clasificar: "Sin clasificar",
    };
    const colors: Record<string, string> = {
      hallazgo: CHART_COLORS.info,
      incidente: CHART_COLORS.warning,
      reporte_voluntario: CHART_COLORS.brand,
      accidente: CHART_COLORS.critical,
      sin_clasificar: CHART_COLORS.inkFaint,
    };
    return Array.from(map.entries()).map(([key, value]) => ({
      name: tipos[key] ?? key,
      value,
      color: colors[key] ?? CHART_COLORS.brand,
    }));
  }, [cases]);

  const byProcedencia = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => {
      const proc = c.sop?.procedencia ?? "sin_procedencia";
      map.set(proc, (map.get(proc) ?? 0) + 1);
    });
    const labels: Record<string, string> = {
      auditoria_ssoma: "Auditoría SSOMA",
      incidencias: "Incidencias",
      reporte_voluntario: "Reporte Voluntario",
      otro: "Otro",
      sin_procedencia: "Sin procedencia",
    };
    const colors: Record<string, string> = {
      auditoria_ssoma: CHART_COLORS.info,
      incidencias: CHART_COLORS.critical,
      reporte_voluntario: CHART_COLORS.brand,
      otro: CHART_COLORS.warning,
      sin_procedencia: CHART_COLORS.inkFaint,
    };
    return Array.from(map.entries()).map(([key, value]) => ({
      name: labels[key] ?? key,
      value,
      color: colors[key] ?? CHART_COLORS.brand,
    }));
  }, [cases]);

  // Por estado de hallazgo
  const byEstadoHallazgo = useMemo(() => {
    const cerrados = cases.filter((c) => c.sop?.estadoHallazgo === "cerrado" || c.stage === "cierre").length;
    const enProceso = cases.filter((c) => c.sop?.estadoHallazgo === "en_proceso" || (STAGE_STATUS[c.stage] === "abierto" && c.stage !== "rechazado")).length;
    return [
      { name: "En Proceso", value: enProceso, color: CHART_COLORS.warning },
      { name: "Cerrado", value: cerrados, color: CHART_COLORS.brand },
    ];
  }, [cases]);

  // Por etapa del workflow
  const byEtapa = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.stage, (map.get(c.stage) ?? 0) + 1));
    const labels: Record<string, string> = {
      recepcion: "Recepción",
      evaluacion: "Evaluación",
      pendiente_info: "Pendiente Info",
      investigacion: "Investigación",
      plan_accion: "Plan de Acción",
      ejecucion: "Ejecución",
      verificacion: "Verificación",
      cierre: "Cierre",
      rechazado: "Rechazado",
    };
    const colors: Record<string, string> = {
      recepcion: CHART_COLORS.info,
      evaluacion: CHART_COLORS.info,
      pendiente_info: CHART_COLORS.warning,
      investigacion: CHART_COLORS.brand,
      plan_accion: CHART_COLORS.brand,
      ejecucion: CHART_COLORS.brand,
      verificacion: CHART_COLORS.warning,
      cierre: CHART_COLORS.brandLight,
      rechazado: CHART_COLORS.critical,
    };
    return Array.from(map.entries()).map(([key, value]) => ({
      name: labels[key] ?? key,
      value,
      color: colors[key] ?? CHART_COLORS.brand,
    }));
  }, [cases]);

  // KPIs principales
  const totalCases = cases.length;
  const openCases = cases.filter((c) => STAGE_STATUS[c.stage] === "abierto").length;
  const closedCases = cases.filter((c) => STAGE_STATUS[c.stage] === "cerrado").length;
  const criticalCaseList = cases.filter((c) => riskCategory(c.riskLevel) === "inaceptable");
  const criticalCases = criticalCaseList.length;
  const closureRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;
  // Área con más casos críticos
  const criticalByArea = new Map<string, number>();
  criticalCaseList.forEach((c) => {
    const area = c.assigneeArea ?? c.area;
    criticalByArea.set(AREA_LABELS[area], (criticalByArea.get(AREA_LABELS[area]) ?? 0) + 1);
  });
  const topCriticalArea = Array.from(criticalByArea.entries()).sort((a, b) => b[1] - a[1])[0];
  // Estación con más casos críticos
  const criticalByStation = new Map<string, number>();
  criticalCaseList.forEach((c) => {
    criticalByStation.set(c.station, (criticalByStation.get(c.station) ?? 0) + 1);
  });
  const topCriticalStation = Array.from(criticalByStation.entries()).sort((a, b) => b[1] - a[1])[0];

  return (
    <SegShell>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-bold text-ink tracking-tight">Estadísticas Operativas</h1>
          <p className="text-[13px] text-ink-quiet mt-1">Análisis multidimensional de los casos de Seguridad Operativa · Línea 1</p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="brand" dot><Activity className="h-3 w-3" /> Tiempo real</Pill>
          <Pill tone="info" dot>{totalCases} casos</Pill>
        </div>
      </div>

      {/* KPI Cards con efecto 3D */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard3D
          icon={<Activity className="h-6 w-6" />}
          label="Casos Activos"
          value={openCases}
          sublabel={`${totalCases} total`}
          gradient="from-brand-500 to-brand-700"
          glowColor="rgba(20,129,74,0.25)"
        />
        <StatCard3D
          icon={<AlertOctagon className="h-6 w-6" />}
          label="Riesgo Inaceptable"
          value={criticalCases}
          sublabel={topCriticalArea ? `Área: ${topCriticalArea[0]}` : "Sin casos críticos"}
          gradient="from-red-500 to-red-700"
          glowColor="rgba(210,58,44,0.25)"
          detail={topCriticalStation ? `Estación: ${topCriticalStation[0]}` : undefined}
        />
        <StatCard3D
          icon={<Shield className="h-6 w-6" />}
          label="Tasa de Cierre"
          value={closureRate}
          suffix="%"
          sublabel={`${closedCases} cerrados`}
          gradient="from-emerald-500 to-emerald-700"
          glowColor="rgba(16,107,62,0.25)"
        />
        <StatCard3D
          icon={<Train className="h-6 w-6" />}
          label="Estaciones"
          value={26}
          sublabel="Línea 1"
          gradient="from-blue-500 to-blue-700"
          glowColor="rgba(44,123,224,0.25)"
        />
      </div>

      {/* Gráficos principales */}
      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        {/* Donut 3D - Tipo de evento */}
        <ChartCard3D
          icon={<PieIcon className="h-4.5 w-4.5" />}
          title="Casos por tipo de evento"
          subtitle="Distribución total"
          accent="brand"
        >
          <div className="relative" style={{ perspective: "800px" }}>
            <div style={{ transform: "rotateX(8deg)", transformOrigin: "center bottom" }}>
              <DonutChart data={byType} height={240} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {byType.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2.5 w-2.5 rounded-md shrink-0 shadow-sm" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard3D>

        {/* Donut 3D - Matriz de riesgo */}
        <ChartCard3D
          icon={<Gauge className="h-4.5 w-4.5" />}
          title="Distribución por Matriz de Riesgo"
          subtitle="Clasificación 1A - 4E"
          accent="critical"
        >
          <div className="relative" style={{ perspective: "800px" }}>
            <div style={{ transform: "rotateX(8deg)", transformOrigin: "center bottom" }}>
              <DonutChart data={byRisk} height={240} innerRadius={55} outerRadius={95} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {byRisk.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2.5 w-2.5 rounded-md shrink-0 shadow-sm" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard3D>
      </div>

      {/* Segunda fila */}
      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {/* Barras 3D - Actividad semanal */}
        <ChartCard3D
          icon={<Calendar className="h-4.5 w-4.5" />}
          title="Actividad semanal"
          subtitle="Casos abiertos vs. cerrados por semana"
          accent="info"
        >
          <div className="relative" style={{ perspective: "800px" }}>
            <div style={{ transform: "rotateX(6deg)", transformOrigin: "center bottom" }}>
              <StackedBarChart data={weekly} height={240} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11.5px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm shadow-sm" style={{ background: CHART_COLORS.brand }} /> Abiertos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm shadow-sm" style={{ background: CHART_COLORS.brandSoft }} /> Cerrados
            </span>
          </div>
        </ChartCard3D>

        {/* Área 3D - Tendencia */}
        <ChartCard3D
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          title="Tendencia de ingresos · 30 días"
          subtitle="Reportes recibidos en el último mes"
          accent="brand"
        >
          <div className="relative" style={{ perspective: "800px" }}>
            <div style={{ transform: "rotateX(6deg)", transformOrigin: "center bottom" }}>
              <TrendAreaChart data={monthlyTrend} height={240} />
            </div>
          </div>
        </ChartCard3D>
      </div>

      {/* Tercera fila — Datos SOP reales */}
      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <ChartCard3D
          icon={<PieIcon className="h-4.5 w-4.5" />}
          title="Casos por Tipo de SOP"
          subtitle="Hallazgo · Incidente · Reporte Voluntario · Accidente"
          accent="info"
        >
          <DonutChart data={byTipoSOP} height={240} />
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {byTipoSOP.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2.5 w-2.5 rounded-md shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard3D>

        <ChartCard3D
          icon={<BarChart3 className="h-4.5 w-4.5" />}
          title="Casos por Área Responsable"
          subtitle="Carga operativa por área"
          accent="brand"
        >
          <HBarsChart data={byArea} height={260} />
        </ChartCard3D>
      </div>

      {/* Cuarta fila — Más datos SOP */}
      <div className="mt-5 grid lg:grid-cols-3 gap-5">
        <ChartCard3D
          icon={<Shield className="h-4.5 w-4.5" />}
          title="Por Procedencia"
          subtitle="Origen del caso"
          accent="warning"
        >
          <DonutChart data={byProcedencia} height={200} />
          <div className="mt-3 space-y-1.5">
            {byProcedencia.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2.5 w-2.5 rounded-md shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard3D>

        <ChartCard3D
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          title="Estado de Hallazgo"
          subtitle="Cerrados vs En proceso"
          accent="brand"
        >
          <DonutChart data={byEstadoHallazgo} height={200} innerRadius={45} outerRadius={80} />
          <div className="mt-3 space-y-1.5">
            {byEstadoHallazgo.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2.5 w-2.5 rounded-md shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard3D>

        <ChartCard3D
          icon={<Activity className="h-4.5 w-4.5" />}
          title="Casos por Etapa"
          subtitle="Distribución en el workflow"
          accent="info"
        >
          <HBarsChart data={byEtapa} height={240} />
        </ChartCard3D>
      </div>

      {/* Resumen inferior */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-6 text-white relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(12,84,49,0.5)]">
        <div className="absolute -right-16 -top-16 opacity-10">
          <Train className="h-48 w-48" />
        </div>
        <div className="relative grid sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-brand-200" />
              <p className="text-[11px] font-semibold tracking-wider uppercase text-brand-200">Resumen Ejecutivo</p>
            </div>
            <p className="text-[14px] leading-relaxed text-white/90">
              Se han gestionado <strong className="text-white">{totalCases} casos</strong> en total, con una tasa de cierre del <strong className="text-white">{closureRate}%</strong>. {criticalCases > 0 && <>{criticalCases} casos con riesgo inaceptable requieren atención inmediata.</>}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-brand-200" />
              <p className="text-[11px] font-semibold tracking-wider uppercase text-brand-200">Indicador Clave</p>
            </div>
            <p className="text-[26px] font-bold tabular-nums">{closureRate}%</p>
            <p className="text-[12px] text-brand-200 mt-1">Cumplimiento de cierre de casos</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-brand-200" />
              <p className="text-[11px] font-semibold tracking-wider uppercase text-brand-200">Estado del Sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[14px] font-medium text-white">Operativo · Línea 1</p>
            </div>
            <p className="text-[12px] text-brand-200 mt-1">26 estaciones · 44 trenes · 34 km</p>
          </div>
        </div>
      </div>
    </SegShell>
  );
}

/* ─── Stat Card 3D ─── */
function StatCard3D({
  icon, label, value, suffix, sublabel, gradient, glowColor, detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  sublabel: string;
  gradient: string;
  glowColor: string;
  detail?: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-5 text-white overflow-hidden transition-transform hover:-translate-y-1 duration-300"
      style={{
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        boxShadow: `0 12px 30px -8px ${glowColor}, 0 4px 12px -4px rgba(0,0,0,0.1)`,
      }}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", gradient)} />
      {/* Brillo superior 3D */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      {/* Icono flotante */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center shadow-lg ring-1 ring-white/30">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[10.5px] font-semibold tracking-wider uppercase text-white/80">{label}</p>
        </div>
      </div>
      <div className="relative">
        <p className="text-[32px] font-bold tabular-nums leading-none">
          {value}<span className="text-[20px]">{suffix}</span>
        </p>
        <p className="text-[11.5px] text-white/80 mt-2">{sublabel}</p>
        {detail && <p className="text-[11px] text-white/70 mt-1">{detail}</p>}
      </div>
    </div>
  );
}

/* ─── Chart Card 3D ─── */
function ChartCard3D({
  icon, title, subtitle, accent, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: "brand" | "critical" | "warning" | "info";
  children: React.ReactNode;
}) {
  const accents = {
    brand: "from-brand-50 to-white border-brand-100",
    critical: "from-red-50 to-white border-red-100",
    warning: "from-yellow-50 to-white border-yellow-100",
    info: "from-blue-50 to-white border-blue-100",
  };
  const iconAccents = {
    brand: "bg-brand-50 text-brand-700",
    critical: "bg-red-50 text-red-700",
    warning: "bg-yellow-50 text-yellow-700",
    info: "bg-blue-50 text-blue-700",
  };
  return (
    <Card className={cn("p-5 border bg-gradient-to-br", accents[accent])} >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center shadow-sm", iconAccents[accent])}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-ink tracking-tight truncate">{title}</h3>
          <p className="text-[12px] text-ink-quiet mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
