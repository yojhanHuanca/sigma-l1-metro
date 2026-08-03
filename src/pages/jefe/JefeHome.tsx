import { useMemo, useState, useEffect } from "react";
import {
  Rocket,
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
  Flag,
  Building2,
  Timer,
  Download,
  Send,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Paperclip,
  ChevronRight,
  CheckCircle2,
  Activity,
  ClipboardList,
  ShieldCheck,
  Mail,
  StickyNote,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { JefeShell } from "@/design-system/layout/JefeShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Textarea } from "@/design-system/primitives/Input";
import { Modal } from "@/design-system/primitives/Modal";
import { Pill, PriorityPill, RiskPill } from "@/design-system/primitives/Pill";
import { Progress, EmptyState } from "@/design-system/primitives/Progress";
import {
  AREA_HEADS,
  AREA_LABELS,
  EVENT_LABELS,
  PRIORITY_LABELS,
  RISK_LABELS,
  type ActionItem,
  type Area,
  type CaseFile,
  type Evidence,
} from "@/lib/types";
import { cn, formatDate, formatDateTime, relativeTime, daysUntil } from "@/lib/utils";

export function JefeHome() {
  const s = useStore();
  const { cases, currentUser } = s;
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Casos asignados al jefe: cualquier caso en ejecucion/verificacion o con plan enviado
  const myCases = useMemo(
    () => cases.filter(
      (c) => (c.stage === "ejecucion" || c.stage === "verificacion" || c.stage === "plan_accion") &&
             (c.assigneeArea === currentUser.area || c.area === currentUser.area || c.assignee === currentUser.name)
    ),
    [cases, currentUser.area, currentUser.name]
  );

  const selectedCase = selectedCaseId ? myCases.find((c) => c.id === selectedCaseId) : myCases[0];

  return (
    <JefeShell>
      {myCases.length === 0 ? (
        <NoPlanAssigned />
      ) : (
        <div className="space-y-6">
          {/* Banner ancho completo */}
          {selectedCase && (
            <div
              className="rounded-2xl text-white p-6 relative overflow-hidden"
              style={{
                backgroundImage: "url('/banner-bg.jpeg'), linear-gradient(135deg, #0F6B3E 0%, #14814a 50%, #1a9b5f 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-mesh opacity-70" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  {selectedCase.stage === "verificacion" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/30 border border-warning/40 text-[12px] font-bold text-white">
                      <Timer className="h-3.5 w-3.5" />
                      En Verificación
                    </span>
                  ) : selectedCase.execution?.acceptedByAreaAt ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/30 border border-brand/40 text-[12px] font-bold text-white">
                      <Activity className="h-3.5 w-3.5" />
                      En Ejecución
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-info/30 border border-info/40 text-[12px] font-bold text-white">
                      <Clock className="h-3.5 w-3.5" />
                      Pendiente de Aceptación
                    </span>
                  )}
                </div>
                <h1 className="text-[28px] font-extrabold tracking-tight font-display leading-tight text-white">
                  {selectedCase.stage === "verificacion" ? "Revise el Plan de Acción" : selectedCase.execution?.acceptedByAreaAt ? "Ejecute su Plan de Acción" : "Revise y Acepte el Plan"}
                </h1>
                <p className="text-[14px] text-white font-medium mt-2 max-w-xl leading-relaxed">
                  {selectedCase.stage === "verificacion" 
                    ? "El plan está pendiente de verificación por Seguridad Operativa. Espere la decisión."
                    : selectedCase.execution?.acceptedByAreaAt 
                      ? "Registre avances, adjunte evidencias y envíe a verificación al finalizar."
                      : "Tiene un plan asignado por Seguridad Operativa. Revíselo y acéptelo para iniciar la ejecución."
                  }
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 border border-white/30 px-2.5 py-1 text-[11.5px] font-bold text-white">{selectedCase.id}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 border border-white/30 px-2.5 py-1 text-[11.5px] font-bold text-white">{EVENT_LABELS[selectedCase.type]}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 border border-white/30 px-2.5 py-1 text-[11.5px] font-bold text-white">Área {AREA_LABELS[selectedCase.assigneeArea ?? selectedCase.area]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Layout de dos columnas debajo del banner */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Lista de casos - sidebar izquierdo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-line overflow-hidden">
                <div className="p-4 border-b border-line-soft bg-surface-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[14px] font-semibold text-ink">Mis Planes de Acción</h2>
                    <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">{myCases.length}</span>
                  </div>
                </div>
                <div className="p-2 space-y-1 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {myCases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all group",
                        selectedCase?.id === c.id 
                          ? "border-brand-300 bg-brand-50 shadow-sm" 
                          : "border-transparent hover:border-brand-200 hover:bg-surface-2"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">{c.id}</span>
                        {c.stage === "verificacion" ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning-soft text-warning-ink font-medium border border-warning/20">Verificación</span>
                        ) : c.execution?.acceptedByAreaAt ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium border border-brand-200">En ejecución</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-info-soft text-info-ink font-medium border border-info/20">Pendiente</span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-ink line-clamp-2 leading-tight mb-2">{c.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-ink-quiet">
                        <span className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          {EVENT_LABELS[c.type]}
                        </span>
                        <span className="text-ink-faint">·</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {AREA_LABELS[c.assigneeArea ?? c.area]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal - lado derecho */}
            <div className="lg:col-span-3">
              {selectedCase ? (
                <PlanExecutionView c={selectedCase} s={s} onBack={() => setSelectedCaseId(null)} allCases={myCases} onSelectCase={setSelectedCaseId} />
              ) : (
                <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="Seleccione un caso" description="Haga clic en un caso de la lista para ver los detalles." />
              )}
            </div>
          </div>
        </div>
      )}
    </JefeShell>
  );
}

/* ─── Sin plan asignado ─── */
function NoPlanAssigned() {
  const { currentUser } = useStore();
  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="rounded-2xl text-white p-8 relative overflow-hidden"
        style={{
          backgroundImage: "url('/banner-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/70">Portal del Jefe de Área</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-tight font-display">Hola, {currentUser.name.split(" ")[0]}</h1>
          <p className="text-[13.5px] text-white/80 mt-2">No tiene Planes de Acción asignados pendientes de ejecución en este momento.</p>
        </div>
      </div>
      <EmptyState
        className="mt-6"
        icon={<ClipboardList className="h-5 w-5" />}
        title="Sin planes activos"
        description="Cuando Seguridad Operativa apruebe y asigne un Plan de Acción a su área, aparecerá aquí para su ejecución."
      />
      <Card className="mt-6 p-5">
        <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3">¿Qué puede hacer aquí?</p>
        <ul className="space-y-2.5">
          {[
            { icon: Rocket, text: "Ejecutar las actividades del Plan de Acción asignado" },
            { icon: Activity, text: "Registrar avances, comentarios y evidencias" },
            { icon: Timer, text: "Solicitar ampliación de plazo si necesita más tiempo" },
            { icon: Send, text: "Enviar el plan a verificación al finalizar" },
          ].map((it, i) => (
            <li key={i} className="flex items-center gap-3 text-[13px] text-ink-soft">
              <span className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0"><it.icon className="h-4 w-4" /></span>
              {it.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ─── Extension modal ─── */
function ExtensionModal({ open, onClose, caseId }: { open: boolean; onClose: () => void; caseId: string }) {
  const s = useStore();
  const c = s.getCase(caseId);
  const [motivo, setMotivo] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);

  const addEv = (kind: Evidence["kind"]) => {
    const names: Record<typeof kind, [string, string]> = {
      foto: ["ampliacion.jpg", "2.4 MB"], video: ["ampliacion.mp4", "14.8 MB"], documento: ["ampliacion.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    setEvidencias((p) => [...p, { id: `ev_${Math.random().toString(36).slice(2, 9)}`, kind, name: name.replace(/(\.\w+)$/, `_${p.length + 1}$1`), size, at: new Date().toISOString() }]);
  };

  const canSend = motivo.trim() && justificacion.trim() && nuevaFecha;

  const submit = () => {
    if (!canSend) return;
    s.requestExtension(caseId, { motivo: motivo.trim(), justificacion: justificacion.trim(), nuevaFecha });
    evidencias.forEach((ev) => s.addExecutionEvidence(caseId, ev));
    setMotivo(""); setJustificacion(""); setEvidencias([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Solicitar ampliación de plazo"
      subtitle="Para el Plan de Acción asignado"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={!canSend}><Send className="h-4 w-4" /> Enviar solicitud a SO</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Contexto del caso */}
        <div className="rounded-xl bg-surface border border-line p-4">
          <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-faint mb-2">Plan de Acción al que solicita ampliación</p>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-mono text-[13px] font-bold text-brand-700">{caseId}</span>
            {c && <span className="text-[12.5px] text-ink-soft">·</span>}
            {c && <span className="text-[12.5px] text-ink-soft truncate">{c.title}</span>}
          </div>
          {c?.actionPlan && (
            <div className="mt-2 pt-2 border-t border-line-soft grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <div><span className="text-ink-faint">Fecha límite actual:</span> <span className="text-ink font-medium">{formatDate(c.slaDueDate)}</span></div>
              <div><span className="text-ink-faint">Días restantes:</span> <span className="text-ink font-medium">{Math.max(0, Math.ceil((new Date(c.slaDueDate).getTime() - Date.now()) / 86400000))} días</span></div>
              <div><span className="text-ink-faint">Actividades:</span> <span className="text-ink font-medium">{c.actionPlan.items.length}</span></div>
              <div><span className="text-ink-faint">Avance:</span> <span className="text-ink font-medium">{c.execution?.progress ?? 0}%</span></div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-info-soft border border-info/20 p-3.5 flex items-start gap-2.5">
          <Mail className="h-4 w-4 text-info-ink shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-info-ink">La solicitud se notificará a Seguridad Operativa y se enviará un correo. Quedará registrada en el historial del expediente.</p>
        </div>
        <Field label="Motivo de la solicitud" required>
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Razón principal por la que necesita más tiempo para ejecutar el plan…" />
        </Field>
        <Field label="Justificación" required>
          <Textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} rows={3} placeholder="Justifique detalladamente por qué no podrá completar el plan en el plazo asignado…" />
        </Field>
        <Field label="Nueva fecha propuesta" required>
          <Input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
        </Field>
        <div className="pt-3 border-t border-line-soft">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Evidencias (opcional)</p>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Button variant="outline" size="sm" onClick={() => addEv("foto")}><ImageIcon className="h-4 w-4" /> Foto</Button>
            <Button variant="outline" size="sm" onClick={() => addEv("documento")}><FileText className="h-4 w-4" /> Documento</Button>
            <Button variant="outline" size="sm" onClick={() => addEv("video")}><Video className="h-4 w-4" /> Video</Button>
          </div>
          {evidencias.length > 0 && (
            <div className="space-y-1.5">
              {evidencias.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 p-2 rounded-md bg-surface text-[12px]">
                  <Paperclip className="h-3.5 w-3.5 text-ink-faint" /> {ev.name} <span className="text-ink-faint">· {ev.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Vista principal de ejecución ─── */
function PlanExecutionView({ c, s, onBack, allCases, onSelectCase }: { c: CaseFile; s: ReturnType<typeof useStore>; onBack: () => void; allCases: CaseFile[]; onSelectCase: (id: string) => void }) {
  const [extOpen, setExtOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [showCaseList, setShowCaseList] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActionItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().slice(0, 10));
  const [activityStatus, setActivityStatus] = useState<ActionItem["status"]>("pendiente");
  const [activityProgress, setActivityProgress] = useState(0);

  // Actualizar estados locales cuando cambia la actividad seleccionada
  useEffect(() => {
    if (selectedActivity) {
      setActivityStatus(selectedActivity.status);
      setActivityProgress(selectedActivity.progress);
    }
  }, [selectedActivity]);

  if (!c.actionPlan) {
    return (
      <div className="space-y-5">
        <Card className="p-5 border-info-soft bg-info-soft/30">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-info text-white grid place-items-center shrink-0"><Clock className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-ink">Plan de Acción pendiente</p>
              <p className="text-[12px] text-ink-soft mt-1">
                {c.stage === "plan_accion" 
                  ? "Seguridad Operativa está preparando el Plan de Acción. Espere a que sea enviado para su revisión."
                  : "El Plan de Acción aún no ha sido asignado a este caso."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const plan = c.actionPlan;
  const items = plan.items;
  const completed = items.filter((it) => it.status === "completado").length;
  const inProgress = items.filter((it) => it.status === "en_progreso").length;
  const overallProgress = c.execution?.progress ?? 0;
  const allComplete = items.length > 0 && items.every((it) => it.status === "completado");
  const days = daysUntil(c.slaDueDate);
  const accepted = !!c.execution?.acceptedByAreaAt;
  const isVerification = c.stage === "verificacion";
  
  // Calcular días desde aceptación
  const daysSinceAcceptance = accepted && c.execution?.acceptedByAreaAt 
    ? Math.floor((new Date().getTime() - new Date(c.execution.acceptedByAreaAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Verificar si hay evidencias cargadas
  const hasEvidence = c.evidence.length > 0;

  const counts = {
    fotos: c.evidence.filter((e) => e.kind === "foto").length,
    videos: c.evidence.filter((e) => e.kind === "video").length,
    documentos: c.evidence.filter((e) => e.kind === "documento").length,
    comentarios: items.reduce((acc, it) => acc + it.comments.length, 0) + (c.execution?.updates.length ?? 0),
  };

  const addEvidence = (kind: Evidence["kind"]) => {
    const names: Record<typeof kind, [string, string]> = {
      foto: ["evidencia_foto.jpg", "2.4 MB"], 
      video: ["evidencia_video.mp4", "14.8 MB"], 
      documento: ["evidencia_doc.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    s.addExecutionEvidence(c.id, { 
      id: `ev_${Math.random().toString(36).slice(2, 9)}`, 
      kind, 
      name: name.replace(/(\.\w+)$/, `_${Date.now() % 1000}$1`), 
      size, 
      at: new Date().toISOString() 
    });
    
    // Si se carga evidencia y todas las actividades están completadas, marcar como finalizado
    if (allComplete) {
      s.updateActionItem(c.id, items[0].id, { progress: 100 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Información del caso + finalización/evidencias */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5 border-brand-100 bg-brand-50/30">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Expediente asignado</p>
              <h2 className="mt-1 text-[18px] font-bold text-ink tracking-tight leading-tight">{c.title}</h2>
            </div>
            {isVerification ? <Pill tone="warning" dot>Pendiente de Verificación</Pill> : !accepted ? <Pill tone="info" dot>Pendiente de Aceptación</Pill> : <Pill tone="brand" dot>En Ejecución</Pill>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <InfoCell icon={<FileText className="h-3.5 w-3.5" />} label="Código" value={c.id} />
            <InfoCell icon={<Flag className="h-3.5 w-3.5" />} label="Tipo de incidencia" value={EVENT_LABELS[c.type]} />
            <InfoCell icon={<MapPin className="h-3.5 w-3.5" />} label="Estación" value={c.station} />
            <InfoCell icon={<Building2 className="h-3.5 w-3.5" />} label="Área responsable" value={AREA_LABELS[c.assigneeArea ?? c.area]} />
            <InfoCell icon={<User className="h-3.5 w-3.5" />} label="Jefe asignado" value={c.assignee ?? "—"} />
            <div className="flex items-center gap-2.5">
              <span className="text-ink-faint"><Flag className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-[10.5px] text-ink-faint">Riesgo</p>
                <div className="mt-0.5"><RiskPill risk={c.riskLevel} /></div>
              </div>
            </div>
            <InfoCell icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha de asignación" value={formatDate(plan.submittedAt ?? c.createdAt)} />
            <InfoCell icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha límite" value={formatDate(c.slaDueDate)} />
          </div>
        </Card>

        {/* Finalización y Evidencias (solo si está aceptado) */}
        {accepted && !isVerification && (
          <div className="space-y-5">
            {/* Finalización del plan */}
            <Card className={cn(allComplete && hasEvidence ? "border-brand-300 bg-brand-50" : "border-line-soft bg-surface")}>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", allComplete && hasEvidence ? "bg-brand-700 text-white" : "bg-surface-2 text-ink-faint")}>
                    <Send className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-ink">Finalización del plan</p>
                    <p className="text-[12px] text-ink-soft mt-1">
                      {!allComplete 
                        ? `Complete todas las actividades para habilitar el envío a verificación. ${completed} de ${items.length} actividades completadas.`
                        : !hasEvidence 
                          ? "Todas las actividades están completadas. Cargue al menos una evidencia para habilitar el envío a verificación."
                          : "Todas las actividades están completadas y tiene evidencias cargadas. Puede enviar el plan a verificación."
                      }
                    </p>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-4" disabled={!allComplete || !hasEvidence} onClick={() => setSendOpen(true)}>
                  <Send className="h-4 w-4" /> Enviar para Verificación
                </Button>
              </div>
            </Card>

            {/* Evidencias registradas */}
            <Card padded={false}>
              <div className="p-4 border-b border-line-soft">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Evidencias registradas</p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-ink tabular-nums">{counts.fotos}</p>
                  <p className="text-[11px] text-ink-quiet">Fotos</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-ink tabular-nums">{counts.videos}</p>
                  <p className="text-[11px] text-ink-quiet">Videos</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-ink tabular-nums">{counts.documentos}</p>
                  <p className="text-[11px] text-ink-quiet">Docs</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Barra de progreso general (solo si está aceptado) */}
      {accepted && (
        <Card className="p-5 border-brand-200 bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Avance general del plan</p>
              <p className="text-[26px] font-bold text-brand-700 tabular-nums leading-none mt-1">{overallProgress}%</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Indicator label="Actividades" value={items.length} icon={<ClipboardList className="h-4 w-4" />} />
              <Indicator label="Completadas" value={completed} icon={<CheckCircle2 className="h-4 w-4" />} tone="brand" />
              <Indicator label="En proceso" value={inProgress} icon={<Activity className="h-4 w-4" />} tone="info" />
              <Indicator label="Comentarios" value={counts.comentarios} icon={<StickyNote className="h-4 w-4" />} />
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" showLabel />
        </Card>
      )}

      {/* Plan de Acción */}
      <Card padded={false} className="border-brand-100">
        <div className="p-5 border-b border-line-soft flex items-center justify-between gap-3 bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center"><ClipboardList className="h-4.5 w-4.5" /></div>
            <div>
              <h3 className="text-[15px] font-bold text-ink leading-tight">Plan de Acción</h3>
              <p className="text-[12px] text-ink-quiet">Enviado por Seguridad Operativa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!accepted && !isVerification && (
              <Button size="sm" onClick={() => s.acceptPlan(c.id)}>
                <Check className="h-4 w-4" /> Aceptar Plan
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => downloadPlan(c)}>
              <Download className="h-4 w-4" /> Descargar Plan
            </Button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
            <div><span className="text-ink-quiet">Código:</span> <span className="font-medium">{c.id}-PLA-01</span></div>
            <div><span className="text-ink-quiet">Elaborado por:</span> <span className="font-medium">{plan.elaboratedBy}</span></div>
            <div><span className="text-ink-quiet">Área responsable:</span> <span className="font-medium">{AREA_LABELS[c.assigneeArea ?? c.area]}</span></div>
          </div>

          <div className="pt-3 border-t border-line-soft">
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2.5">Actividades del plan</p>
            <div className="space-y-2">
              {plan.items.map((it, i) => (
                <div key={i} className="rounded-lg bg-surface border border-line p-3 text-sm cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all group" onClick={() => setSelectedActivity(it)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-brand-700">PLA-{String(i + 1).padStart(2, '0')}</span>
                    <span className={cn("text-[10.5px] font-semibold px-2 py-0.5 rounded-full border",
                      it.status === "completado" ? "bg-brand-50 text-brand-800 border-brand-200" : it.status === "en_progreso" ? "bg-info-soft text-info-ink border-info/20" : "bg-surface-2 text-ink-quiet border-line")}>
                      {it.status === "completado" ? "Finalizada" : it.status === "en_progreso" ? "En proceso" : "Pendiente"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-ink-quiet">Responsable:</span> {it.owner}</div>
                    <div><span className="text-ink-quiet">Tipo:</span> {(it as any).actionType || "Correctiva"}</div>
                    <div><span className="text-ink-quiet">Área:</span> {(it as any).area ? AREA_LABELS[(it as any).area as keyof typeof AREA_LABELS] || "—" : "—"}</div>
                    <div><span className="text-ink-quiet">Inicio:</span> {formatDate(it.startDate)}</div>
                    <div><span className="text-ink-quiet">Fin:</span> {formatDate(it.dueDate)}</div>
                  </div>
                  {it.description && <div className="mt-2 text-xs"><span className="text-ink-quiet">Descripción:</span> {it.description}</div>}
                  {/* Solicitud de ampliacion por actividad */}
                  {accepted && !isVerification && (
                    <div className="mt-3 pt-3 border-t border-line-soft">
                      {it.extensionRequest && !it.extensionRequest.decision ? (
                        <Card className="border-warning/30 bg-warning-soft">
                          <div className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="h-7 w-7 rounded-lg bg-warning text-white grid place-items-center shrink-0"><Timer className="h-3.5 w-3.5" /></div>
                              <div className="flex-1">
                                <p className="text-[11px] font-bold text-ink">Solicitud enviada</p>
                                <p className="text-[10px] text-ink-soft mt-0.5">
                                  Solicitada el {formatDate(it.extensionRequest.requestedAt)}. Nueva fecha: {formatDate(it.extensionRequest.nuevaFecha)}.
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setExtOpen(true)}>
                          <Timer className="h-3 w-3" /> Solicitar Ampliación
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Estado de verificación */}
      {isVerification && (
        <Card className="border-warning/30 bg-warning-soft">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning text-white grid place-items-center shrink-0"><Timer className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-ink">En Verificación</p>
                <p className="text-[12px] text-ink-soft mt-1">El plan está siendo verificado por Seguridad Operativa. Espere la decisión final.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Solicitar ampliación */}
      <ExtensionModal open={extOpen} onClose={() => setExtOpen(false)} caseId={c.id} />

    {/* Modal: Enviar a verificación */}
    <Modal
      open={sendOpen}
      onClose={() => setSendOpen(false)}
      title="Enviar plan para verificación"
      subtitle={`${c.id} · el expediente vuelve a Seguridad Operativa`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => setSendOpen(false)}>Cancelar</Button>
          <Button onClick={() => { s.completeExecution(c.id); setSendOpen(false); }}>
            <Send className="h-4 w-4" /> Confirmar envío
          </Button>
        </>
      }
    >
      <div className="rounded-lg bg-brand-50 border border-brand-200 p-3.5 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-brand-700 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-brand-800">
          Al enviar, el caso pasa a <span className="font-semibold">Pendiente de Verificación</span>. Se notificará a Seguridad Operativa y se enviará un correo confirmando la ejecución.
        </p>
      </div>
    </Modal>

    {/* Modal de detalle de actividad */}
    {selectedActivity && (
      <Modal
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        title={`Detalle de Actividad`}
        subtitle={`PLA-${selectedActivity ? String(items.indexOf(selectedActivity) + 1).padStart(2, '0') : '01'}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedActivity(null)}>Cerrar</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-ink-quiet">Responsable:</span> <span className="font-medium">{selectedActivity?.owner}</span></div>
            <div><span className="text-ink-quiet">Tipo:</span> <span className="font-medium">{(selectedActivity as any)?.actionType || "Correctiva"}</span></div>
            <div><span className="text-ink-quiet">Área:</span> {(selectedActivity as any)?.area ? AREA_LABELS[(selectedActivity as any).area as keyof typeof AREA_LABELS] || "—" : "—"}</div>
            <div><span className="text-ink-quiet">Estado:</span> <span className="font-medium">{selectedActivity?.status === "completado" ? "Finalizada" : selectedActivity?.status === "en_progreso" ? "En proceso" : "Pendiente"}</span></div>
            <div><span className="text-ink-quiet">Inicio:</span> <span className="font-medium">{formatDate(selectedActivity?.startDate || "")}</span></div>
            <div><span className="text-ink-quiet">Fin:</span> <span className="font-medium">{formatDate(selectedActivity?.dueDate || "")}</span></div>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Descripción</p>
            <p className="text-sm text-ink">{selectedActivity?.description || "—"}</p>
          </div>

          {/* Estado actual - solo si está aceptado */}
          {accepted && selectedActivity && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Estado actual</p>
              <div className="flex gap-2">
                {(["pendiente", "en_progreso", "completado"] as const).map((st) => (
                  <button 
                    key={st} 
                    onClick={() => {
                      setActivityStatus(st);
                      s.updateActionItem(c.id, selectedActivity.id, { status: st });
                    }}
                    className={cn("flex-1 h-9 rounded-lg text-[11.5px] font-medium transition-all",
                      activityStatus === st ? st === "completado" ? "bg-brand-700 text-white" : st === "en_progreso" ? "bg-info text-white" : "bg-surface-3 text-ink" : "bg-surface text-ink-soft hover:bg-surface-2")}>
                    {st === "completado" ? "Finalizada" : st === "en_progreso" ? "En proceso" : "Pendiente"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!accepted && (
            <div className="rounded-lg bg-info-soft border border-info/20 p-3">
              <p className="text-[12px] text-info-ink">
                Para editar el estado y el progreso de esta actividad, primero debe aceptar el Plan de Acción.
              </p>
            </div>
          )}

          {/* Porcentaje de avance - solo si está aceptado */}
          {accepted && selectedActivity && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Porcentaje de avance</p>
                <span className="text-[13px] tabular-nums font-semibold text-ink">{activityProgress}%</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={100} 
                step={10} 
                value={activityProgress} 
                onChange={(e) => {
                  setActivityProgress(Number(e.target.value));
                }} 
                className="w-full accent-brand-700" 
              />
              <Progress value={activityProgress} className="w-full mt-2" />
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => s.updateActionItem(c.id, selectedActivity.id, { progress: activityProgress })}
              >
                <Check className="h-4 w-4" /> Guardar porcentaje
              </Button>
            </div>
          )}

          {/* Comentarios - solo si está aceptado */}
          {accepted && selectedActivity && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Comentarios registrados</p>
              {selectedActivity.comments.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                  {selectedActivity.comments.map((cm, i) => (
                    <div key={i} className="rounded-md bg-surface p-2.5 text-[12px] text-ink-soft">{cm}</div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-ink-quiet mb-3">No hay comentarios registrados</p>
              )}
              <Textarea 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                rows={2} 
                placeholder="Agregar nuevo comentario…" 
                className="mb-2"
              />
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full" 
                disabled={!newComment.trim()}
                onClick={() => { 
                  if (newComment.trim()) { 
                    s.updateActionItem(c.id, selectedActivity.id, { comment: newComment.trim() }); 
                    setNewComment(""); 
                  } 
                }}
              >
                <StickyNote className="h-4 w-4" /> Agregar comentario
              </Button>
            </div>
          )}

          {/* Fecha de ejecución - solo si está aceptado */}
          {accepted && selectedActivity && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Fecha de ejecución</p>
              <Input 
                type="date" 
                value={executionDate} 
                onChange={(e) => setExecutionDate(e.target.value)} 
              />
            </div>
          )}

          {/* Adjuntar evidencias - solo si está aceptado */}
          {accepted && selectedActivity && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Adjuntar evidencias</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => addEvidence("foto")}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => addEvidence("video")}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => addEvidence("documento")}>
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-ink-quiet mt-2">Evidencias registradas: {c.evidence.filter((e) => e.kind === "foto").length} fotos, {c.evidence.filter((e) => e.kind === "video").length} videos, {c.evidence.filter((e) => e.kind === "documento").length} documentos</p>
            </div>
          )}

          {/* Historial de avances */}
          {c.execution?.updates && c.execution.updates.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Historial de avances</p>
              <div className="space-y-2">
                {c.execution.updates.map((upd, i) => (
                  <div key={i} className="rounded-md bg-surface p-3 text-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-ink">{upd.author}</span>
                      <span className="text-ink-quiet text-[11px]">{formatDate(upd.at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={upd.progress} className="w-[80px]" />
                      <span className="text-[11px] tabular-nums text-ink-quiet">{upd.progress}%</span>
                    </div>
                    {upd.comment && <p className="text-ink-soft mt-1">{upd.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    )}
    </div>
  );
}

/* ─── Panel lateral: registro de avances ─── */
function ActivityDrawer({ caseId, item, onClose }: { caseId: string; item: ActionItem; onClose: () => void }) {
  const s = useStore();
  const [progress, setProgress] = useState(item.progress);
  const [comment, setComment] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const addEv = (kind: Evidence["kind"]) => {
    const names: Record<typeof kind, [string, string]> = {
      foto: ["avance.jpg", "2.4 MB"], video: ["avance.mp4", "14.8 MB"], documento: ["avance.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    s.addExecutionEvidence(caseId, { id: `ev_${Math.random().toString(36).slice(2, 9)}`, kind, name: name.replace(/(\.\w+)$/, `_${Date.now() % 1000}$1`), size, at: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-[var(--shadow-pop)] animate-[riseUp_0.25s_ease-out] flex flex-col">
        <div className="p-5 border-b border-line-soft flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-ink-faint">Actividad</p>
            <h3 className="mt-1 text-[16px] font-bold text-ink leading-tight">{item.name}</h3>
            {item.description && <p className="text-[12px] text-ink-soft mt-1 leading-relaxed">{item.description}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 h-8 w-8 grid place-items-center rounded-lg text-ink-quiet hover:bg-surface-2 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface border border-line p-3 text-[12px]">
            <div><p className="text-ink-faint">Responsable</p><p className="text-ink font-medium mt-0.5">{item.owner}</p></div>
            <div><p className="text-ink-faint">Prioridad</p><p className="text-ink font-medium mt-0.5">{PRIORITY_LABELS[item.priority]}</p></div>
            <div><p className="text-ink-faint">Inicio</p><p className="text-ink font-medium mt-0.5">{formatDate(item.startDate)}</p></div>
            <div><p className="text-ink-faint">Límite</p><p className="text-ink font-medium mt-0.5">{formatDate(item.dueDate)}</p></div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Estado actual</p>
            <div className="flex gap-2">
              {(["pendiente", "en_progreso", "completado"] as const).map((st) => (
                <button key={st} onClick={() => s.updateActionItem(caseId, item.id, { status: st })}
                  className={cn("flex-1 h-9 rounded-lg text-[11.5px] font-medium transition-all",
                    item.status === st ? st === "completado" ? "bg-brand-700 text-white" : st === "en_progreso" ? "bg-info text-white" : "bg-surface-3 text-ink" : "bg-surface text-ink-soft hover:bg-surface-2")}>
                  {st === "completado" ? "Finalizada" : st === "en_progreso" ? "En proceso" : "Pendiente"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Porcentaje de avance</p>
              <span className="text-[13px] tabular-nums font-semibold text-ink">{progress}%</span>
            </div>
            <input type="range" min={0} max={100} step={10} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-brand-700" />
            <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => s.updateActionItem(caseId, item.id, { progress })}>
              <Check className="h-4 w-4" /> Guardar porcentaje
            </Button>
          </div>

          <Field label="Fecha de ejecución">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>

          <div>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Registrar comentario</p>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Describa el avance realizado…" />
            <Button size="sm" variant="secondary" className="w-full mt-2" disabled={!comment.trim()}
              onClick={() => { if (comment.trim()) { s.updateActionItem(caseId, item.id, { comment: comment.trim() }); setComment(""); } }}>
              <StickyNote className="h-4 w-4" /> Agregar comentario
            </Button>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Adjuntar evidencias</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => addEv("foto")}><ImageIcon className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => addEv("video")}><Video className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => addEv("documento")}><FileText className="h-4 w-4" /></Button>
            </div>
          </div>

          {item.comments.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Comentarios registrados</p>
              <div className="space-y-1.5">
                {item.comments.map((cm, i) => <div key={i} className="rounded-md bg-surface p-2.5 text-[12px] text-ink-soft">{cm}</div>)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-line-soft bg-surface/50">
          {item.status !== "completado" ? (
            <Button className="w-full" onClick={() => { s.updateActionItem(caseId, item.id, { status: "completado", progress: 100 }); onClose(); }}>
              <CheckCircle2 className="h-4 w-4" /> Marcar actividad como finalizada
            </Button>
          ) : (
            <div className="rounded-lg bg-brand-50 border border-brand-200 p-3 flex items-center gap-2 text-[12.5px] text-brand-800">
              <CheckCircle2 className="h-4 w-4" /> Actividad finalizada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="text-ink-faint shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] text-ink-faint">{label}</p>
        <p className="text-[12.5px] text-ink font-medium leading-snug mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

function Indicator({ label, value, icon, tone = "neutral" }: { label: string; value: number; icon: React.ReactNode; tone?: "neutral" | "brand" | "info" }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-7 w-7 rounded-lg grid place-items-center", tone === "brand" ? "bg-brand-50 text-brand-700" : tone === "info" ? "bg-info-soft text-info-ink" : "bg-surface-2 text-ink-soft")}>{icon}</span>
      <div>
        <p className="text-[15px] font-bold tabular-nums text-ink leading-none">{value}</p>
        <p className="text-[10.5px] text-ink-quiet mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function PlanMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="text-[13px] text-ink font-medium mt-0.5">{value}</p>
    </div>
  );
}

function EvStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-lg bg-surface p-2.5">
      <div className="flex items-center justify-center text-ink-soft">{icon}</div>
      <p className="text-[16px] font-bold tabular-nums text-ink mt-1">{value}</p>
      <p className="text-[10.5px] text-ink-quiet">{label}</p>
    </div>
  );
}

/* ─── Helpers ─── */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

/* ─── Descargar plan (PDF) ─── */
function downloadPlan(c: CaseFile) {
  if (!c.actionPlan) return;
  const plan = c.actionPlan;
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = plan.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(it.name)}</strong><br/><span style="color:#666;font-size:11px">${escapeHtml(it.description)}</span></td>
      <td>${escapeHtml(it.owner)}</td>
      <td>${formatDate(it.startDate)}</td>
      <td>${formatDate(it.dueDate)}</td>
      <td>${it.status === "completado" ? "Finalizada" : it.status === "en_progreso" ? "En proceso" : "Pendiente"}</td>
      <td>${it.progress}%</td>
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
    <div class="head"><div class="logo">S1</div><div><h1>Plan de Acción — SIGMA L1</h1><div style="color:#767f79;font-size:12px">Línea 1 del Metro de Lima · Seguridad Operativa</div></div></div>
    <h2>Información del expediente</h2>
    <div class="meta">
      <div><b>Código</b><br/>${c.id}</div>
      <div><b>Tipo de incidencia</b><br/>${EVENT_LABELS[c.type]}</div>
      <div><b>Estación</b><br/>${escapeHtml(c.station)}</div>
      <div><b>Área responsable</b><br/>${AREA_LABELS[c.assigneeArea ?? c.area]}</div>
      <div><b>Análisis de riesgo</b><br/>${RISK_LABELS[c.riskLevel]}</div>
      <div><b>Fecha límite</b><br/>${formatDate(c.slaDueDate)}</div>
    </div>
    <h2>Objetivo del Plan de Acción</h2>
    <p style="font-size:12.5px">${escapeHtml(plan.actionType)} — ${escapeHtml(plan.description)}</p>
    <div class="meta">
      <div><b>Elaborado por</b><br/>${escapeHtml(plan.elaboratedBy)}</div>
      <div><b>Fecha de creación</b><br/>${formatDate(plan.submittedAt ?? c.createdAt)}</div>
      <div><b>Prioridad del plan</b><br/>${PRIORITY_LABELS[plan.priority]}</div>
    </div>
    ${plan.observations ? `<h2>Observaciones generales</h2><p style="font-size:12.5px">${escapeHtml(plan.observations)}</p>` : ""}
    <h2>Actividades</h2>
    <table><thead><tr><th>#</th><th>Actividad</th><th>Responsable</th><th>Inicio</th><th>Límite</th><th>Estado</th><th>Avance</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="foot">Documento generado por SIGMA L1 · ${formatDateTime(new Date().toISOString())}</div>
    </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
