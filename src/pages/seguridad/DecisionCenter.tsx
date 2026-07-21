import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  Siren,
  FileSearch,
  CheckCheck,
  Clock,
  Send,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  CalendarClock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { WelcomeBanner } from "@/design-system/layout/WelcomeBanner";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Pill, PriorityPill, StagePill } from "@/design-system/primitives/Pill";
import { EVENT_LABELS, STAGE_LABELS, STAGE_STATUS, type Stage } from "@/lib/types";
import { cn, formatDate, relativeTime, slaState, daysUntil } from "@/lib/utils";

interface Bucket {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileSearch;
  tone: "critical" | "warning" | "brand" | "info";
  stages: Stage[];
  hint: string;
}

const BUCKETS: Bucket[] = [
  { id: "revision", title: "Revisión de casos nuevos", subtitle: "Aprobar, solicitar información o rechazar", icon: FileSearch, tone: "critical", stages: ["recepcion", "evaluacion"], hint: "Decisión inmediata" },
  { id: "info", title: "Esperando información del reportante", subtitle: "Casos pausados por solicitud", icon: Mail, tone: "warning", stages: ["pendiente_info"], hint: "Seguimiento" },
  { id: "planes", title: "Planes de acción para revisar", subtitle: "Aprobar, ajustar o rechazar el plan", icon: CheckCheck, tone: "warning", stages: ["plan_accion"], hint: "Revisión SO" },
  { id: "verificacion", title: "Listos para verificar y cerrar", subtitle: "Ejecución completada — cierre pendiente", icon: Clock, tone: "brand", stages: ["verificacion"], hint: "Verificación final" },
];

export function DecisionCenter() {
  const { cases } = useStore();

  const grouped = useMemo(() => {
    return BUCKETS.map((b) => ({
      ...b,
      items: cases
        .filter((c) => b.stages.includes(c.stage))
        .sort((a, b2) => {
          const pa = a.priority === "critica" ? 0 : a.priority === "alta" ? 1 : a.priority === "media" ? 2 : 3;
          const pb = b2.priority === "critica" ? 0 : b2.priority === "alta" ? 1 : b2.priority === "media" ? 2 : 3;
          return pa - pb;
        }),
    }));
  }, [cases]);

  const totalPending = grouped.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <SegShell>
      <WelcomeBanner
        greeting="Centro de Decisiones"
        subtitle="Casos que requieren una decisión de Seguridad Operativa para avanzar en el flujo."
        meta={<Pill tone={totalPending > 0 ? "critical" : "brand"} dot>{totalPending} decisiones pendientes</Pill>}
      />

      <div className="mt-6 space-y-5">
        {grouped.map((g) => (
          <Card key={g.id} padded={false} className={cn(g.items.length > 0 && "ring-1", g.items.length > 0 && (g.tone === "critical" ? "ring-critical/15" : g.tone === "warning" ? "ring-warning/15" : "ring-brand/15"))}>
            <div className="p-5 pb-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                  g.tone === "critical" && "bg-critical-soft text-critical-ink",
                  g.tone === "warning" && "bg-warning-soft text-warning-ink",
                  g.tone === "brand" && "bg-brand-50 text-brand-700",
                  g.tone === "info" && "bg-info-soft text-info-ink"
                )}>
                  <g.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-ink leading-tight">{g.title}</h2>
                  <p className="text-[12.5px] text-ink-quiet mt-0.5">{g.subtitle}</p>
                </div>
              </div>
              <Pill tone={g.items.length > 0 ? g.tone : "neutral"} dot>{g.items.length} caso(s)</Pill>
            </div>

            {g.items.length === 0 ? (
              <div className="px-5 pb-5 pt-1">
                <div className="rounded-lg bg-surface/60 border border-dashed border-line p-4 flex items-center gap-2.5 text-[12.5px] text-ink-quiet">
                  <ShieldCheck className="h-4 w-4 text-brand-600" /> Nada pendiente en esta categoría.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-line-soft">
                {g.items.map((c) => {
                  const sla = slaState(c.slaDueDate, c.stage);
                  const days = daysUntil(c.slaDueDate);
                  return (
                    <Link
                      key={c.id}
                      to={`/seguridad/casos/${c.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[12px] font-semibold text-brand-700">{c.id}</span>
                          <span className="text-[11.5px] text-ink-quiet">{EVENT_LABELS[c.type]}</span>
                          <PriorityPill priority={c.priority} />
                        </div>
                        <p className="text-[13.5px] font-semibold text-ink truncate mt-1">{c.title}</p>
                        <p className="text-[11.5px] text-ink-quiet mt-0.5">{c.station} · reportado por {c.reporter} · {relativeTime(c.createdAt)}</p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                        <StagePill stage={c.stage} />
                        {sla === "overdue" ? (
                          <span className="text-[11px] text-critical font-medium">SLA vencido {Math.abs(days)}d</span>
                        ) : sla === "soon" ? (
                          <span className="text-[11px] text-warning-ink font-medium">SLA en {days}d</span>
                        ) : (
                          <span className="text-[11px] text-ink-quiet">SLA {days}d</span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        Abrir <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    </SegShell>
  );
}

