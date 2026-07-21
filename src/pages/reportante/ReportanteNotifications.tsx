import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Mail, AlertCircle, Info, CheckCircle2, AlertTriangle, Send, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ReportanteShell } from "@/design-system/layout/ReportanteShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Textarea } from "@/design-system/primitives/Input";
import { EmptyState } from "@/design-system/primitives/Progress";
import { Modal } from "@/design-system/primitives/Modal";
import { cn, relativeTime, formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const KIND_ICON = {
  info: { icon: Info, tone: "info" as const },
  success: { icon: CheckCircle2, tone: "brand" as const },
  warning: { icon: AlertTriangle, tone: "warning" as const },
  critical: { icon: AlertCircle, tone: "critical" as const },
};

export function ReportanteNotifications() {
  const { notifications, cases, markNotificationRead, markAllNotificationsRead, respondInfoRequest } = useStore();
  const [respondTo, setRespondTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const mine = useMemo(
    () => notifications.filter((n) => n.audience === "reportante" || n.audience === "both"),
    [notifications]
  );
  const unread = mine.filter((n) => !n.read);

  const targetCase = respondTo ? cases.find((c) => c.id === respondTo) : undefined;
  const targetNotif = respondTo ? mine.find((n) => n.caseId === respondTo && n.title.includes("información")) : undefined;

  const sendResponse = () => {
    if (respondTo && response.trim()) {
      respondInfoRequest(respondTo, response.trim());
      setRespondTo(null);
      setResponse("");
    }
  };

  const pendingInfoCases = cases.filter((c) => c.pendingInfoRequest && (c.reporter === "Carlos Núñez" || true));

  return (
    <ReportanteShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Notificaciones</h1>
          <p className="text-[13px] text-ink-quiet mt-1">
            Avisos sobre sus casos y solicitudes de información del área de Seguridad Operativa.
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Pending info requests — primary action surface */}
      {pendingInfoCases.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-warning-ink mb-2.5">
            Requiere su respuesta
          </p>
          <div className="space-y-3">
            {pendingInfoCases.map((c) => (
              <Card key={c.id} className="border-warning/25 bg-warning-soft/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning/15 text-warning-ink grid place-items-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[12.5px] font-semibold text-ink">{c.id}</span>
                      <span className="text-[12px] text-ink-faint">·</span>
                      <span className="text-[12.5px] font-medium text-ink truncate">{c.title}</span>
                    </div>
                    <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">
                      <span className="font-semibold text-ink">Solicitud:</span> {c.pendingInfoRequest?.question}
                    </p>
                    <p className="text-[11.5px] text-ink-quiet mt-1.5">
                      Solicitada {relativeTime(c.pendingInfoRequest?.requestedAt ?? "")}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setRespondTo(c.id);
                        setResponse("");
                      }}
                    >
                      <Send className="h-3.5 w-3.5" /> Responder
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notification feed */}
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-faint mt-7 mb-2.5">
        Actividad reciente
      </p>
      {mine.length === 0 ? (
        <EmptyState icon={<Bell className="h-5 w-5" />} title="Sin notificaciones" description="Aquí aparecerán las novedades sobre sus casos." />
      ) : (
        <div className="space-y-2">
          {mine.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={() => markNotificationRead(n.id)} />
          ))}
        </div>
      )}

      <Modal
        open={!!respondTo}
        onClose={() => setRespondTo(null)}
        title="Responder solicitud de información"
        subtitle={targetCase ? `${targetCase.id} · ${targetCase.title}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRespondTo(null)}>Cancelar</Button>
            <Button onClick={sendResponse} disabled={!response.trim()}>
              <Send className="h-4 w-4" /> Enviar respuesta
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-soft mb-3">
          Seguridad Operativa solicita la siguiente información para continuar con el caso:
        </p>
        <div className="rounded-lg bg-surface border border-line p-3 mb-4">
          <p className="text-[13px] text-ink">{targetCase?.pendingInfoRequest?.question}</p>
        </div>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Escriba su respuesta o adjunte el contexto solicitado…"
          rows={5}
        />
      </Modal>
    </ReportanteShell>
  );
}

function NotificationRow({ n, onRead }: { n: Notification; onRead: () => void }) {
  const { icon, tone } = KIND_ICON[n.kind];
  const Icon = icon;
  return (
    <Card
      className={cn("p-4 flex items-start gap-3 cursor-pointer transition-colors", !n.read && "bg-white", n.read && "bg-surface/40")}
      onClick={() => { if (!n.read) onRead(); }}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-lg grid place-items-center shrink-0",
          tone === "info" && "bg-info-soft text-info-ink",
          tone === "brand" && "bg-brand-50 text-brand-700",
          tone === "warning" && "bg-warning-soft text-warning-ink",
          tone === "critical" && "bg-critical-soft text-critical-ink"
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-[13.5px] font-semibold text-ink", n.read && "text-ink-soft")}>{n.title}</p>
          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
        </div>
        <p className="text-[12.5px] text-ink-soft mt-0.5">{n.body}</p>
        <p className="text-[11.5px] text-ink-faint mt-1">{relativeTime(n.at)} · {formatDate(n.at)}</p>
      </div>
      <Link
        to="/reportante/mis-reportes"
        className="shrink-0 h-8 w-8 grid place-items-center rounded-md text-ink-faint hover:bg-surface-2 hover:text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
