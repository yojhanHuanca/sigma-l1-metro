import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { EmptyState } from "@/design-system/primitives/Progress";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const KIND = {
  info: { icon: Info, tone: "info" as const },
  success: { icon: CheckCircle2, tone: "brand" as const },
  warning: { icon: AlertTriangle, tone: "warning" as const },
  critical: { icon: AlertCircle, tone: "critical" as const },
};

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "Sin leer" },
  { id: "critical", label: "Críticas" },
] as const;

export function SeguridadNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const mine = useMemo(
    () => notifications.filter((n) => n.audience !== "reportante"),
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return mine.filter((n) => !n.read);
    if (filter === "critical") return mine.filter((n) => n.kind === "critical");
    return mine;
  }, [mine, filter]);

  const unread = mine.filter((n) => !n.read).length;

  return (
    <SegShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Notificaciones</h1>
          <p className="text-[13px] text-ink-quiet mt-1">Avisos del sistema sobre casos, decisiones y actividad.</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-line">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors",
                filter === f.id ? "bg-brand-700 text-white" : "text-ink-soft hover:bg-surface"
              )}
            >
              {f.label}
              {f.id === "unread" && unread > 0 && (
                <span className="ml-1.5 text-[10.5px] tabular-nums">{unread}</span>
              )}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-ink-quiet flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> {filtered.length} resultado(s)
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-5" icon={<Bell className="h-5 w-5" />} title="Sin notificaciones" description="Aquí aparecerán las novedades del sistema." />
      ) : (
        <div className="mt-5 space-y-2">
          {filtered.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={() => markNotificationRead(n.id)} />
          ))}
        </div>
      )}
    </SegShell>
  );
}

function NotificationRow({ n, onRead }: { n: Notification; onRead: () => void }) {
  const { icon, tone } = KIND[n.kind];
  const Icon = icon;
  return (
    <Card
      className={cn("p-4 flex items-start gap-3 cursor-pointer transition-colors", !n.read && "bg-white", n.read && "bg-surface/40")}
      onClick={() => { if (!n.read) onRead(); }}
    >
      <div className={cn(
        "h-9 w-9 rounded-lg grid place-items-center shrink-0",
        tone === "info" && "bg-info-soft text-info-ink",
        tone === "brand" && "bg-brand-50 text-brand-700",
        tone === "warning" && "bg-warning-soft text-warning-ink",
        tone === "critical" && "bg-critical-soft text-critical-ink"
      )}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-[13.5px] font-semibold text-ink", n.read && "text-ink-soft")}>{n.title}</p>
          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
        </div>
        <p className="text-[12.5px] text-ink-soft mt-0.5">{n.body}</p>
        <p className="text-[11.5px] text-ink-faint mt-1">
          <Link to={`/seguridad/casos/${n.caseId}`} className="font-mono text-brand-700 hover:underline">{n.caseId}</Link>
          {" · "}{relativeTime(n.at)} · {formatDate(n.at)}
        </p>
      </div>
      <Link
        to={`/seguridad/casos/${n.caseId}`}
        className="shrink-0 h-8 w-8 grid place-items-center rounded-md text-ink-faint hover:bg-surface-2 hover:text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
