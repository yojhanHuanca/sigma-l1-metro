import { Link } from "react-router-dom";
import { useMemo } from "react";
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Bell, Clock, Calendar, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Pill, PriorityPill } from "@/design-system/primitives/Pill";
import { EVENT_LABELS, STAGE_LABELS, STAGE_STATUS } from "@/lib/types";
import { cn, daysUntil, formatDate, relativeTime, slaState } from "@/lib/utils";

const KIND = {
  critical: { icon: AlertOctagon, label: "Crítica", tone: "critical" as const },
  warning: { icon: AlertTriangle, label: "Advertencia", tone: "warning" as const },
  info: { icon: Info, label: "Informativa", tone: "info" as const },
  success: { icon: CheckCircle2, label: "Resuelta", tone: "brand" as const },
};

export function Alerts() {
  const { cases } = useStore();

  const alerts = useMemo(() => {
    const out: {
      id: string;
      caseId: string;
      title: string;
      detail: string;
      at: string;
      kind: keyof typeof KIND;
      c: typeof cases[number];
    }[] = [];
    cases.forEach((c) => {
      if (STAGE_STATUS[c.stage] !== "abierto") return;
      const sla = slaState(c.slaDueDate, c.stage);
      const days = daysUntil(c.slaDueDate);
      if (c.priority === "critica") {
        out.push({ id: `crit-${c.id}`, caseId: c.id, title: `Caso crítico sin cerrar · ${c.id}`, detail: `${EVENT_LABELS[c.type]} en ${c.station}. Prioridad crítica requiere atención inmediata.`, at: c.createdAt, kind: "critical", c });
      }
      if (sla === "overdue") {
        out.push({ id: `over-${c.id}`, caseId: c.id, title: `SLA vencido · ${c.id}`, detail: `Vencido hace ${Math.abs(days)} días. Estado actual: ${STAGE_LABELS[c.stage]}.`, at: c.slaDueDate, kind: "critical", c });
      } else if (sla === "soon") {
        out.push({ id: `soon-${c.id}`, caseId: c.id, title: `SLA próximo a vencer · ${c.id}`, detail: `Vence en ${days} días. Verificar avance.`, at: c.slaDueDate, kind: "warning", c });
      }
      if (c.pendingInfoRequest) {
        out.push({ id: `info-${c.id}`, caseId: c.id, title: `Información pendiente · ${c.id}`, detail: c.pendingInfoRequest.question, at: c.pendingInfoRequest.requestedAt, kind: "warning", c });
      }
    });
    return out.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2, success: 3 };
      if (order[a.kind] !== order[b.kind]) return order[a.kind] - order[b.kind];
      return +new Date(b.at) - +new Date(a.at);
    });
  }, [cases]);

  const summary = {
    critical: alerts.filter((a) => a.kind === "critical").length,
    warning: alerts.filter((a) => a.kind === "warning").length,
    info: alerts.filter((a) => a.kind === "info").length,
  };

  return (
    <SegShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Alertas operativas</h1>
          <p className="text-[13px] text-ink-quiet mt-1">Condiciones que requieren atención inmediata de Seguridad Operativa.</p>
        </div>
        <Button variant="outline" size="sm"><Bell className="h-4 w-4" /> Configurar alertas</Button>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <SummaryCard icon={<AlertOctagon className="h-5 w-5" />} label="Críticas" value={summary.critical} tone="critical" />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5" />} label="Advertencias" value={summary.warning} tone="warning" />
        <SummaryCard icon={<Info className="h-5 w-5" />} label="Informativas" value={summary.info} tone="info" />
      </div>

      {/* Alert list */}
      <Card className="mt-5" padded={false}>
        <div className="p-5 pb-3">
          <CardHeader icon={<Bell className="h-4.5 w-4.5" />} title="Centro de alertas" subtitle="Ordenadas por severidad y fecha" className="mb-3" />
        </div>
        <div className="divide-y divide-line-soft">
          {alerts.length === 0 && (
            <div className="p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-brand-600 mx-auto" />
              <p className="text-[14px] font-semibold text-ink mt-3">Sin alertas activas</p>
              <p className="text-[12.5px] text-ink-quiet mt-1">Todos los casos están dentro de control.</p>
            </div>
          )}
          {alerts.map((a) => {
            const meta = KIND[a.kind];
            const Icon = meta.icon;
            return (
              <Link
                key={a.id}
                to={`/seguridad/casos/${a.caseId}`}
                className="flex items-start gap-3 p-4 hover:bg-surface/50 transition-colors group"
              >
                <div className={cn(
                  "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                  meta.tone === "critical" && "bg-critical-soft text-critical-ink",
                  meta.tone === "warning" && "bg-warning-soft text-warning-ink",
                  meta.tone === "info" && "bg-info-soft text-info-ink",
                  meta.tone === "brand" && "bg-brand-50 text-brand-700"
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13.5px] font-semibold text-ink">{a.title}</p>
                    <Pill tone={meta.tone} dot>{meta.label}</Pill>
                    <PriorityPill priority={a.c.priority} />
                  </div>
                  <p className="text-[12.5px] text-ink-soft mt-1 leading-relaxed">{a.detail}</p>
                  <p className="text-[11px] text-ink-faint mt-1.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {relativeTime(a.at)} · {formatDate(a.at)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </SegShell>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "critical" | "warning" | "info" }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn(
        "h-12 w-12 rounded-xl grid place-items-center shrink-0",
        tone === "critical" && "bg-critical-soft text-critical-ink",
        tone === "warning" && "bg-warning-soft text-warning-ink",
        tone === "info" && "bg-info-soft text-info-ink"
      )}>
        {icon}
      </div>
      <div>
        <p className="text-[26px] font-bold tabular-nums text-ink leading-none">{value}</p>
        <p className="text-[12px] text-ink-quiet mt-1.5">{label}</p>
      </div>
    </Card>
  );
}

