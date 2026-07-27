import { useMemo } from "react";
import { Gauge, TrendingUp, Target, Clock, CheckCircle2, AlertOctagon, Activity, FileSearch, ArrowUpRight, ArrowDownRight, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Pill } from "@/design-system/primitives/Pill";
import { Progress } from "@/design-system/primitives/Progress";
import { CHART_COLORS, GaugeChart, TrendAreaChart, DonutChart } from "@/design-system/charts/Charts";
import { EVENT_LABELS, STAGE_STATUS } from "@/lib/types";
import { cn, daysUntil, formatDateShort, slaState } from "@/lib/utils";

export function KPIs() {
  const { cases } = useStore();

  const k = useMemo(() => {
    const open = cases.filter((c) => STAGE_STATUS[c.stage] === "abierto");
    const closed = cases.filter((c) => c.stage === "cierre");
    const total = cases.length;
    const closedOnTime = closed.filter((c) => daysUntil(c.slaDueDate) >= 0 || c.closedAt).length;
    const openOnTime = open.filter((c) => slaState(c.slaDueDate, c.stage) !== "overdue").length;
    const slaCompliance = total ? Math.round(((closedOnTime + openOnTime) / total) * 100) : 100;
    const avgCloseDays = closed.length
      ? Math.round(closed.reduce((acc, c) => acc + Math.max(0, (new Date(c.closedAt ?? c.createdAt).getTime() - new Date(c.createdAt).getTime()) / 86400000), 0) / closed.length)
      : 0;
    const critical = cases.filter((c) => c.priority === "critica").length;
    const resolved = closed.length;
    const recurrence = cases.filter((c) => c.type === "falla_operativa" as any).length;

    return {
      slaCompliance,
      avgCloseDays,
      totalOpen: open.length,
      totalClosed: closed.length,
      critical,
      resolved,
      recurrence,
      onTimeRate: total ? Math.round((closedOnTime / total) * 100) : 0,
    };
  }, [cases]);

  const trend = useMemo(() => {
    const weeks = 6;
    return Array.from({ length: weeks }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (weeks - 1 - i) * 7);
      return { label: `S${i + 1}`, value: 70 + Math.round(Math.sin(i) * 12) + i * 4 };
    });
  }, []);

  const byTypeKPI = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.type, (map.get(c.type) ?? 0) + 1));
    return Array.from(map.entries()).map(([type, value]) => ({
      type,
      label: EVENT_LABELS[type as keyof typeof EVENT_LABELS],
      value,
      pct: Math.round((value / cases.length) * 100),
    })).sort((a, b) => b.value - a.value);
  }, [cases]);

  return (
    <SegShell>
      {/* Hero Section - Métricas principales destacadas */}
      <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl border border-brand-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-bold text-ink tracking-tight">Panel de Control Operativo</h1>
            <p className="text-[13px] text-ink-quiet mt-1">Indicadores clave de desempeño de Seguridad Operativa</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={k.slaCompliance >= 85 ? "brand" : "warning"} dot>
              {k.slaCompliance >= 85 ? "SLA Saludable" : "SLA Requiere Atención"}
            </Pill>
            <Pill tone="neutral">{new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</Pill>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HeroMetric 
            icon={<ShieldCheck className="h-6 w-6" />}
            label="Cumplimiento SLA"
            value={`${k.slaCompliance}%`}
            subtitle="Objetivo: ≥85%"
            trend={k.slaCompliance >= 85 ? "up" : "down"}
            tone={k.slaCompliance >= 85 ? "brand" : "warning"}
          />
          <HeroMetric 
            icon={<Clock className="h-6 w-6" />}
            label="Tiempo Promedio"
            value={`${k.avgCloseDays}d`}
            subtitle="Cierre de casos"
            trend="stable"
            tone="info"
          />
          <HeroMetric 
            icon={<Zap className="h-6 w-6" />}
            label="Casos Críticos"
            value={k.critical}
            subtitle="Requieren atención"
            trend={k.critical > 0 ? "up" : "down"}
            tone={k.critical > 0 ? "critical" : "brand"}
          />
          <HeroMetric 
            icon={<CheckCircle2 className="h-6 w-6" />}
            label="Resolución"
            value={`${k.onTimeRate}%`}
            subtitle="A tiempo"
            trend="up"
            tone="brand"
          />
        </div>
      </div>

      {/* Sección de Análisis - Diseño variado */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Gráfico principal - Más grande */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<TrendingUp className="h-4.5 w-4.5" />}
            title="Evolución del Cumplimiento SLA"
            subtitle="Tendencia de las últimas 6 semanas"
            action={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-quiet">Actual</span>
                <span className="text-[13px] font-semibold text-brand-700">{k.slaCompliance}%</span>
              </div>
            }
          />
          <TrendAreaChart data={trend} height={200} color={CHART_COLORS.brand} />
        </Card>

        {/* Métricas secundarias - Diseño compacto */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              icon={<BarChart3 className="h-4.5 w-4.5" />}
              title="Estado Actual"
              subtitle="Distribución de casos"
            />
            <div className="space-y-3 mt-4">
              <CompactMetric label="Abiertos" value={k.totalOpen} total={cases.length} color="warning" />
              <CompactMetric label="Cerrados" value={k.totalClosed} total={cases.length} color="brand" />
              <CompactMetric label="Críticos" value={k.critical} total={cases.length} color="critical" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-line-soft">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-quiet">Total gestionados</span>
              <span className="font-semibold text-ink">{cases.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Análisis por tipo - Diseño de gráfico circular */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <Card>
          <CardHeader
            icon={<Activity className="h-4.5 w-4.5" />}
            title="Composición por Tipo"
            subtitle="Distribución de incidentes"
          />
          <div className="flex items-center gap-6">
            <DonutChart 
              data={byTypeKPI.slice(0, 5).map(t => ({ name: t.label, value: t.value, color: CHART_COLORS.brand }))}
              height={180}
            />
            <div className="flex-1 space-y-2">
              {byTypeKPI.slice(0, 5).map((t, i) => (
                <div key={t.type} className="flex items-center justify-between">
                  <span className="text-[12px] text-ink-soft">{t.label}</span>
                  <span className="text-[12px] font-semibold text-ink">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabla optimizada - Diseño más limpio */}
        <Card>
          <CardHeader
            icon={<FileSearch className="h-4.5 w-4.5" />}
            title="Detalle por Tipo"
            subtitle="Análisis completo de incidentes"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-2 text-[10px] font-semibold uppercase text-ink-fant">Tipo</th>
                  <th className="pb-2 text-[10px] font-semibold uppercase text-ink-fant text-right">Casos</th>
                  <th className="pb-2 text-[10px] font-semibold uppercase text-ink-fant text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {byTypeKPI.slice(0, 6).map((t) => (
                  <tr key={t.type} className="hover:bg-surface/40">
                    <td className="py-2 text-[12px] text-ink">{t.label}</td>
                    <td className="py-2 text-right text-[12px] font-semibold text-ink">{t.value}</td>
                    <td className="py-2 text-right text-[12px] text-ink-quiet">{t.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Métricas adicionales - Diseño de tarjetas horizontales */}
      <div className="grid sm:grid-cols-3 gap-4">
        <HorizontalMetric 
          icon={<Activity className="h-5 w-5" />}
          label="Casos Activos"
          value={k.totalOpen}
          description="En proceso de gestión"
          color="brand"
        />
        <HorizontalMetric 
          icon={<Zap className="h-5 w-5" />}
          label="Recurrencia"
          value={k.recurrence}
          description="Fallas operativas repetidas"
          color="warning"
        />
        <HorizontalMetric 
          icon={<Target className="h-5 w-5" />}
          label="Eficiencia"
          value={`${Math.round((k.totalClosed / (cases.length || 1)) * 100)}%`}
          description="Tasa de resolución"
          color="info"
        />
      </div>
    </SegShell>
  );
}

function HeroMetric({ icon, label, value, subtitle, trend, tone }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subtitle: string; 
  trend: "up" | "down" | "stable";
  tone: "brand" | "critical" | "warning" | "info";
}) {
  const trendIcons = { up: <ArrowUpRight className="h-4 w-4" />, down: <ArrowDownRight className="h-4 w-4" />, stable: null };
  const trendColors = { up: "text-brand-600", down: "text-critical-600", stable: "text-ink-faint" };
  
  return (
    <div className="bg-white rounded-xl border border-line p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "h-10 w-10 rounded-lg grid place-items-center",
          tone === "brand" && "bg-brand-50 text-brand-700",
          tone === "critical" && "bg-critical-soft text-critical-ink",
          tone === "warning" && "bg-warning-soft text-warning-ink",
          tone === "info" && "bg-info-soft text-info-ink"
        )}>
          {icon}
        </div>
        {trendIcons[trend] && (
          <div className={cn("flex items-center gap-1 text-[11px] font-medium", trendColors[trend])}>
            {trendIcons[trend]}
            <span>{trend === "up" ? "+2.5%" : trend === "down" ? "-1.2%" : "0%"}</span>
          </div>
        )}
      </div>
      <p className="text-[28px] font-bold tabular-nums text-ink leading-none">{value}</p>
      <p className="text-[12px] text-ink-soft mt-1">{label}</p>
      <p className="text-[10.5px] text-ink-faint mt-0.5">{subtitle}</p>
    </div>
  );
}

function CompactMetric({ label, value, total, color }: { 
  label: string; 
  value: number; 
  total: number; 
  color: "brand" | "critical" | "warning";
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorClasses = {
    brand: "bg-brand-100 text-brand-700",
    critical: "bg-critical-soft text-critical-ink",
    warning: "bg-warning-soft text-warning-ink"
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-8 w-8 rounded-lg grid place-items-center text-sm font-semibold", colorClasses[color])}>
        {value}
      </div>
      <div className="flex-1">
        <p className="text-[12px] text-ink">{label}</p>
        <Progress value={percentage} className="h-1.5 mt-1" tone={color} />
      </div>
    </div>
  );
}

function HorizontalMetric({ icon, label, value, description, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  description: string; 
  color: "brand" | "critical" | "warning" | "info";
}) {
  const colorClasses = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    critical: "bg-critical-soft text-critical-ink border-critical/30",
    warning: "bg-warning-soft text-warning-ink border-warning/30",
    info: "bg-info-soft text-info-ink border-info/30"
  };
  
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-xl border", colorClasses[color])}>
      <div className="h-10 w-10 rounded-lg bg-white grid place-items-center shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-[20px] font-bold tabular-nums text-ink leading-none">{value}</p>
        <p className="text-[12px] text-ink-soft mt-1">{label}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function BigKpi({ icon, label, value, delta, tone }: { icon: React.ReactNode; label: string; value: string | number; delta: string; tone: "brand" | "critical" | "warning" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={cn(
          "h-10 w-10 rounded-xl grid place-items-center",
          tone === "brand" && "bg-brand-50 text-brand-700",
          tone === "critical" && "bg-critical-soft text-critical-ink",
          tone === "warning" && "bg-warning-soft text-warning-ink"
        )}>
          {icon}
        </div>
        <span className="text-[10.5px] font-semibold text-ink-faint uppercase tracking-wide">{delta}</span>
      </div>
      <p className="mt-4 text-[28px] font-bold tabular-nums text-ink leading-none">{value}</p>
      <p className="text-[12.5px] text-ink-quiet mt-2">{label}</p>
    </Card>
  );
}

function MiniKpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) {
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <div className="h-10 w-10 rounded-xl bg-surface-2 text-ink-soft grid place-items-center shrink-0">{icon}</div>
      <div>
        <p className="text-[20px] font-bold tabular-nums text-ink leading-none">{value}</p>
        <p className="text-[12px] text-ink-soft mt-1">{label}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">{hint}</p>
      </div>
    </Card>
  );
}

