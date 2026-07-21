import { useMemo } from "react";
import { Gauge, TrendingUp, Target, Clock, CheckCircle2, AlertOctagon, Activity, FileSearch } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Pill } from "@/design-system/primitives/Pill";
import { Progress } from "@/design-system/primitives/Progress";
import { CHART_COLORS, GaugeChart, TrendAreaChart } from "@/design-system/charts/Charts";
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
    const recurrence = cases.filter((c) => c.type === "falla_operativa").length;

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
      <div>
        <h1 className="text-[22px] font-bold text-ink tracking-tight">Indicadores KPI</h1>
        <p className="text-[13px] text-ink-quiet mt-1">Métricas clave de desempeño de Seguridad Operativa.</p>
      </div>

      {/* Headline KPIs */}
      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center text-center p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Cumplimiento de SLA</p>
          <GaugeChart value={k.slaCompliance} label="a tiempo" height={180} />
          <p className="text-[12.5px] text-ink-quiet mt-2">Objetivo ≥ 85%</p>
        </Card>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <BigKpi icon={<Clock className="h-5 w-5" />} label="Tiempo medio de cierre" value={`${k.avgCloseDays} d`} delta="promedio" tone="brand" />
          <BigKpi icon={<CheckCircle2 className="h-5 w-5" />} label="Casos resueltos" value={k.resolved} delta="histórico" tone="brand" />
          <BigKpi icon={<AlertOctagon className="h-5 w-5" />} label="Casos críticos" value={k.critical} delta="total" tone="critical" />
          <BigKpi icon={<Target className="h-5 w-5" />} label="Tasa de resolución a tiempo" value={`${k.onTimeRate}%`} delta="cierre" tone="brand" />
        </div>
      </div>

      {/* SLA trend */}
      <Card className="mt-5">
        <CardHeader
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          title="Evolución del cumplimiento de SLA"
          subtitle="Últimas 6 semanas"
          action={<Pill tone={k.slaCompliance >= 85 ? "brand" : "warning"} dot>{k.slaCompliance >= 85 ? "Saludable" : "Atención"}</Pill>}
        />
        <TrendAreaChart data={trend} height={220} color={CHART_COLORS.brand} />
      </Card>

      {/* KPI table */}
      <Card className="mt-5" padded={false}>
        <div className="p-5 pb-3">
          <CardHeader icon={<Gauge className="h-4.5 w-4.5" />} title="Indicadores por tipo de evento" subtitle="Volumen y composición del total de casos" className="mb-3" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/60 border-b border-line">
                <th className="px-5 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Tipo de evento</th>
                <th className="px-5 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[100px] text-right">Casos</th>
                <th className="px-5 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[80px] text-right">%</th>
                <th className="px-5 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Proporción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {byTypeKPI.map((t) => (
                <tr key={t.type} className="hover:bg-surface/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-medium text-ink">{t.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-[13px] text-ink font-semibold">{t.value}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-[12.5px] text-ink-quiet">{t.pct}%</td>
                  <td className="px-5 py-3.5">
                    <Progress value={t.pct} className="max-w-[200px]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Extra indicators */}
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        <MiniKpi icon={<Activity className="h-4.5 w-4.5" />} label="Casos abiertos" value={k.totalOpen} hint="En flujo actualmente" />
        <MiniKpi icon={<FileSearch className="h-4.5 w-4.5" />} label="Recurrencia de fallas" value={k.recurrence} hint="Fallas operativas repetidas" />
        <MiniKpi icon={<CheckCircle2 className="h-4.5 w-4.5" />} label="Total histórico" value={cases.length} hint="Casos gestionados" />
      </div>
    </SegShell>
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

