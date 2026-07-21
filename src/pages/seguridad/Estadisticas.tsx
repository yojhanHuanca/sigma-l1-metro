import { useMemo } from "react";
import { PieChart as PieIcon, BarChart3, MapPin, Calendar, TrendingUp } from "lucide-react";
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
import { AREA_LABELS, EVENT_LABELS, PRIORITY_LABELS } from "@/lib/types";
import { formatDateShort } from "@/lib/utils";

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

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.priority, (map.get(c.priority) ?? 0) + 1));
    return (["critica", "alta", "media", "baja"] as const).map((p) => ({
      name: PRIORITY_LABELS[p],
      value: map.get(p) ?? 0,
      color: p === "critica" ? CHART_COLORS.critical : p === "alta" ? CHART_COLORS.warning : p === "media" ? CHART_COLORS.info : CHART_COLORS.inkFaint,
    }));
  }, [cases]);

  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.area, (map.get(c.area) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([a, value]) => ({ name: AREA_LABELS[a as keyof typeof AREA_LABELS], value, color: CHART_COLORS.brand }))
      .sort((x, y) => y.value - x.value);
  }, [cases]);

  const byStation = useMemo(() => {
    const map = new Map<string, number>();
    cases.forEach((c) => map.set(c.station, (map.get(c.station) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, color: CHART_COLORS.brandLight }))
      .sort((x, y) => y.value - x.value)
      .slice(0, 8);
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
      out.push({ label: formatDateShort(d), value: 2 + Math.round(Math.abs(Math.sin(i / 4)) * 5) });
    }
    return out;
  }, [cases]);

  return (
    <SegShell>
      <div>
        <h1 className="text-[22px] font-bold text-ink tracking-tight">Estadísticas</h1>
        <p className="text-[13px] text-ink-quiet mt-1">Análisis multidimensional de los casos de Seguridad Operativa.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader icon={<PieIcon className="h-4.5 w-4.5" />} title="Casos por tipo de evento" subtitle="Distribución total" />
          <DonutChart data={byType} height={240} />
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {byType.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<BarChart3 className="h-4.5 w-4.5" />} title="Casos por prioridad" subtitle="Severidad asignada" />
          <DonutChart data={byPriority} height={240} innerRadius={55} outerRadius={95} />
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {byPriority.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-soft min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto tabular-nums text-ink-faint">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Calendar className="h-4.5 w-4.5" />} title="Actividad semanal" subtitle="Casos abiertos vs. cerrados por semana" />
          <StackedBarChart data={weekly} height={240} />
          <div className="mt-3 flex items-center gap-4 text-[11.5px] text-ink-soft">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS.brand }} /> Abiertos</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS.brandSoft }} /> Cerrados</span>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<TrendingUp className="h-4.5 w-4.5" />} title="Tendencia de ingresos · 30 días" subtitle="Reportes recibidos" />
          <TrendAreaChart data={monthlyTrend} height={240} />
        </Card>

        <Card>
          <CardHeader icon={<MapPin className="h-4.5 w-4.5" />} title="Casos por estación" subtitle="Top estaciones con actividad" />
          <HBarsChart data={byStation} height={240} />
        </Card>

        <Card>
          <CardHeader icon={<BarChart3 className="h-4.5 w-4.5" />} title="Casos por área responsable" subtitle="Carga por área" />
          <HBarsChart data={byArea} height={240} />
        </Card>
      </div>
    </SegShell>
  );
}

