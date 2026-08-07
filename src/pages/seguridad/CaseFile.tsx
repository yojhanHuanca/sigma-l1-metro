import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User as UserIcon,
  Send,
  FileText,
  Image as ImageIcon,
  Video,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Shield,
  Mail,
  Microscope,
  ClipboardList,
  Rocket,
  Activity,
  CheckCircle2,
  CornerUpLeft,
  Plus,
  MessageSquare,
  Download,
  Paperclip,
  Flag,
  Building2,
  SkipForward,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  AlertOctagon,
  Timer,
  FileSearch,
  Gavel,
  Inbox,
  Search,
  StickyNote,
  UserPlus,
  UserX,
  UserCheck,
  Briefcase,
  Info,
  Train,
  Eye,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select, Textarea } from "@/design-system/primitives/Input";
import { Modal } from "@/design-system/primitives/Modal";
import { Pill, PriorityPill, StagePill, RiskPill } from "@/design-system/primitives/Pill";
import { Progress } from "@/design-system/primitives/Progress";
import {
  AREA_HEADS,
  AREA_LABELS,
  EVENT_LABELS,
  IMPLICATION_LABELS,
  LABOR_STATE_LABELS,
  PRIORITY_LABELS,
  RISK_LABELS,
  riskCategory,
  riskToPriority,
  TIPO_SOP_LABELS,
  SUBTIPO_SOP_LABELS,
  PROCEDENCIA_LABELS,
  ESTADO_HALLAZGO_LABELS,
  TIPO_HALLAZGO_LABELS,
  AREA_SOP_LABELS,
  TIPO_INCIDENTE_LABELS,
  UBICACION_LABELS,
  LUGAR_INCIDENTE_LABELS,
  MODELO_MR_LABELS,
  PERSONAL_FALLA_LABELS,
  TIPO_CAUSA_LABELS,
  RESPONSABLES_INVESTIGACION,
  RESPONSABLES_PLAN,
  STAGE_LABELS,
  STAGE_STATUS,
  type Area,
  type Evidence,
  type ImplicationType,
  type InvolvedWorker,
  type Investigation,
  type Priority,
  type RiskLevel,
  type Stage,
  type SubtipoSOP,
  type TipoIncidenteOperativo,
  type User,
} from "@/lib/types";
import { cn, formatDate, formatDateTime, relativeTime, slaState, daysUntil, uid } from "@/lib/utils";

// ─── Workflow de 7 etapas ──────────────────────────────────────────────
const STAGE_STEP: { stage: Stage; label: string; icon: typeof FileSearch }[] = [
  { stage: "recepcion", label: "Recepción", icon: Inbox },
  { stage: "evaluacion", label: "Evaluación", icon: FileSearch },
  { stage: "investigacion", label: "Investigación", icon: Microscope },
  { stage: "plan_accion", label: "Plan de Acción", icon: ClipboardList },
  { stage: "ejecucion", label: "Ejecución", icon: Rocket },
  { stage: "verificacion", label: "Verificación", icon: Activity },
  { stage: "cierre", label: "Cierre", icon: CheckCircle2 },
];

function stageStepIndex(stage: Stage): number {
  if (stage === "pendiente_info") return 0;
  if (stage === "rechazado") return -1;
  return STAGE_STEP.findIndex((s) => s.stage === stage);
}

export function CaseFile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const c = store.getCase(id ?? "");
     const [showTimeline, setShowTimeline] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  if (!c) {
    return (
      <SegShell>
        <Card className="text-center py-16">
          <p className="text-[16px] font-semibold text-ink">Expediente no encontrado</p>
          <p className="text-[13px] text-ink-quiet mt-1">El expediente {id} no existe o fue eliminado.</p>
          <Link to="/seguridad/casos" className="mt-4 inline-block">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Volver a casos</Button>
          </Link>
        </Card>
      </SegShell>
    );
  }

  const stepIdx = stageStepIndex(c.stage);
  const sla = slaState(c.slaDueDate, c.stage);
  const days = daysUntil(c.slaDueDate);

  return (
    <SegShell
      right={
        <Link to="/seguridad/casos">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Casos</Button>
        </Link>
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[18px] font-bold text-brand-700">{c.id}</span>
            <span className="text-ink-faint">·</span>
            <StagePill stage={c.stage} />
          </div>
          <h1 className="mt-2 text-[22px] font-bold text-ink tracking-tight leading-tight max-w-3xl">{c.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {sla !== "done" && sla !== "ok" && (
            <Pill tone={sla === "overdue" ? "critical" : "warning"} dot>
              <Timer className="h-3 w-3" /> SLA {sla === "overdue" ? `vencido ${Math.abs(days)}d` : `${days}d`}
            </Pill>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowEvidence(true)}><ImageIcon className="h-4 w-4" /> Evidencias</Button>
          <Button variant="outline" size="sm" onClick={() => setShowTimeline(true)}><Clock className="h-4 w-4" /> Línea de tiempo</Button>
          <Button variant="outline" size="sm" onClick={() => downloadPlan(c)}><Download className="h-4 w-4" /> Exportar PDF</Button>
        </div>
      </div>

      {/* Workflow visual superior */}
      <Card className="mt-5 p-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {STAGE_STEP.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            const rejected = c.stage === "rechazado" && i === 0;
            const pendingInfo = c.stage === "pendiente_info" && i === 0;
            // Detectar si se saltó la investigación
            const skippedInvestigation = s.stage === "investigacion" && c.evaluation?.requiresInvestigation === false && stepIdx > 2;
            return (
              <div key={s.stage} className="flex items-center shrink-0">
                <div className="flex items-center gap-2.5 px-2">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full grid place-items-center shrink-0 transition-all",
                      skippedInvestigation && "bg-warning text-warning-ink ring-2 ring-warning/40 ring-offset-2 ring-offset-white",
                      !skippedInvestigation && done && "bg-brand-700 text-white",
                      !skippedInvestigation && active && !pendingInfo && "bg-info-soft text-info-ink ring-2 ring-info/30 ring-offset-2 ring-offset-white",
                      !skippedInvestigation && pendingInfo && "bg-warning text-warning-ink ring-2 ring-warning/40 ring-offset-2 ring-offset-white",
                      !skippedInvestigation && rejected && "bg-critical text-white",
                      !skippedInvestigation && !done && !active && !rejected && !pendingInfo && "bg-surface-2 text-ink-faint"
                    )}
                  >
                    {skippedInvestigation ? <SkipForward className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : rejected ? <X className="h-4 w-4" /> : pendingInfo ? <AlertCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <div className="hidden md:block">
                    <p className={cn(
                      "text-[12.5px] font-medium leading-tight",
                      skippedInvestigation && "text-warning-ink",
                      !skippedInvestigation && active && !pendingInfo ? "text-info-ink" : !skippedInvestigation && pendingInfo ? "text-warning-ink" : done ? "text-ink" : "text-ink-quiet"
                    )}>
                      {s.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tres columnas */}
      <div className="mt-5 grid lg:grid-cols-[280px_1fr] gap-5 items-start">
        <LeftPanel c={c} />
        <CenterPanel c={c} store={store} />
      </div>

      {/* Modal de Evidencias */}
      <Modal open={showEvidence} onClose={() => setShowEvidence(false)} title="Evidencias" subtitle={`${c.evidence.length} archivos adjuntos`} size="md">
        <div className="space-y-1.5">
          {c.evidence.length === 0 && <p className="text-[12px] text-ink-faint p-2">Sin evidencias adjuntas.</p>}
          {c.evidence.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-surface transition-colors group cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-surface-2 text-ink-soft grid place-items-center shrink-0">
                {ev.kind === "foto" ? <ImageIcon className="h-4 w-4" /> : ev.kind === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-ink truncate">{ev.name}</p>
                <p className="text-[10.5px] text-ink-quiet">{ev.size}</p>
              </div>
              <Download className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal de Línea de Tiempo */}
      <Modal open={showTimeline} onClose={() => setShowTimeline(false)} title="Línea de tiempo" subtitle={`${c.timeline.length} eventos`} size="lg">
        <TimelinePanel c={c} />
      </Modal>
    </SegShell>
  );
}

/* ─── Panel izquierdo — Información general + evidencias ─── */
function LeftPanel({ c }: { c: ReturnType<typeof useStore>["cases"][number] }) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card padded={false}>
        <div className="p-4 border-b border-line-soft">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Información general</p>
        </div>
        <div className="p-4 space-y-3.5">
          <InfoRow icon={<Flag className="h-3.5 w-3.5" />} label="Tipo de evento" value={EVENT_LABELS[c.type]} />
          <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área" value={AREA_LABELS[c.area]} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Estación" value={c.station} />
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Ubicación" value={c.location} />
          <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha" value={formatDate(c.date)} />
          <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Hora" value={c.time} />
          <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Reportante" value={c.reporter} />
          {c.assignee && <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Asignado a" value={c.assignee} />}
          <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Creado" value={formatDateTime(c.createdAt)} />
          {c.closedAt && <InfoRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Cerrado" value={formatDateTime(c.closedAt)} />}
        </div>
      </Card>

      {/* Datos SOP */}
      {c.sop && (
        <Card padded={false}>
          <div className="p-4 border-b border-line-soft flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Registro SOP</p>
            <Pill tone={c.sop.estadoHallazgo === "cerrado" ? "brand" : "warning"} dot>{ESTADO_HALLAZGO_LABELS[c.sop.estadoHallazgo]}</Pill>
          </div>
          <div className="p-4 space-y-3.5">
            <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Tipo de SOP" value={TIPO_SOP_LABELS[c.sop.tipoSOP]} />
            <InfoRow icon={<Flag className="h-3.5 w-3.5" />} label="Subtipo" value={SUBTIPO_SOP_LABELS[c.sop.subtipoSOP]} />
            <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Procedencia" value={PROCEDENCIA_LABELS[c.sop.procedencia]} />
            <InfoRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Tipo hallazgo" value={TIPO_HALLAZGO_LABELS[c.sop.tipoHallazgo]} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha hallazgo" value={formatDate(c.sop.fechaHallazgo)} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha evento" value={formatDate(c.sop.fechaEvento)} />
            <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Responsable investigación" value={c.sop.responsableInvestigacion} />
            {c.sop.peligro && <InfoRow icon={<AlertOctagon className="h-3.5 w-3.5" />} label="Peligro" value={c.sop.peligro} />}
            {c.sop.consecuencia && <InfoRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Consecuencia" value={c.sop.consecuencia} />}
            <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Análisis de riesgo" value={RISK_LABELS[c.sop.analisisRiesgo]} />
            {c.sop.acr && <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="ACR" value={c.sop.acr} />}
            {c.sop.planCodigo && (
              <>
                <div className="h-px bg-line-soft my-1" />
                <InfoRow icon={<ClipboardList className="h-3.5 w-3.5" />} label="Plan de acción" value={c.sop.planCodigo} />
                {c.sop.planResponsable && <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Responsable plan" value={c.sop.planResponsable} />}
                {c.sop.planArea && <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área plan" value={AREA_SOP_LABELS[c.sop.planArea]} />}
                {c.sop.planEstado && <InfoRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Estado plan" value={c.sop.planEstado === "cerrado" ? "Cerrado" : "Pendiente"} />}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Evento operativo */}
      {c.evento?.tipoIncidenteOperativo && (
        <Card padded={false}>
          <div className="p-4 border-b border-line-soft">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Evento operativo</p>
          </div>
          <div className="p-4 space-y-3.5">
            <InfoRow icon={<AlertOctagon className="h-3.5 w-3.5" />} label="Tipo incidente" value={TIPO_INCIDENTE_LABELS[c.evento.tipoIncidenteOperativo]} />
            {c.evento.ubicacion && <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Ubicación" value={UBICACION_LABELS[c.evento.ubicacion]} />}
            {c.evento.lugarIncidente && <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Lugar" value={LUGAR_INCIDENTE_LABELS[c.evento.lugarIncidente]} />}
            {c.evento.rangoHorario && <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Rango horario" value={c.evento.rangoHorario} />}
            {c.evento.tipoVia && <InfoRow icon={<Flag className="h-3.5 w-3.5" />} label="Tipo vía" value={c.evento.tipoVia} />}
            {c.evento.modeloMR && <InfoRow icon={<Train className="h-3.5 w-3.5" />} label="Modelo MR" value={MODELO_MR_LABELS[c.evento.modeloMR]} />}
            {c.evento.nroMR && <InfoRow icon={<Train className="h-3.5 w-3.5" />} label="Nro. MR" value={c.evento.nroMR} />}
            {c.evento.nroCarrera && <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Nro. carrera" value={c.evento.nroCarrera} />}
            {c.evento.personalFalla && <InfoRow icon={<UserIcon className="h-3.5 w-3.5" />} label="Personal/Falla" value={PERSONAL_FALLA_LABELS[c.evento.personalFalla]} />}
            {c.evento.tipoCausa && <InfoRow icon={<Search className="h-3.5 w-3.5" />} label="Tipo causa" value={TIPO_CAUSA_LABELS[c.evento.tipoCausa]} />}
            {c.evento.posibleCausa && <InfoRow icon={<Search className="h-3.5 w-3.5" />} label="Posible causa" value={c.evento.posibleCausa} />}
            {c.evento.descripcionEvento && <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Descripción" value={c.evento.descripcionEvento} />}
            {c.evento.informacionAdicional && <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="Info adicional" value={c.evento.informacionAdicional} />}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-ink-faint mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-ink-faint">{label}</p>
        <p className="text-[12.5px] text-ink font-medium leading-snug mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Panel central — contenido por etapa ─── */
type Store = ReturnType<typeof useStore>;

function CenterPanel({ c, store }: { c: Store["cases"][number]; store: Store }) {
  switch (c.stage) {
    case "recepcion":
    case "evaluacion":
      return <ReceptionStage c={c} store={store} />;
    case "pendiente_info":
      return <PendingInfoStage c={c} />;
    case "investigacion":
      return <InvestigationStage c={c} store={store} />;
    case "plan_accion":
      return <PlanStage c={c} store={store} />;
    case "ejecucion":
      return <ExecutionStage c={c} store={store} />;
    case "verificacion":
      return <VerificationStage c={c} store={store} />;
    case "cierre":
      return <ClosedStage c={c} store={store} />;
    case "rechazado":
      return <RejectedStage c={c} />;
    default:
      return null;
  }
}

function StageSection({ title, subtitle, icon, children, action }: {
  title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">{icon}</div>
          <div>
            <h2 className="text-[16px] font-bold text-ink leading-tight">{title}</h2>
            <p className="text-[12.5px] text-ink-quiet mt-0.5">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function DescriptionBlock({ c }: { c: Store["cases"][number] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-1.5">Descripción del evento</p>
        <p className="text-[13.5px] text-ink-soft leading-relaxed">{c.description}</p>
      </div>
    </div>
  );
}

/* ─── ETAPA 1 — Recepción y Revisión ─── */
function ReceptionStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [obsOpen, setObsOpen] = useState(false);
  const [observation, setObservation] = useState("");
  const isRecepcion = c.stage === "recepcion";

  return (
    <div className="space-y-4">
      <StageSection
        title={isRecepcion ? "Recepción y Revisión de Reporte" : "Evaluación del Caso"}
        subtitle={isRecepcion
          ? "Revise toda la información del reporte, evidencias y descripción. Apruebe para avanzar a Evaluación."
          : "Analice la gravedad, defina prioridad y clasifique el caso. Determine si requiere investigación."}
        icon={isRecepcion ? <Inbox className="h-5 w-5" /> : <FileSearch className="h-5 w-5" />}
        action={<Pill tone="info" dot>{isRecepcion ? "Pendiente de aprobación" : "En evaluación"}</Pill>}
      >
        <DescriptionBlock c={c} />

        {c.pendingInfoRequest && (
          <div className="mt-4 rounded-lg bg-warning-soft border border-warning/30 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-warning-ink shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-warning-ink">Información adicional solicitada</p>
                <p className="text-[12.5px] text-ink-soft mt-1">{c.pendingInfoRequest.question}</p>
                <p className="text-[11px] text-ink-faint mt-1.5">Solicitada {relativeTime(c.pendingInfoRequest.requestedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {isRecepcion ? (
          <div className="mt-5 pt-5 border-t border-line-soft flex items-center gap-2 flex-wrap">
            <Button onClick={() => store.approveCase(c.id)} size="sm"><Check className="h-4 w-4" /> Aprobar reporte</Button>
            <Button variant="outline" size="sm" onClick={() => setInfoOpen(true)}><Mail className="h-4 w-4" /> Solicitar información</Button>
            <Button variant="outline" size="sm" onClick={() => setObsOpen(true)}><StickyNote className="h-4 w-4" /> Registrar observación</Button>
            <Button variant="ghost" size="sm" onClick={() => setRejectOpen(true)} className="text-critical hover:bg-critical-soft"><X className="h-4 w-4" /> Rechazar</Button>
          </div>
        ) : (
          <EvaluationForm c={c} store={store} />
        )}
      </StageSection>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Rechazar reporte" subtitle={`${c.id} · indique el motivo (obligatorio)`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancelar</Button><Button variant="danger" onClick={() => { if (reason.trim()) { store.rejectCase(c.id, reason.trim()); setRejectOpen(false); } }} disabled={!reason.trim()}><X className="h-4 w-4" /> Confirmar rechazo</Button></>}>
        <Field label="Motivo del rechazo" required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explique por qué el reporte no procede…" rows={4} />
        </Field>
      </Modal>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="Solicitar información al reportante" subtitle={`${c.id} · el caso queda en pausa hasta recibir respuesta`}
        footer={<><Button variant="ghost" onClick={() => setInfoOpen(false)}>Cancelar</Button><Button onClick={() => { if (question.trim()) { store.requestInfo(c.id, question.trim()); setInfoOpen(false); setQuestion(""); } }} disabled={!question.trim()}><Send className="h-4 w-4" /> Enviar solicitud</Button></>}>
        <Field label="¿Qué información necesita?" required>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ej. Detallar personal involucrado y adjuntar copia del permiso de trabajo…" rows={4} />
        </Field>
      </Modal>

      <Modal open={obsOpen} onClose={() => setObsOpen(false)} title="Registrar observación de revisión" subtitle={`${c.id} · queda en la bitácora del expediente`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setObsOpen(false)}>Cancelar</Button><Button onClick={() => { if (observation.trim()) { store.addReviewObservation(c.id, observation.trim()); setObsOpen(false); setObservation(""); } }} disabled={!observation.trim()}><StickyNote className="h-4 w-4" /> Guardar observación</Button></>}>
        <Field label="Observación" required>
          <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={4} placeholder="Anote sus observaciones de la revisión…" />
        </Field>
      </Modal>
    </div>
  );
}

/* ─── ETAPA 2 — Evaluación ─── */
const PRESET_CLASSIFICATIONS: string[] = [
  "Reporte Voluntario",
  "Accidente",
  "No conformidad",
  "Observación",
  ...Object.values(SUBTIPO_SOP_LABELS).map((s) => `Hallazgo · ${s}`),
  ...Object.values(TIPO_INCIDENTE_LABELS).map((s) => `Incidente · ${s}`),
];

function EvaluationForm({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(c.riskLevel);
  const [classification, setClassification] = useState(c.evaluation?.classification ?? "");
  const [requiresInvestigation, setRequiresInvestigation] = useState(c.evaluation?.requiresInvestigation ?? true);
  const [observations, setObservations] = useState(c.evaluation?.observations ?? "");
  const [peligro, setPeligro] = useState(c.evaluation?.danger ?? "");
  const [consecuencia, setConsecuencia] = useState(c.evaluation?.consequence ?? "");

  // Valor limpio para guardar (sin el prefijo __otro__:)
  const cleanClassification = classification.startsWith("__otro__:")
    ? classification.slice(9).trim()
    : classification.trim();
  const canSave = cleanClassification.length > 0;
  const gravityFromRisk = riskToPriority(riskLevel);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-info-soft border border-info/20 p-3.5 flex items-start gap-2.5">
        <FileSearch className="h-4 w-4 text-info-ink shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-info-ink">
          <span className="font-semibold">Análisis del caso.</span> Defina el análisis de riesgo (matriz 1A-4E), clasificación y si requiere investigación. Al guardar, el caso pasa a Investigación o directamente a Plan de Acción.
        </p>
      </div>

      <Field label="Peligro">
        <Textarea value={peligro} onChange={(e) => setPeligro(e.target.value)} placeholder="Identifique el peligro o fuente de riesgo…" rows={2} />
      </Field>

      <Field label="Consecuencia">
        <Textarea value={consecuencia} onChange={(e) => setConsecuencia(e.target.value)} placeholder="Describa la posible consecuencia del peligro…" rows={2} />
      </Field>

      <Field label="Análisis de riesgo (matriz 5×5)" required>
        <div className="space-y-4">
          {/* Matriz 5x5 institucional con CSS Grid */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-6 gap-1.5">
              {/* Encabezado vacío */}
              <div className="flex items-center justify-center text-[10px] font-semibold text-ink-faint bg-surface-2 rounded">
                Probabilidad \ Severidad
              </div>
              
              {/* Encabezados de columnas (Severidad) */}
              {[
                { label: "1", desc: "Catastrófico" },
                { label: "2", desc: "Crítico" },
                { label: "3", desc: "Marginal" },
                { label: "4", desc: "Despreciable" }
              ].map((col) => (
                <div key={col.label} className="flex flex-col items-center justify-center text-[10px] font-semibold text-ink-faint bg-surface-2 rounded p-1.5">
                  <span>{col.label}</span>
                  <span className="text-[9px] font-normal leading-tight">{col.desc}</span>
                </div>
              ))}

              {/* Filas de la matriz */}
              {[
                { row: "A", label: "Frecuente" },
                { row: "B", label: "Probable" },
                { row: "C", label: "Ocasional" },
                { row: "D", label: "Remoto" },
                { row: "E", label: "Improbable" }
              ].map((rowInfo) => (
                <>
                  {/* Encabezado de fila */}
                  <div key={`row-${rowInfo.row}`} className="flex flex-col items-center justify-center text-[10px] font-semibold text-ink-faint bg-surface-2 rounded p-1.5">
                    <span>{rowInfo.row}</span>
                    <span className="text-[9px] font-normal leading-tight">{rowInfo.label}</span>
                  </div>

                  {/* Celdas de la fila */}
                  {[1, 2, 3, 4].map((col) => {
                    const risk = `${col}${rowInfo.row}` as RiskLevel;
                    const isSelected = riskLevel === risk;
                    
                    // Distribución exacta de colores según metodología institucional
                    const colorClass = (() => {
                      // Rojo (Inaceptable): 1A, 2A, 1B, 2B, 1C
                      if ((risk === "1A" || risk === "2A" || risk === "1B" || risk === "2B" || risk === "1C")) {
                        return "bg-red-500 text-white";
                      }
                      // Amarillo (No deseable): 3A, 3B, 2C, 1D
                      if ((risk === "3A" || risk === "3B" || risk === "2C" || risk === "1D")) {
                        return "bg-yellow-400 text-yellow-900";
                      }
                      // Gris claro (Aceptable con revisión): 4A, 4B, 3C, 2D
                      if ((risk === "4A" || risk === "4B" || risk === "3C" || risk === "2D")) {
                        return "bg-gray-200 text-gray-800";
                      }
                      // Blanco (Aceptable sin revisión): 4C, 4D, 1E, 2E, 3D, 3E, 4E
                      if ((risk === "4C" || risk === "4D" || risk === "1E" || risk === "2E" || risk === "3D" || risk === "3E" || risk === "4E")) {
                        return "bg-white text-gray-800 border border-gray-300";
                      }
                      return "bg-gray-100 text-gray-600";
                    })();

                    return (
                      <motion.button
                        key={risk}
                        onClick={() => setRiskLevel(risk)}
                        className={cn(
                          "h-12 rounded text-[12px] font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md",
                          colorClass,
                          isSelected && "ring-2 ring-green-600 shadow-inner"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {risk}
                      </motion.button>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Leyenda horizontal */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-[11px] text-ink-quiet">Inaceptable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span className="text-[11px] text-ink-quiet">No deseable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div>
              <span className="text-[11px] text-ink-quiet">Aceptable con revisión</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
              <span className="text-[11px] text-ink-quiet">Aceptable sin revisión</span>
            </div>
          </div>

          {/* Panel de resultado */}
          {riskLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm mx-auto rounded-lg border border-line bg-white p-4 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded flex items-center justify-center text-lg font-bold",
                  (() => {
                    const cat = riskCategory(riskLevel);
                    if (cat === "inaceptable") return "bg-red-500 text-white";
                    if (cat === "no_deseable") return "bg-yellow-400 text-yellow-900";
                    if (cat === "aceptable_revision") return "bg-gray-200 text-gray-800";
                    return "bg-white border border-gray-300 text-gray-800";
                  })()
                )}>
                  {riskLevel}
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Estado</p>
                  <p className="text-[13px] font-bold text-ink">
                    {(() => {
                      const cat = riskCategory(riskLevel);
                      if (cat === "inaceptable") return "INACEPTABLE";
                      if (cat === "no_deseable") return "NO DESEABLE";
                      if (cat === "aceptable_revision") return "ACEPTABLE CON REVISIÓN";
                      return "ACEPTABLE SIN REVISIÓN";
                    })()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Gravedad derivada</p>
                  <p className="text-[12px] font-semibold text-ink">{PRIORITY_LABELS[gravityFromRisk]}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider">Descripción</p>
                  <p className="text-[12px] text-ink-soft leading-relaxed">
                    {(() => {
                      const cat = riskCategory(riskLevel);
                      if (cat === "inaceptable") return "El riesgo requiere atención inmediata.";
                      if (cat === "no_deseable") return "El riesgo requiere control y mitigación.";
                      if (cat === "aceptable_revision") return "El riesgo requiere monitoreo periódico.";
                      return "El riesgo es aceptable bajo condiciones normales.";
                    })()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Field>

      <Field label="Clasificación del caso" required>
        <div className="space-y-4">
          {/* Tarjetas visuales de clasificación */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Hallazgos */}
            <button
              onClick={() => setClassification("Hallazgo · " + (Object.keys(SUBTIPO_SOP_LABELS)[0] && SUBTIPO_SOP_LABELS[Object.keys(SUBTIPO_SOP_LABELS)[0] as SubtipoSOP]))}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-brand-300 hover:bg-brand-50",
                classification.startsWith("Hallazgo") ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileSearch className="h-5 w-5 text-brand-700" />
                <span className="text-[13px] font-semibold text-ink">Hallazgo</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Desviaciones detectadas</p>
            </button>

            {/* Incidentes */}
            <button
              onClick={() => setClassification("Incidente · " + (Object.keys(TIPO_INCIDENTE_LABELS)[0] && TIPO_INCIDENTE_LABELS[Object.keys(TIPO_INCIDENTE_LABELS)[0] as TipoIncidenteOperativo]))}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-warning-300 hover:bg-warning-soft",
                classification.startsWith("Incidente") ? "border-warning-600 bg-warning-soft ring-2 ring-warning-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-warning-ink" />
                <span className="text-[13px] font-semibold text-ink">Incidente</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Eventos operativos</p>
            </button>

            {/* Reporte Voluntario */}
            <button
              onClick={() => setClassification("Reporte Voluntario")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-info-300 hover:bg-info-soft",
                classification === "Reporte Voluntario" ? "border-info-600 bg-info-soft ring-2 ring-info-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-5 w-5 text-info-ink" />
                <span className="text-[13px] font-semibold text-ink">Reporte Voluntario</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Aporte voluntario</p>
            </button>

            {/* Accidente */}
            <button
              onClick={() => setClassification("Accidente")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-critical-300 hover:bg-critical-soft",
                classification === "Accidente" ? "border-critical-600 bg-critical-soft ring-2 ring-critical-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertOctagon className="h-5 w-5 text-critical-ink" />
                <span className="text-[13px] font-semibold text-ink">Accidente</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Evento con daño</p>
            </button>

            {/* No conformidad */}
            <button
              onClick={() => setClassification("No conformidad")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-brand-300 hover:bg-brand-50",
                classification === "No conformidad" ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <X className="h-5 w-5 text-brand-700" />
                <span className="text-[13px] font-semibold text-ink">No conformidad</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Incumplimiento</p>
            </button>

            {/* Observación */}
            <button
              onClick={() => setClassification("Observación")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-success-300 hover:bg-success-soft",
                classification === "Observación" ? "border-success-600 bg-success-soft ring-2 ring-success-200" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-5 w-5 text-success-ink" />
                <span className="text-[13px] font-semibold text-ink">Observación</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Nota visual</p>
            </button>

            {/* Otro */}
            <button
              onClick={() => setClassification("__otro__:")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all hover:border-line-strong hover:bg-surface-2",
                classification.startsWith("__otro__") ? "border-line-strong bg-surface-2 ring-2 ring-line" : "border-line bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Plus className="h-5 w-5 text-ink-soft" />
                <span className="text-[13px] font-semibold text-ink">Otro</span>
              </div>
              <p className="text-[11px] text-ink-quiet">Clasificación personalizada</p>
            </button>
          </div>

          {/* Subcategorías cuando se selecciona Hallazgo o Incidente */}
          {classification.startsWith("Hallazgo") && (
            <div className="mt-3 p-4 bg-surface-2 rounded-lg">
              <p className="text-[12px] font-semibold text-ink-faint mb-3">Tipo de hallazgo:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SUBTIPO_SOP_LABELS) as SubtipoSOP[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setClassification(`Hallazgo · ${SUBTIPO_SOP_LABELS[s]}`)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[12px] font-medium border transition-all hover:border-brand-300 hover:bg-brand-50",
                      classification === `Hallazgo · ${SUBTIPO_SOP_LABELS[s]}` ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-white text-ink-soft"
                    )}
                  >
                    {SUBTIPO_SOP_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {classification.startsWith("Incidente") && (
            <div className="mt-3 p-4 bg-surface-2 rounded-lg">
              <p className="text-[12px] font-semibold text-ink-faint mb-3">Tipo de incidente:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TIPO_INCIDENTE_LABELS) as TipoIncidenteOperativo[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setClassification(`Incidente · ${TIPO_INCIDENTE_LABELS[s]}`)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[12px] font-medium border transition-all hover:border-warning-300 hover:bg-warning-soft",
                      classification === `Incidente · ${TIPO_INCIDENTE_LABELS[s]}` ? "border-warning-600 bg-warning-soft text-warning-ink" : "border-line bg-white text-ink-soft"
                    )}
                  >
                    {TIPO_INCIDENTE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input para clasificación personalizada */}
          {classification.startsWith("__otro__:") && (
            <div className="mt-3">
              <Input
                value={classification.slice(9)}
                onChange={(e) => setClassification(`__otro__:${e.target.value}`)}
                placeholder="Escriba la clasificación personalizada…"
                autoFocus
              />
            </div>
          )}
        </div>
      </Field>

      <Field label="¿Requiere investigación?">
        <div className="flex gap-2">
          <button onClick={() => setRequiresInvestigation(true)}
            className={cn("flex-1 h-10 rounded-lg text-[12.5px] font-medium border transition-all", requiresInvestigation ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-white text-ink-soft hover:bg-surface/50")}>
            Sí
          </button>
          <button onClick={() => setRequiresInvestigation(false)}
            className={cn("flex-1 h-10 rounded-lg text-[12.5px] font-medium border transition-all", !requiresInvestigation ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-white text-ink-soft hover:bg-surface/50")}>
            No, pasa directo a Plan
          </button>
        </div>
      </Field>

      {!requiresInvestigation && (
        <Field label="Observaciones de la evaluación">
          <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} placeholder="Análisis, antecedentes, criterios considerados…" />
        </Field>
      )}

      <div className="pt-3 border-t border-line-soft flex items-center justify-end gap-2">
        <Button size="sm" disabled={!canSave} onClick={() => store.saveEvaluation(c.id, { gravity: gravityFromRisk, riskLevel, classification: cleanClassification, requiresInvestigation, observations: observations.trim(), danger: peligro.trim(), consequence: consecuencia.trim() })}>
          <Check className="h-4 w-4" /> {requiresInvestigation ? "Guardar y pasar a Investigación" : "Guardar y pasar a Plan de Acción"}
        </Button>
      </div>
    </div>
  );
}

function PendingInfoStage({ c }: { c: Store["cases"][number] }) {
  return (
    <StageSection title="Esperando información del reportante" subtitle="El caso está pausado hasta que el reportante responda la solicitud." icon={<Mail className="h-5 w-5" />} action={<Pill tone="warning" dot>Pausado</Pill>}>
      <div className="rounded-lg bg-warning-soft border border-warning/25 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning-ink shrink-0 mt-0.5" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Solicitud enviada</p>
            <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">{c.pendingInfoRequest?.question}</p>
            <p className="text-[11.5px] text-ink-quiet mt-2">Solicitada {relativeTime(c.pendingInfoRequest?.requestedAt ?? "")}</p>
          </div>
        </div>
      </div>
      <DescriptionBlock c={c} />
    </StageSection>
  );
}

/* ─── ETAPA 3 — Investigación (SO) ─── */
function InvestigationStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const [editMode, setEditMode] = useState(!c.investigation);
  const [inv, setInv] = useState<Investigation>(
    c.investigation ?? { findings: "", rootCause: "", technicalDescription: "", conclusions: "", observations: "", updatedAt: "" }
  );
  const set = (k: keyof Investigation, v: string) => setInv((p) => ({ ...p, [k]: v }));
  const canSave = inv.findings.trim() && inv.rootCause.trim() && inv.conclusions.trim();

  const addEvidence = (kind: Evidence["kind"]) => {
    const names: Record<typeof kind, [string, string]> = {
      foto: ["investigacion.jpg", "2.4 MB"], video: ["investigacion.mp4", "14.8 MB"], documento: ["informe_investigacion.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    store.addInvestigationEvidence(c.id, { id: `ev_${Math.random().toString(36).slice(2, 9)}`, kind, name: name.replace(/(\.\w+)$/, `_${c.evidence.length + 1}$1`), size, at: new Date().toISOString() });
  };

  if (c.investigation && !editMode) {
    const hasActionPlan = c.actionPlans && c.actionPlans.length > 0;
    return (
      <div className="space-y-4">
        <StageSection title="Investigación registrada" subtitle="Hallazgos, causa raíz y conclusiones registrados por Seguridad Operativa." icon={<Microscope className="h-5 w-5" />} action={
          <div className="flex items-center gap-2">
            <Pill tone={hasActionPlan ? "brand" : "warning"} dot>{hasActionPlan ? "Completado" : "Pendiente Plan"}</Pill>
            <Button variant="outline" size="sm" onClick={() => { setInv(c.investigation!); setEditMode(true); }}>
              <FileSearch className="h-4 w-4" /> Editar
            </Button>
          </div>
        }>
          <InvDisplay inv={c.investigation} />
        </StageSection>
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => store.moveToStageWithoutTimeline(c.id, "evaluacion")}><CornerUpLeft className="h-4 w-4" /> Volver a evaluación</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StageSection title="Investigación del caso" subtitle="Seguridad Operativa registra hallazgos, causa raíz, análisis, conclusiones y evidencias." icon={<Microscope className="h-5 w-5" />} action={<Pill tone="info" dot>En curso</Pill>}>
        <div className="space-y-4">
          <Field label="Descripción de evento" required>
            <Textarea value={inv.findings} onChange={(e) => set("findings", e.target.value)} placeholder="¿Qué se encontró durante la inspección?" rows={3} />
          </Field>
          <Field label="Causa raíz" required>
            <Textarea value={inv.rootCause} onChange={(e) => set("rootCause", e.target.value)} placeholder="¿Cuál es la causa originaria del evento?" rows={2} />
          </Field>
          <Field label="Conclusiones" required>
            <Textarea value={inv.conclusions} onChange={(e) => set("conclusions", e.target.value)} placeholder="Conclusiones del análisis…" rows={2} />
          </Field>
          <Field label="Observaciones">
            <Textarea value={inv.observations} onChange={(e) => set("observations", e.target.value)} placeholder="Recomendaciones o información complementaria…" rows={2} />
          </Field>

          <div className="pt-3 border-t border-line-soft">
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Evidencias de la investigación</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Button variant="outline" size="sm" onClick={() => addEvidence("foto")}><ImageIcon className="h-4 w-4" /> Adjuntar foto</Button>
              <Button variant="outline" size="sm" onClick={() => addEvidence("video")}><Video className="h-4 w-4" /> Adjuntar video</Button>
              <Button variant="outline" size="sm" onClick={() => addEvidence("documento")}><FileText className="h-4 w-4" /> Adjuntar documento</Button>
            </div>
          </div>

          <div className="pt-3 border-t border-line-soft flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => store.moveToStageWithoutTimeline(c.id, "evaluacion")}><CornerUpLeft className="h-4 w-4" /> Volver a evaluación</Button>
            <Button onClick={() => canSave && store.saveInvestigation(c.id, inv)} disabled={!canSave}>
              <Check className="h-4 w-4" /> Guardar investigación y pasar a Plan de Acción
            </Button>
          </div>
        </div>
      </StageSection>
    </div>
  );
}

function InvDisplay({ inv }: { inv: Investigation }) {
  return (
    <div className="space-y-4">
      <InvBlock label="Descripción de evento" value={inv.findings} />
      <InvBlock label="Causa raíz" value={inv.rootCause} tone="critical" />
      {inv.technicalDescription && <InvBlock label="Análisis técnico" value={inv.technicalDescription} />}
      <InvBlock label="Conclusiones" value={inv.conclusions} />
      {inv.observations && <InvBlock label="Observaciones" value={inv.observations} />}
      <p className="text-[11px] text-ink-faint pt-2 border-t border-line-soft">Actualizado {formatDateTime(inv.updatedAt)}</p>
    </div>
  );
}

function InvBlock({ label, value, tone }: { label: string; value: string; tone?: "critical" }) {
  return (
    <div>
      <p className={cn("text-[11px] font-semibold tracking-wide uppercase mb-1.5", tone === "critical" ? "text-critical-ink" : "text-ink-faint")}>{label}</p>
      <p className="text-[13.5px] text-ink-soft leading-relaxed">{value}</p>
    </div>
  );
}

/* ─── ETAPA 4 — Plan de Acción (SO) ─── */
interface PlanFormItem { description: string; owner: string; priority: Priority; startDate: string; dueDate: string; actionType: string; area: Area; }
interface PlanFormProps { c: Store["cases"][number]; store: Store; onSubmitted: () => void; onHasChanges: (hasChanges: boolean) => void; }

function PlanStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const plan = c.actionPlans?.[0];
  const [formOpen, setFormOpen] = useState(!plan);
  const [editPlanMode, setEditPlanMode] = useState(false);
  const [comment, setComment] = useState("");

  const addComment = () => {
    if (comment.trim()) {
      store.addPlanComment(c.id, 0, comment.trim());
      setComment("");
    }
  };

  return (
    <div className="space-y-4">
      {c.investigation && c.stage !== "plan_accion" && (
        <StageSection title="Investigación" subtitle="Hallazgos y causa raíz." icon={<Microscope className="h-5 w-5" />}>
          <InvDisplay inv={c.investigation} />
        </StageSection>
      )}
      <StageSection
        title="Plan de Acción"
        subtitle={plan ? "Plan enviado al jefe del área. Pendiente de revisión y aprobación." : "Seguridad Operativa crea el Plan de Acción y lo envía al jefe del área."}
        icon={<ClipboardList className="h-5 w-5" />}
        action={plan ? <Pill tone="warning" dot>Para revisar</Pill> : <Pill tone="info" dot>Por crear</Pill>}
      >
        {plan && !formOpen ? (
          <>
            {c.investigation && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Resumen de la investigación</p>
                <InvDisplay inv={c.investigation} />
              </div>
            )}
            <PlanDisplay c={c} />
            
            {/* Comentarios de Seguridad Operativa - Solo en ejecución */}
            {c.stage === "ejecucion" && (
              <div className="mt-6 pt-4 border-t border-line-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2.5">
                  Comentarios de Seguridad Operativa
                  {plan?.comments && plan.comments.length > 0 && <span className="ml-1.5 text-ink-quiet">({plan.comments.length})</span>}
                </p>
                <div className="space-y-2 mb-3">
                  {plan?.comments && plan.comments.length > 0 ? (
                    plan.comments.map((comment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-3 text-ink-quiet">
                          <Send className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium text-ink truncate">{comment.text}</p>
                          <p className="text-[11px] text-ink-quiet">{comment.author} · {formatDate(comment.at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12.5px] text-ink-quiet bg-surface rounded-lg p-3 border border-dashed border-line">No hay comentarios registrados</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Agregar comentario..."
                    className="flex-1 text-[12.5px] px-3 py-2 rounded-lg border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  />
                  <Button size="sm" onClick={addComment} className="bg-brand-700 hover:bg-brand-800 transition-colors">
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => store.moveToStageWithoutTimeline(c.id, "investigacion")}><CornerUpLeft className="h-4 w-4" /> Volver a investigación</Button>
              <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}><FileSearch className="h-4 w-4" /> Modificar plan</Button>
              {plan.reviewDecision === "aprobado" && <Button size="sm" onClick={() => store.moveToStageWithoutTimeline(c.id, "ejecucion")}><ArrowRight className="h-4 w-4" /> Siguiente</Button>}
            </div>
          </>
        ) : (
          <>
            <PlanForm c={c} store={store} onSubmitted={() => setFormOpen(false)} onHasChanges={() => {}} />
            <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => store.moveToStageWithoutTimeline(c.id, "investigacion")}><CornerUpLeft className="h-4 w-4" /> Volver a investigación</Button>
            </div>
          </>
        )}
      </StageSection>
    </div>
  );
}

// Lista de responsables (jefes de área)
const RESPONSIBLES = [
  "Alejandro Vielma",
  "Amanda Ridoutt Orozco",
  "Antonio Rebaza Lizaraso",
  "Carlos Barreda Torres",
  "Cesar Malca Yañez",
  "Christian Oliva",
  "Eliana Pesantes",
  "Emerson Navarrete Sotelo",
  "Fredy Tello Ramos",
  "Gueorgui Bonilla",
  "Hector Hinostroza",
  "Javier Gonzales Vasquez",
  "Jean Sucuple Molero",
  "Jennifer Tarazona",
  "Jessica Marylin Bartolo",
  "Jesus Alejandro Vielma Ochoa",
  "Jhoany Anticona",
  "Jhonatan Granados Carhuavilca",
  "Jose Del Mas",
  "Jose Pacombia",
  "Juan Castro Velazco",
  "Juan Pablo Muscari Ognio",
  "Karen Peralta Canchis",
  "Louana Martel Ramos",
  "Manuel Arana Raunelli",
  "Maximo Jesús Alvarez Garcia",
  "Paul Garcia Avelino",
  "Pedro Champa Rodriguez",
  "Rafael Ames",
  "Roberto Carlos Pomar Roman",
  "Ruben Fernandez",
];

function PlanForm({ c, store, onSubmitted, onHasChanges }: PlanFormProps) {
  const existingPlan = c.actionPlans?.[0];
  const [items, setItems] = useState<ActionItem[]>(existingPlan?.items || []);
  const [elaboratedBy, setElaboratedBy] = useState(existingPlan?.elaboratedBy || "");
  const [startDate, setStartDate] = useState(existingPlan?.startDate || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(existingPlan?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority>(existingPlan?.priority || "media");
  const [showSummary, setShowSummary] = useState(false);
  const [planCode, setPlanCode] = useState(existingPlan?.planCode || "");
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const today = new Date().toISOString().slice(0, 10);

  const update = (i: number, key: keyof PlanFormItem, v: string) => {
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)));
    onHasChanges(true);
  };
  const add = () => {
    setItems((p) => [...p, { description: "", owner: RESPONSIBLES[0] || "Seguridad Operativa", priority: "media", startDate: new Date().toISOString().slice(0, 10), dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), actionType: "Correctiva", area: c.area || "operaciones" }]);
    onHasChanges(true);
  };
  const remove = (i: number) => {
    setItems((p) => p.filter((_, idx) => idx !== i));
    onHasChanges(true);
  };

  const canSend = items.every((it) => it.owner.trim() && it.area);

  const send = () => {
    if (!canSend) return;
    const mainArea = items[0].area;
    store.submitActionPlan(c.id, {
      elaboratedBy,
      actionType: "Correctiva",
      description: "",
      startDate,
      dueDate,
      estimatedTime: "",
      priority,
      observations: "",
      sentToArea: mainArea,
      planCode,
      planStatus: "pendiente",
      planDate: new Date().toISOString().slice(0, 10),
      scheduledDate: dueDate,
      annexes: "",
      secondResponsible: "",
      items: items.map((it) => ({ description: it.description.trim(), owner: it.owner.trim(), priority: it.priority, startDate: it.startDate, dueDate: it.dueDate, actionType: it.actionType, area: it.area })),
    });
    onSubmitted();
  };

  const handlePreview = () => {
    if (canSend) {
      setShowSummary(true);
    }
  };

  const filteredResponsibles = (i: number) => {
    const term = searchTerms[i]?.toLowerCase() || "";
    return RESPONSIBLES.filter(name => name.toLowerCase().includes(term));
  };

  return (
    <div className="space-y-4">
      <div className="pt-3 border-t border-line-soft">
        <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Actividades del plan</p>
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-line p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-faint">PLA-{String(i + 1).padStart(2, '0')}</span>
                {items.length > 1 && <button onClick={() => remove(i)} className="text-[11px] text-critical hover:underline">Eliminar</button>}
              </div>
              <Field label="Descripción" required>
                <Textarea value={it.description} onChange={(e) => update(i, "description", e.target.value)} rows={2} placeholder="Detalle de la actividad…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Responsable" required>
                  <div className="relative">
                    <Input 
                      value={searchTerms[i] !== undefined ? searchTerms[i] : it.owner} 
                      onChange={(e) => {
                        setSearchTerms(prev => ({ ...prev, [i]: e.target.value }));
                      }}
                      onFocus={() => {
                        if (searchTerms[i] === undefined) {
                          setSearchTerms(prev => ({ ...prev, [i]: "" }));
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (searchTerms[i] === "") {
                            setSearchTerms(prev => ({ ...prev, [i]: undefined }));
                          }
                        }, 200);
                      }}
                      placeholder="Buscar responsable..."
                      className="w-full"
                    />
                    {searchTerms[i] !== undefined && filteredResponsibles(i).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-line rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredResponsibles(i).map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              update(i, "owner", name);
                              setSearchTerms(prev => ({ ...prev, [i]: undefined }));
                            }}
                            className="w-full text-left px-3 py-2 text-[12.5px] hover:bg-surface-2 transition-colors"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Tipo de acción" required>
                  <Select value={it.actionType} onChange={(e) => update(i, "actionType", e.target.value)}>
                    <option>Correctiva</option><option>Preventiva</option><option>Mitigación</option><option>Compensatoria</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Área responsable" required>
                  <Select value={it.area} onChange={(e) => update(i, "area", e.target.value as Area)}>
                    {(Object.keys(AREA_LABELS) as Area[]).map((a) => <option key={a} value={a}>{AREA_LABELS[a]}</option>)}
                  </Select>
                </Field>
                <Field label="Prioridad" required>
                  <Select value={it.priority} onChange={(e) => update(i, "priority", e.target.value as Priority)}>
                    <option value="critica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha inicio" required>
                  <Input type="date" min={today} value={it.startDate} onChange={(e) => update(i, "startDate", e.target.value)} />
                </Field>
                <Field label="Fecha fin" required>
                  <Input type="date" min={it.startDate || startDate} value={it.dueDate} onChange={(e) => update(i, "dueDate", e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Agregar plan de acción</Button>
        </div>
      </div>

      <div className="pt-3 border-t border-line-soft">
        <Button size="sm" disabled={!canSend} onClick={handlePreview}><Send className="h-4 w-4" /> Revisar y enviar Plan de Acción</Button>
      </div>

      {showSummary && (
        <Modal 
          open={showSummary} 
          onClose={() => setShowSummary(false)} 
          title="Resumen del Plan de Acción" 
          subtitle="Revise los detalles antes de enviar al jefe del área"
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowSummary(false)}><CornerUpLeft className="h-4 w-4" /> Corregir planes</Button>
              <Button onClick={send}><Send className="h-4 w-4" /> Enviar al jefe del área</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-ink-quiet">Código:</span> <span className="font-medium">{c.id}</span></div>
              <div><span className="text-ink-quiet">Elaborado por:</span> <span className="font-medium">{elaboratedBy}</span></div>
            </div>

            <div className="pt-3 border-t border-line-soft">
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Actividades del plan</p>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="rounded-lg bg-surface border border-line p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-brand-700">PLA-{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-ink-quiet">Responsable:</span> {it.owner}</div>
                      <div><span className="text-ink-quiet">Tipo:</span> {it.actionType}</div>
                      <div><span className="text-ink-quiet">Área:</span> {AREA_LABELS[it.area]}</div>
                      <div><span className="text-ink-quiet">Inicio:</span> {formatDate(it.startDate)}</div>
                      <div><span className="text-ink-quiet">Fin:</span> {formatDate(it.dueDate)}</div>
                    </div>
                    {it.description && <div className="mt-2 text-xs"><span className="text-ink-quiet">Descripción:</span> {it.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PlanDisplay({ c }: { c: Store["cases"][number] }) {
  const plan = c.actionPlans?.[0]!;
  const planCode = c.id;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 -mb-1">
        <Button variant="outline" size="sm" onClick={() => downloadPlan(c)}>
          <Download className="h-4 w-4" /> Descargar Plan de Acción
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div><span className="text-ink-quiet">Código:</span> <span className="font-medium">{planCode}</span></div>
        <div><span className="text-ink-quiet">Elaborado por:</span> <span className="font-medium">{plan.elaboratedBy}</span></div>
        <div><span className="text-ink-quiet">Área responsable:</span> <span className="font-medium">{AREA_LABELS[plan.sentToArea ?? c.assigneeArea ?? c.area]}</span></div>
      </div>

      <div className="pt-3 border-t border-line-soft">
        <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Actividades del plan</p>
        <div className="space-y-2">
          {plan.items.map((it, i) => (
            <div key={i} className="rounded-lg bg-surface border border-line p-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-brand-700">PLA-{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-ink-quiet">Responsable:</span> {it.owner}</div>
                <div><span className="text-ink-quiet">Tipo:</span> {(it as any).actionType || "Correctiva"}</div>
                <div><span className="text-ink-quiet">Área:</span> {(it as any).area ? AREA_LABELS[(it as any).area as Area] : "—"}</div>
                <div><span className="text-ink-quiet">Inicio:</span> {formatDate(it.startDate)}</div>
                <div><span className="text-ink-quiet">Fin:</span> {formatDate(it.dueDate)}</div>
              </div>
              {it.description && <div className="mt-2 text-xs"><span className="text-ink-quiet">Descripción:</span> {it.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-ink-faint">{label}</p>
      <p className="text-[13px] font-medium text-ink">{value}</p>
    </div>
  );
}

/* ─── ETAPA 5 — Ejecución (jefe del área) ─── */
function ExecutionStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const today = new Date().toISOString().slice(0, 10);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [itemComment, setItemComment] = useState("");
  const [planComment, setPlanComment] = useState("");
  const [extOpen, setExtOpen] = useState(false);
  const [extMotivo, setExtMotivo] = useState("");
  const [extFecha, setExtFecha] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [extJustificacion, setExtJustificacion] = useState("");
  const plan = c.actionPlans?.[0];
  const items = plan?.items ?? [];
  const accepted = !!c.execution?.acceptedByAreaAt;
  const allComplete = items.length > 0 && items.every((it) => it.status === "completado");

  const addPlanCommentHandler = () => {
    if (planComment.trim()) {
      store.addPlanComment(c.id, 0, planComment.trim());
      setPlanComment("");
    }
  };

  // Calcular tiempo límite de aprobación (2 días desde que se aprobó el plan)
  const approvalDeadline = plan?.reviewedAt 
    ? new Date(new Date(plan.reviewedAt).getTime() + 2 * 86400000)
    : null;
  const timeRemaining = approvalDeadline 
    ? Math.max(0, Math.ceil((approvalDeadline.getTime() - new Date().getTime()) / 86400000))
    : null;
  const isUrgent = timeRemaining !== null && timeRemaining <= 0.5; // Menos de 12 horas

  const addEvidence = (kind: Evidence["kind"]) => {
    const names: Record<typeof kind, [string, string]> = {
      foto: ["evidencia_ejecucion.jpg", "2.4 MB"], video: ["evidencia_ejecucion.mp4", "14.8 MB"], documento: ["avance_ejecucion.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    store.addExecutionEvidence(c.id, { id: `ev_${Math.random().toString(36).slice(2, 9)}`, kind, name: name.replace(/(\.\w+)$/, `_${c.evidence.length + 1}$1`), size, at: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      {c.investigation && (
        <StageSection title="Investigación" subtitle="Hallazgos y causa raíz." icon={<Microscope className="h-5 w-5" />}>
          <InvDisplay inv={c.investigation} />
        </StageSection>
      )}
      <StageSection title="Ejecución del Plan de Acción" subtitle="El jefe del área acepta el plan, registra avances, adjunta evidencias y marca actividades como finalizadas." icon={<Rocket className="h-5 w-5" />} action={<Pill tone="brand" dot>{c.execution?.progress ?? 0}%</Pill>}>
        <div className="rounded-xl bg-surface border border-line p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12.5px] font-semibold text-ink">Avance general</p>
            <span className="text-[20px] font-bold tabular-nums text-brand-700">{c.execution?.progress ?? 0}%</span>
          </div>
          <Progress value={c.execution?.progress ?? 0} className="h-2.5" />
        </div>

        {!accepted && (
          <>
            {timeRemaining !== null && (
              <div className={`rounded-lg border p-4 flex items-center justify-between gap-3 mb-4 ${isUrgent ? 'bg-critical-soft border-critical/30' : 'bg-warning-soft border-warning/30'}`}>
                <div className="flex items-center gap-2.5">
                  {isUrgent ? <AlertCircle className="h-4 w-4 text-critical-ink" /> : <Clock className="h-4 w-4 text-warning-ink" />}
                  <div>
                    <p className={`text-[12.5px] font-semibold ${isUrgent ? 'text-critical-ink' : 'text-warning-ink'}`}>
                      {isUrgent ? '¡URGENTE! Tiempo límite vencido' : `Tiempo restante para aprobar: ${timeRemaining} día(s)`}
                    </p>
                    <p className={`text-[11.5px] ${isUrgent ? 'text-critical-ink/80' : 'text-warning-ink/80'}`}>
                      {isUrgent 
                        ? 'El jefe del área debe aprobar el plan inmediatamente.' 
                        : `Límite: ${approvalDeadline?.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                <p className="text-[12.5px] text-brand-800"><span className="font-semibold">Plan recibido.</span> El jefe del área debe aceptar el plan para iniciar la ejecución.</p>
              </div>
              <Button size="sm" onClick={() => store.acceptPlan(c.id)}><Check className="h-4 w-4" /> Aceptar Plan</Button>
            </div>
          </>
        )}

        {/* Solicitud de ampliación pendiente */}
        {c.extensionRequest && !c.extensionRequest.decision && (
          <div className="rounded-lg bg-warning-soft border border-warning/30 p-4 mb-4">
            <p className="text-[12.5px] font-semibold text-warning-ink">Solicitud de ampliación pendiente de decisión de SO</p>
            <p className="text-[12px] text-ink-soft mt-1">{c.extensionRequest.justificacion} · nueva fecha: {formatDate(c.extensionRequest.nuevaFecha)}</p>
          </div>
        )}
        {c.extensionRequest?.decision === "aprobada" && (
          <div className="rounded-lg bg-brand-100 border-2 border-brand-400 p-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Timer className="h-5 w-5 text-brand-700" />
              <div>
                <p className="text-[13px] font-bold text-brand-900">Prórroga activa</p>
                <p className="text-[12px] text-brand-800 mt-0.5">Nuevo plazo: {formatDate(c.extensionRequest.nuevaFecha)}</p>
              </div>
            </div>
          </div>
        )}
        {c.extensionRequest?.decision === "rechazada" && (
          <div className="rounded-lg bg-critical-soft border border-critical/20 p-3 mb-4 text-[12.5px] text-critical-ink">Ampliación rechazada — se mantiene el plazo original.</div>
        )}

        {/* Comentarios del Plan de Acción */}
        <div className="rounded-lg bg-surface border border-line p-4 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2.5">
            Comentarios del Plan de Acción
            {plan?.comments && plan.comments.length > 0 && <span className="ml-1.5 text-ink-quiet">({plan.comments.length})</span>}
          </p>
          <div className="space-y-2 mb-3">
            {plan?.comments && plan.comments.length > 0 ? (
              plan.comments.map((comment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-3 text-ink-quiet">
                    <Send className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-ink truncate">{comment.text}</p>
                    <p className="text-[11px] text-ink-quiet">{comment.author} · {formatDate(comment.at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[12.5px] text-ink-quiet bg-surface rounded-lg p-3 border border-dashed border-line">No hay comentarios registrados</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={planComment}
              onChange={(e) => setPlanComment(e.target.value)}
              placeholder="Agregar comentario al plan..."
              className="flex-1 text-[12.5px] px-3 py-2 rounded-lg border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
            <Button size="sm" onClick={addPlanCommentHandler} className="bg-brand-700 hover:bg-brand-800 transition-colors">
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
        </div>

        {/* Actividades */}
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Actividades del plan</p>
          <div className="space-y-2.5">
            {items.map((it, i) => (
              <div key={it.id} className="rounded-lg border border-line p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-ink-faint">#{i + 1}</span>
                      <p className="text-[13px] font-semibold text-ink truncate">{it.name}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-quiet">
                      <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {it.owner}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(it.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {(["pendiente", "en_progreso", "completado"] as const).map((st) => (
                      <button key={st} onClick={() => store.updateActionItem(c.id, it.id, { status: st })}
                        className={cn("h-7 px-2.5 rounded-md text-[11px] font-medium transition-all",
                          it.status === st ? st === "completado" ? "bg-brand-700 text-white" : st === "en_progreso" ? "bg-info text-white" : "bg-surface-3 text-ink" : "bg-surface text-ink-quiet hover:bg-surface-2")}>
                        {st === "completado" ? "Finalizada" : st === "en_progreso" ? "En proceso" : "Pendiente"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2.5"><Progress value={it.progress} showLabel /></div>
                <div className="mt-2.5 flex items-center gap-2">
                  <Input value={activeItem === it.id ? itemComment : ""} onChange={(e) => { setActiveItem(it.id); setItemComment(e.target.value); }} placeholder="Agregar comentario…" className="h-8 text-[12px]" />
                  <Button variant="outline" size="sm" disabled={activeItem !== it.id || !itemComment.trim()} onClick={() => { if (itemComment.trim()) { store.updateActionItem(c.id, it.id, { comment: itemComment.trim() }); setItemComment(""); setActiveItem(null); } }}>Agregar</Button>
                </div>
                {it.comments.length > 0 && (
                  <div className="mt-2 space-y-1">{it.comments.map((cm, ci) => <p key={ci} className="text-[11.5px] text-ink-soft">· {cm.text}</p>)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Evidencias y acciones */}
        <div className="mt-5 pt-4 border-t border-line-soft">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Evidencias de ejecución</p>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Button variant="outline" size="sm" onClick={() => addEvidence("foto")}><ImageIcon className="h-4 w-4" /> Adjuntar foto</Button>
            <Button variant="outline" size="sm" onClick={() => addEvidence("video")}><Video className="h-4 w-4" /> Adjuntar video</Button>
            <Button variant="outline" size="sm" onClick={() => addEvidence("documento")}><FileText className="h-4 w-4" /> Adjuntar documento</Button>
            <Button variant="outline" size="sm" onClick={() => setExtOpen(true)} className="ml-auto"><Timer className="h-4 w-4" /> Solicitar ampliación</Button>
          </div>
        </div>

        {allComplete && (
          <div className="pt-4 border-t border-line-soft rounded-xl bg-brand-50 border border-brand-200 p-4 flex items-center justify-between gap-3">
            <p className="text-[12.5px] text-brand-800"><span className="font-semibold">Todas las actividades finalizadas.</span> Finalice la ejecución para devolver el caso a Seguridad Operativa.</p>
            <Button size="sm" onClick={() => store.completeExecution(c.id)}><CheckCircle2 className="h-4 w-4" /> Finalizar ejecución</Button>
          </div>
        )}
      </StageSection>

      <Modal open={extOpen} onClose={() => setExtOpen(false)} title="Solicitar ampliación de plazo" subtitle={`${c.id} · complete los campos obligatorios`}
        footer={<><Button variant="ghost" onClick={() => setExtOpen(false)}>Cancelar</Button><Button onClick={() => { if (extMotivo.trim() && extJustificacion.trim()) { store.requestExtension(c.id, { nuevaFecha: extFecha, justificacion: extJustificacion.trim() }); setExtOpen(false); setExtMotivo(""); setExtJustificacion(""); } }} disabled={!extMotivo.trim() || !extJustificacion.trim()}><Send className="h-4 w-4" /> Enviar solicitud a SO</Button></>}>
        <div className="space-y-4">
          <Field label="Motivo" required><Input value={extMotivo} onChange={(e) => setExtMotivo(e.target.value)} placeholder="Razón de la solicitud…" /></Field>
          <Field label="Nueva fecha propuesta" required><Input type="date" min={today} value={extFecha} onChange={(e) => setExtFecha(e.target.value)} /></Field>
          <Field label="Justificación" required><Textarea value={extJustificacion} onChange={(e) => setExtJustificacion(e.target.value)} rows={3} placeholder="Justifique la ampliación…" /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ─── ETAPA 6 — Verificación (SO) ─── */
function VerificationStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [extDecision, setExtDecision] = useState<"aprobada" | "rechazada" | null>(null);
  const [extNote, setExtNote] = useState("");
  const [extNewDate, setExtNewDate] = useState("");
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [reopenOpen, setReopenOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<Stage>("verificacion");
  const [reason, setReason] = useState("");

  const pendingExt = c.extensionRequest && !c.extensionRequest.decision;

  const canReopen = reason.trim().length >= 5;

  const doReopen = () => {
    if (canReopen) {
      store.reopenCaseWithReason(c.id, targetStage, reason.trim());
      setReopenOpen(false);
      setReason("");
    }
  };

  return (
    <div className="space-y-4">
      {c.investigation && (
        <StageSection title="Investigación" subtitle="Hallazgos y causa raíz." icon={<Microscope className="h-5 w-5" />}>
          <InvDisplay inv={c.investigation} />
        </StageSection>
      )}
      {c.actionPlans?.[0] && (
        <StageSection title="Plan de Acción ejecutado" subtitle="Revise el cumplimiento de las actividades." icon={<ClipboardList className="h-5 w-5" />}>
          <PlanDisplay c={c} />
        </StageSection>
      )}
      {c.execution && (
        <StageSection title="Detalle de Ejecución" subtitle="Avances registrados por el jefe del área." icon={<Activity className="h-5 w-5" />}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-ink-quiet">Progreso general:</span> <span className="font-medium">{c.execution.progress}%</span></div>
              <div><span className="text-ink-quiet">Actualizaciones registradas:</span> <span className="font-medium">{c.execution.updates.length}</span></div>
            </div>
            {c.execution.updates.length > 0 && (
              <div className="pt-3 border-t border-line-soft">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Historial de avances</p>
                <div className="space-y-2">
                  {c.execution.updates.map((upd, i) => (
                    <div key={i} className="rounded-lg bg-surface border border-line p-3 text-sm">
                      <p className="text-[12px] text-ink-soft">{formatDateTime(upd.at)}</p>
                      <p className="text-[13px] mt-1">{upd.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StageSection>
      )}
      <StageSection title="Verificación y Cierre" subtitle="Seguridad Operativa revisa evidencias, verifica el cumplimiento y decide el cierre." icon={<Activity className="h-5 w-5" />} action={<Pill tone="warning" dot>En verificación</Pill>}>
        {pendingExt && (
          <div className="rounded-xl bg-warning-soft border border-warning/30 p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-warning-ink shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-warning-ink">Solicitud de ampliación pendiente</p>
                <p className="text-[12.5px] text-ink-soft mt-0.5">{c.extensionRequest?.justificacion} · nueva fecha: {formatDate(c.extensionRequest?.nuevaFecha ?? "")}</p>
                <p className="text-[12px] text-ink-soft mt-1">{c.extensionRequest?.justificacion}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" className="text-critical hover:bg-critical-soft" onClick={() => setExtDecision("rechazada")}><X className="h-4 w-4" /> Rechazar ampliación</Button>
              <Button size="sm" onClick={() => setExtDecision("aprobada")}><Check className="h-4 w-4" /> Aprobar ampliación</Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)}><StickyNote className="h-4 w-4" /> Registrar observación final</Button>
        </div>

        <div className="pt-4 border-t border-line-soft">
          <p className="text-[12.5px] text-ink-soft mb-3">Decisión final — elija una opción:</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <button onClick={() => setCloseOpen(true)} className="rounded-xl border-2 border-brand-200 bg-brand-50 p-4 text-left hover:border-brand-400 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-brand-700 mb-2" />
              <p className="text-[13px] font-semibold text-brand-900">Cerrar Caso</p>
              <p className="text-[11.5px] text-brand-800/70 mt-0.5">Genera historial completo.</p>
            </button>
            <button onClick={() => store.keepPending(c.id)} className="rounded-xl border-2 border-warning/30 bg-warning-soft p-4 text-left hover:border-warning/50 transition-colors">
              <Timer className="h-5 w-5 text-warning-ink mb-2" />
              <p className="text-[13px] font-semibold text-warning-ink">Mantener Pendiente</p>
              <p className="text-[11.5px] text-ink-soft mt-0.5">Sigue en verificación.</p>
            </button>
            <button onClick={() => setReopenOpen(true)} className="rounded-xl border-2 border-info/20 bg-info-soft p-4 text-left hover:border-info/40 transition-colors">
              <CornerUpLeft className="h-5 w-5 text-info-ink mb-2" />
              <p className="text-[13px] font-semibold text-info-ink">Reabrir Caso</p>
              <p className="text-[11.5px] text-ink-soft mt-0.5">Vuelve a verificación.</p>
            </button>
          </div>
        </div>
      </StageSection>

      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Registrar observación de verificación" subtitle={`${c.id} · queda en la bitácora`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancelar</Button><Button onClick={() => { if (note.trim()) { store.addVerificationNote(c.id, note.trim()); setNoteOpen(false); setNote(""); } }} disabled={!note.trim()}><StickyNote className="h-4 w-4" /> Guardar</Button></>}>
        <Field label="Observación" required><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} /></Field>
      </Modal>

      <Modal open={extDecision !== null} onClose={() => setExtDecision(null)} title={extDecision === "aprobada" ? "Aprobar ampliación" : "Rechazar ampliación"} subtitle={`${c.id} · decisión de SO`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setExtDecision(null)}>Cancelar</Button><Button variant={extDecision === "rechazada" ? "danger" : "primary"} onClick={() => { if (extDecision) store.reviewExtension(c.id, extDecision, extNote.trim() || undefined, extNewDate || c.extensionRequest?.nuevaFecha); setExtDecision(null); setExtNote(""); setExtNewDate(""); }}>Confirmar</Button></>}>
        {extDecision === "aprobada" && (
          <>
            <Field label="Nueva fecha límite" required>
              <Input type="date" value={extNewDate || c.extensionRequest?.nuevaFecha || ""} onChange={(e) => setExtNewDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Nota (opcional)"><Textarea value={extNote} onChange={(e) => setExtNote(e.target.value)} rows={3} /></Field>
          </>
        )}
        {extDecision === "rechazada" && (
          <Field label="Nota (opcional)"><Textarea value={extNote} onChange={(e) => setExtNote(e.target.value)} rows={3} /></Field>
        )}
      </Modal>

      <Modal open={closeOpen} onClose={() => setCloseOpen(false)} title="Cerrar caso" subtitle={`${c.id} · se generará el historial completo`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setCloseOpen(false)}>Cancelar</Button><Button onClick={() => { store.closeCase(c.id, closeNote.trim() || undefined); setCloseOpen(false); }}><CheckCircle2 className="h-4 w-4" /> Confirmar cierre</Button></>}>
        <Field label="Nota de cierre (opcional)"><Textarea value={closeNote} onChange={(e) => setCloseNote(e.target.value)} rows={3} /></Field>
      </Modal>

      <Modal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title="Reabrir caso para edición"
        subtitle={`${c.id} · seleccione la etapa a la que desea volver`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReopenOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={doReopen} disabled={!canReopen}>
              <CornerUpLeft className="h-4 w-4" /> Reabrir caso
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-warning-soft border border-warning/30 p-4 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-warning-ink shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Reapertura de expediente</p>
              <p className="text-[12.5px] text-ink-soft mt-1">
                Al reabrir el caso, el estado cambiará de "Cerrado" a la etapa que seleccione.
                Se registrará en el historial quién reabrió el caso, cuándo y por qué motivo.
                Toda la información anterior se conserva.
              </p>
            </div>
          </div>

          <Field label="Etapa a la que desea volver" required>
            <Select value={targetStage} onChange={(e) => setTargetStage(e.target.value as Stage)}>
              <option value="verificacion">Verificación — corregir la verificación final</option>
              <option value="ejecucion">Ejecución — corregir avances o actividades</option>
              <option value="plan_accion">Plan de Acción — corregir o ajustar el plan</option>
              <option value="investigacion">Investigación — corregir hallazgos o causa raíz</option>
              <option value="evaluacion">Evaluación — corregir la evaluación del caso</option>
              <option value="recepcion">Recepción — revisar desde el inicio</option>
            </Select>
          </Field>

          <Field label="Motivo de la reapertura" required hint="Mínimo 5 caracteres — este motivo quedará registrado en el historial">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explique por qué reabre el caso. Ej: La investigación no identificó la causa raíz correcta. El plan de acción no contempló todas las acciones necesarias. Se detectó información incompleta en el expediente…"
            />
          </Field>

          <div className="rounded-lg bg-info-soft border border-info/20 p-3 text-[12px] text-info-ink flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>El caso volverá a la etapa seleccionada. El jefe del área podrá continuar con las actividades pendientes.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── ETAPA 7 — Cierre ─── */
function ClosedStage({ c, store }: { c: Store["cases"][number]; store: Store }) {
  const createdAt = new Date(c.createdAt);
  const closedAt = new Date(c.closedAt ?? c.createdAt);
  const totalDays = Math.max(1, Math.round((closedAt.getTime() - createdAt.getTime()) / 86400000));
  const totalHours = Math.round((closedAt.getTime() - createdAt.getTime()) / 3600000);
  const participants = Array.from(new Set([c.reporter, c.assignee, ...c.timeline.map((t) => t.actor)].filter(Boolean)));
  const activityCount = c.actionPlans?.[0]?.items.length ?? 0;
  const evidenceCount = c.evidence.length;
  const commentCount = c.timeline.filter((t) => t.kind === "comentario").length
    + (c.actionPlans?.[0]?.items.reduce((acc, it) => acc + it.comments.length, 0) ?? 0)
    + (c.execution?.updates.length ?? 0);

  const [reopenOpen, setReopenOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<Stage>("verificacion");
  const [reason, setReason] = useState("");

  const summary = [
    { label: "Tiempo total de atención", value: totalDays >= 1 ? `${totalDays} días` : `${totalHours} h`, icon: Clock },
    { label: "Área responsable", value: AREA_LABELS[c.assigneeArea ?? c.area], icon: Building2 },
    { label: "Responsables participantes", value: `${participants.length}`, icon: UserIcon, detail: participants.join(", ") },
    { label: "Actividades del plan", value: `${activityCount}`, icon: ClipboardList },
    { label: "Evidencias adjuntas", value: `${evidenceCount}`, icon: FileText },
    { label: "Comentarios registrados", value: `${commentCount}`, icon: Activity },
  ];

  const canReopen = reason.trim().length >= 5;

  const doReopen = () => {
    if (canReopen) {
      store.reopenCaseWithReason(c.id, targetStage, reason.trim());
      setReopenOpen(false);
      setReason("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner de alerta — Reabrir caso */}
      <Card className="border-warning/30 bg-warning-soft/40 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/15 text-warning-ink grid place-items-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold text-ink">¿El caso fue cerrado incorrectamente?</p>
            <p className="text-[12.5px] text-ink-soft mt-0.5">
              Si la investigación, el plan de acción o cualquier información del caso no fue elaborada de manera correcta,
              puede reabrir el expediente y editarlo. Seleccione a qué etapa desea volver.
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-warning/40 text-warning-ink hover:bg-warning-soft shrink-0" onClick={() => setReopenOpen(true)}>
            <CornerUpLeft className="h-4 w-4" /> Reabrir y Editar
          </Button>
        </div>
      </Card>

      <StageSection title="Caso cerrado" subtitle="El expediente completo fue archivado por Seguridad Operativa." icon={<CheckCircle2 className="h-5 w-5" />} action={<Pill tone="neutral" dot>Cerrado {formatDate(c.closedAt ?? "")}</Pill>}>
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-5 text-center">
          <div className="h-12 w-12 rounded-full bg-brand-700 text-white grid place-items-center mx-auto"><CheckCircle2 className="h-6 w-6" /></div>
          <p className="mt-3 text-[14px] font-semibold text-brand-900">Caso resuelto y archivado</p>
          <p className="text-[12.5px] text-brand-800/80 mt-1 max-w-md mx-auto">Toda la gestión quedó registrada en la línea de tiempo. El expediente está disponible para auditoría y reportes.</p>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3">Resumen final del expediente</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {summary.map((s) => (
              <div key={s.label} className="rounded-xl bg-surface border border-line p-4">
                <div className="flex items-center gap-2 text-ink-faint"><s.icon className="h-4 w-4" /><span className="text-[11px] font-medium uppercase tracking-wide">{s.label}</span></div>
                <p className="mt-2 text-[18px] font-bold text-ink tabular-nums leading-none">{s.value}</p>
                {s.detail && <p className="text-[11px] text-ink-quiet mt-1.5 line-clamp-2">{s.detail}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3">Historial completo del caso</p>
          <div className="rounded-xl border border-line overflow-hidden max-h-[280px] overflow-y-auto">
            {[...c.timeline].reverse().map((t) => (
              <div key={t.id} className="px-4 py-2.5 border-b border-line-soft last:border-0 flex items-start gap-3 text-[12px]">
                <span className="text-ink-faint tabular-nums shrink-0 w-28">{formatDateTime(t.at)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-medium">{t.title}</p>
                  <p className="text-ink-quiet mt-0.5">{t.actor}</p>
                  {t.detail && <p className="text-ink-soft mt-1 leading-relaxed">{t.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {c.investigation && (
          <div className="mt-5">
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3">Resumen de la investigación</p>
            <InvDisplay inv={c.investigation} />
          </div>
        )}
      </StageSection>

      {/* Modal: Reabrir caso */}
      <Modal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title="Reabrir caso para edición"
        subtitle={`${c.id} · seleccione la etapa a la que desea volver`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReopenOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={doReopen} disabled={!canReopen}>
              <CornerUpLeft className="h-4 w-4" /> Reabrir caso
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-warning-soft border border-warning/30 p-4 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-warning-ink shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Reapertura de expediente</p>
              <p className="text-[12.5px] text-ink-soft mt-1">
                Al reabrir el caso, el estado cambiará de "Cerrado" a la etapa que seleccione.
                Se registrará en el historial quién reabrió el caso, cuándo y por qué motivo.
                Toda la información anterior se conserva.
              </p>
            </div>
          </div>

          <Field label="Etapa a la que desea volver" required>
            <Select value={targetStage} onChange={(e) => setTargetStage(e.target.value as Stage)}>
              <option value="verificacion">Verificación — corregir la verificación final</option>
              <option value="ejecucion">Ejecución — corregir avances o actividades</option>
              <option value="plan_accion">Plan de Acción — corregir o ajustar el plan</option>
              <option value="investigacion">Investigación — corregir hallazgos o causa raíz</option>
              <option value="evaluacion">Evaluación — corregir la evaluación del caso</option>
              <option value="recepcion">Recepción — revisar desde el inicio</option>
            </Select>
          </Field>

          <Field label="Motivo de la reapertura" required hint="Mínimo 5 caracteres — este motivo quedará registrado en el historial">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explique por qué reabre el caso. Ej: La investigación no identificó la causa raíz correcta. El plan de acción no contempló todas las acciones necesarias. Se detectó información incompleta en el expediente…"
            />
          </Field>

          <div className="rounded-lg bg-info-soft border border-info/20 p-3 text-[12px] text-info-ink flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>El caso volverá a la etapa seleccionada y podrá editar la información correspondiente. El historial completo se conserva y la reapertura queda registrada con fecha, usuario y motivo.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RejectedStage({ c }: { c: Store["cases"][number] }) {
  const reject = c.timeline.find((t) => t.kind === "rechazado");
  return (
    <StageSection title="Reporte rechazado" subtitle="El caso no procedió tras la revisión de Seguridad Operativa." icon={<X className="h-5 w-5" />} action={<Pill tone="critical" dot>Rechazado</Pill>}>
      <div className="rounded-xl bg-critical-soft border border-critical/20 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-critical-ink shrink-0 mt-0.5" />
        <div>
          <p className="text-[13.5px] font-semibold text-critical-ink">Motivo del rechazo</p>
          <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">{reject?.detail ?? "Sin detalle."}</p>
          <p className="text-[11.5px] text-ink-quiet mt-2">Registrado {relativeTime(reject?.at ?? "")}</p>
        </div>
      </div>
      <DescriptionBlock c={c} />
    </StageSection>
  );
}

/* ─── Timeline Panel (para modal) ─── */
function TimelinePanel({ c }: { c: Store["cases"][number] }) {
  const events = [...c.timeline].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const [comment, setComment] = useState("");
  const { addTimelineComment } = useStore();

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line" />
        <div className="space-y-4">
          {events.map((t) => (
            <div key={t.id} className="relative pl-10">
              <div className={cn("absolute left-0 top-1 h-8 w-8 rounded-full grid place-items-center border-2 border-white shrink-0",
                t.actorRole === "seguridad" ? "bg-brand-100 text-brand-800" : "bg-surface-2 text-ink-soft")}>
                <TimelineIcon kind={t.kind} />
              </div>
              <p className="text-[12.5px] font-semibold text-ink leading-tight">{t.title}</p>
              <p className="text-[11px] text-ink-quiet mt-0.5">{t.actor} · {relativeTime(t.at)}</p>
              {t.detail && <p className="text-[12px] text-ink-soft mt-1.5 leading-relaxed bg-surface/60 rounded-md p-2">{t.detail}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="pt-3 border-t border-line-soft">
        <Field label="Agregar comentario al expediente">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Comentario interno…" />
        </Field>
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="secondary" disabled={!comment.trim()} onClick={() => { if (comment.trim()) { addTimelineComment(c.id, comment.trim()); setComment(""); } }}>
            <Paperclip className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineIcon({ kind }: { kind: string }) {
  const map: Record<string, typeof FileSearch> = {
    creado: FileText, aprobado: Check, rechazado: X, info_solicitada: Mail, info_recibida: CornerUpLeft,
    derivado: Send, investigacion: Microscope, plan_propuesto: ClipboardList, plan_aprobado: CheckCircle2,
    plan_ajustado: AlertCircle, ejecucion: Rocket, ampliacion: Timer, seguimiento: Activity,
    cierre: CheckCircle2, reapertura: CornerUpLeft, comentario: FileText, sancion: Gavel,
  };
  const Icon = map[kind] ?? FileText;
  return <Icon className="h-4 w-4" />;
}

/* ─── Descargar Plan de Acción (PDF imprimible) ─── */
function downloadPlan(c: Store["cases"][number]) {
  const plan = c.actionPlans?.[0];
  if (!plan) return;
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = plan.items.map((it, i) => `
    <tr>
      <td>PLA-${String(i + 1).padStart(2, '0')}</td>
      <td><strong>${escapeHtml(it.description)}</strong></td>
      <td>${escapeHtml(it.owner)}</td>
      <td>${escapeHtml((it as any).actionType || "Correctiva")}</td>
      <td>${escapeHtml((it as any).area ? AREA_LABELS[(it as any).area as Area] : "—")}</td>
      <td>${formatDate(it.startDate)}</td>
      <td>${formatDate(it.dueDate)}</td>
      <td>${it.status === "completado" ? "Finalizada" : it.status === "en_progreso" ? "En proceso" : "Pendiente"}</td>
    </tr>`).join("");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plan de Acción ${c.id}</title>
    <style>
      body { font-family: 'Inter', -apple-system, sans-serif; color: #182621; margin: 40px; }
      .head { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #14814a; padding-bottom: 16px; margin-bottom: 24px; }
      .logo { width: 44px; height: 44px; background: #0F6B3E; border-radius: 10px; display: grid; place-items: center; color: #fff; font-weight: 700; }
      h1 { font-size: 22px; margin: 0; } h2 { font-size: 15px; margin: 20px 0 10px; color: #0F6B3E; border-bottom: 1px solid #e3e8e5; padding-bottom: 6px; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 12.5px; margin-bottom: 12px; }
      .meta div { border-left: 2px solid #14814a; padding-left: 8px; } .meta b { color: #767f79; font-weight: 600; font-size: 10.5px; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; font-size: 11.5px; } th, td { border: 1px solid #e3e8e5; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background: #f6f8f7; font-weight: 600; color: #41504a; } .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e3e8e5; font-size: 10.5px; color: #767f79; }
    </style></head><body>
    <div class="head"><img src="/logo.png" alt="SIGMA L1" style="width:44px;height:44px;border-radius:10px;" /><div><h1>Plan de Acción — SIGMA L1</h1><div style="color:#767f79;font-size:12px">Línea 1 del Metro de Lima · Seguridad Operativa</div></div></div>
    <h2>Información del expediente</h2>
    <div class="meta">
      <div><b>Código</b><br/>${c.id}</div>
      <div><b>Tipo de incidencia</b><br/>${EVENT_LABELS[c.type]}</div>
      <div><b>Estación</b><br/>${escapeHtml(c.station)}</div>
      <div><b>Área responsable</b><br/>${AREA_LABELS[c.assigneeArea ?? c.area]}</div>
      <div><b>Análisis de riesgo</b><br/>${RISK_LABELS[c.riskLevel]}</div>
      <div><b>Fecha límite</b><br/>${formatDate(c.slaDueDate)}</div>
      <div><b>Elaborado por</b><br/>${escapeHtml(plan.elaboratedBy)}</div>
      <div><b>Persona responsable</b><br/>${escapeHtml(plan.secondResponsible || plan.items[0]?.owner || "—")}</div>
      <div><b>Fecha de creación</b><br/>${formatDateTime(plan.submittedAt ?? c.createdAt)}</div>
    </div>
    <h2>Objetivo del Plan de Acción</h2>
    <p style="font-size:12.5px">${escapeHtml(plan.actionType)} — ${escapeHtml(plan.description)}</p>
    ${plan.observations ? `<h2>Observaciones generales</h2><p style="font-size:12.5px">${escapeHtml(plan.observations)}</p>` : ""}
    <h2>Actividades</h2>
    <table><thead><tr><th>Código</th><th>Actividad</th><th>Responsable</th><th>Tipo de acción</th><th>Área responsable</th><th>Inicio</th><th>Límite</th><th>Estado</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="foot">Documento generado por SIGMA L1 · ${formatDateTime(new Date().toISOString())}</div>
    </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

