import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Plus,
  Save,
  ChevronDown,
  ChevronUp,
  Microscope,
  ClipboardList,
  MessageSquare,
  Paperclip,
  Check,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import { JefeShell } from "@/design-system/layout/JefeShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Pill, RiskPill, PriorityPill } from "@/design-system/primitives/Pill";
import { Progress } from "@/design-system/primitives/Progress";
import { formatDate } from "@/lib/utils";
import { AREA_LABELS, EVENT_LABELS } from "@/lib/types";

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">{label}</p>
      <p className="text-[13px] font-medium text-ink">{value ?? "—"}</p>
    </div>
  );
}

function SectionHeader({ icon, title, open, onToggle }: { icon: ReactNode; title: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between group text-left">
      <span className="flex items-center gap-2.5">
        <span className="grid place-items-center h-7 w-7 rounded-lg bg-surface-2 text-brand-700">{icon}</span>
        <h2 className="text-[14px] font-semibold text-ink group-hover:text-brand-700 transition-colors">{title}</h2>
      </span>
      <span className="text-ink-quiet">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
    </button>
  );
}

export function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const planIndex = parseInt(searchParams.get("plan") || "0");
  const activityId = searchParams.get("activity");
  const { cases, acceptPlan, requestExtension, updateActionItem, addExecutionEvidence, addPlanComment, completeExecution } = useStore();
  const c = cases.find((c) => c.id === id);
  const actionPlans = c?.actionPlans;
  const plan = actionPlans?.[planIndex];
  const item = activityId ? plan?.items.find(i => i.id === activityId) : plan?.items[0];
  
  // Estado para ediciones de actividades
  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});

  // Calcular progreso dinámicamente basado en las actividades del plan
  const calculateProgress = useCallback(() => {
    if (!plan || !plan.items || plan.items.length === 0) return 0;
    
    const totalItems = plan.items.length;
    const completedItems = plan.items.filter(item => item.status === "completado").length;
    const inProgressItems = plan.items.filter(item => item.status === "en_progreso").length;
    
    // Progreso basado en estado: completado = 100%, en_progreso = 50%, pendiente = 0%
    let totalProgress = 0;
    plan.items.forEach(item => {
      if (item.status === "completado") totalProgress += 100;
      else if (item.status === "en_progreso") totalProgress += 50;
      else totalProgress += 0;
    });
    
    return Math.round(totalProgress / totalItems);
  }, [plan]);

  const [progress, setProgress] = useState(calculateProgress());
  const [comment, setComment] = useState("");
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionData, setExtensionData] = useState({
    nuevaFecha: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    justificacion: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    caseInfo: true,
    activityDetail: true,
  });

  // Actualizar progreso cuando cambie el plan
  useEffect(() => {
    setProgress(calculateProgress());
  }, [plan, calculateProgress]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!c || !plan) {
    return (
      <JefeShell>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/jefe" className="p-2 hover:bg-surface-2 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-[20px] font-bold text-ink tracking-tight">Plan no encontrado</h1>
          </div>
          <Card padded={false} className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-critical mx-auto mb-4" />
            <p className="text-[13px] text-ink-soft">El plan de acción solicitado no existe.</p>
          </Card>
        </div>
      </JefeShell>
    );
  }

  const isAccepted = plan.reviewedAt;
  const isVerification = c.stage === "verificacion";
  const comments = item?.comments ?? [];
  const startDate = plan.startDate || item?.startDate || plan.reviewedAt;
  const dueDate = plan.dueDate ? new Date(plan.dueDate) : null;
  const overdue = dueDate !== null && !isNaN(dueDate.getTime()) && dueDate.getTime() < new Date().getTime();

  const canRequestExtension =
    extensionData.nuevaFecha.length > 0 &&
    extensionData.justificacion.trim().length > 0;

  const handleRequestExtension = () => {
    if (!canRequestExtension) return;
    requestExtension(c.id, {
      nuevaFecha: extensionData.nuevaFecha,
      justificacion: extensionData.justificacion.trim(),
    });
    setShowExtensionModal(false);
    setExtensionData({ nuevaFecha: extensionData.nuevaFecha, justificacion: "" });
  };

  const handleSaveChanges = () => {
    // Guardar descripciones editadas
    Object.entries(editingDescriptions).forEach(([itemId, description]) => {
      if (description.trim()) {
        updateActionItem(c.id, itemId, { comment: description.trim() });
      }
    });
    setEditingDescriptions({});
    window.history.back();
  };

  const handleCompletePlan = () => {
    completeExecution(c.id);
  };

  const allItemsComplete = plan?.items && plan.items.length > 0 && plan.items.every(item => item.status === "completado");

  return (
    <JefeShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/jefe" className="p-2 hover:bg-surface-2 rounded-xl text-ink-quiet hover:text-ink transition-all hover:shadow-sm" aria-label="Volver a mis planes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-bold text-ink tracking-tight">Detalle del Plan</h1>
                <Pill tone="neutral" className="uppercase">{c.id}</Pill>
              </div>
              <p className="text-[12px] text-ink-soft mt-1.5 flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-brand-700" />
                Plan {planIndex + 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExtensionModal(true)} className="hover:bg-surface-2 transition-colors">
              <Clock className="h-4 w-4 mr-2" /> Solicitar Prórroga
            </Button>
            <Pill tone={isVerification ? "warning" : isAccepted ? "brand" : "info"} dot>
              {isVerification ? "En proceso" : isAccepted ? "En proceso" : "Pendiente"}
            </Pill>
          </div>
        </div>

        {/* Información del Plan */}
        <Card padded={false} className="border-line-soft overflow-hidden shadow-sm">
          <div className="px-5 pt-4">
            <SectionHeader
              icon={<ClipboardList className="h-4 w-4" />}
              title="Información del Plan"
              open={expandedSections.caseInfo}
              onToggle={() => toggleSection("caseInfo")}
            />
          </div>
          {expandedSections.caseInfo && (
            <div className="px-5 pt-4 pb-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                {plan.planCode && (
                  <InfoRow label="Código del Plan" value={plan.planCode} />
                )}
                {plan.actionType && plan.actionType !== "—" && (
                  <InfoRow label="Tipo" value={plan.actionType} />
                )}
                {plan.elaboratedBy && (
                  <InfoRow label="Elaborado por" value={plan.elaboratedBy} />
                )}
                {plan.sentToArea && (
                  <InfoRow label="Área responsable" value={AREA_LABELS[plan.sentToArea as keyof typeof AREA_LABELS]} />
                )}
                {plan.startDate && (
                  <InfoRow label="Inicio" value={formatDate(plan.startDate)} />
                )}
                {plan.dueDate && plan.dueDate !== "—" && (
                  <InfoRow
                    label="Fin"
                    value={overdue ? <span className="inline-flex items-center gap-1.5 font-semibold text-critical"><AlertCircle className="h-3.5 w-3.5" /> {formatDate(plan.dueDate)}</span> : formatDate(plan.dueDate)}
                  />
                )}
                {plan.estimatedTime && plan.estimatedTime !== "—" && (
                  <InfoRow label="Tiempo estimado" value={plan.estimatedTime} />
                )}
                {plan.priority && (
                  <InfoRow label="Prioridad" value={<PriorityPill priority={plan.priority} />} />
                )}
                {plan.reviewDecision && (
                  <InfoRow label="Estado de revisión" value={
                    <Pill tone={plan.reviewDecision === "aprobado" ? "brand" : plan.reviewDecision === "rechazado" ? "critical" : "warning"} dot>
                      {plan.reviewDecision === "aprobado" ? "Aprobado" : plan.reviewDecision === "rechazado" ? "Rechazado" : "Pendiente"}
                    </Pill>
                  } />
                )}
                {plan.secondResponsible && (
                  <InfoRow label="Responsable" value={plan.secondResponsible} />
                )}
                {!plan.secondResponsible && plan.items && plan.items.length > 0 && plan.items[0].owner && (
                  <InfoRow label="Responsable" value={plan.items[0].owner} />
                )}
                {plan.submittedAt && (
                  <InfoRow label="Fecha de envío" value={formatDate(plan.submittedAt)} />
                )}
                {plan.planDate && (
                  <InfoRow label="Fecha del plan" value={formatDate(plan.planDate)} />
                )}
                {plan.scheduledDate && (
                  <InfoRow label="Fecha programada" value={formatDate(plan.scheduledDate)} />
                )}
                {plan.planStatus && (
                  <InfoRow label="Estado del plan" value={
                    <Pill tone={plan.planStatus === "cerrado" ? "brand" : "info"} dot>
                      {plan.planStatus === "cerrado" ? "Cerrado" : "Pendiente"}
                    </Pill>
                  } />
                )}
              </div>

              {/* Nota de revisión */}
              {plan.reviewNote && plan.reviewNote !== "—" && (
                <div className="rounded-xl bg-surface p-3.5 border border-line-soft">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Nota de revisión</p>
                  <p className="text-[12.5px] text-ink leading-relaxed">{plan.reviewNote}</p>
                </div>
              )}

              {/* Anexos */}
              {plan.annexes && plan.annexes !== "—" && (
                <div className="rounded-xl bg-surface p-3.5 border border-line-soft">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Anexos</p>
                  <p className="text-[12.5px] text-ink leading-relaxed">{plan.annexes}</p>
                </div>
              )}

              {/* Investigación */}
              {c.investigation && (
                <div className="mt-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="grid place-items-center h-7 w-7 rounded-lg bg-surface-2 text-brand-700">
                      <Microscope className="h-4 w-4" />
                    </span>
                    <h2 className="text-[14px] font-semibold text-ink">Investigación</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {c.investigation.rootCause && (
                      <div className="rounded-xl bg-surface p-3.5 border border-line-soft">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Causa raíz</p>
                        <p className="text-[12.5px] text-ink leading-relaxed">{c.investigation.rootCause}</p>
                      </div>
                    )}
                    {c.investigation.technicalDescription && c.investigation.technicalDescription !== "—" && (
                      <div className="rounded-xl bg-surface p-3.5 border border-line-soft">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Descripción técnica</p>
                        <p className="text-[12.5px] text-ink leading-relaxed">{c.investigation.technicalDescription}</p>
                      </div>
                    )}
                    {c.investigation.findings && c.investigation.findings !== "—" && (
                      <div className="rounded-xl bg-surface p-3.5 border border-line-soft sm:col-span-2">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Hallazgos</p>
                        <p className="text-[12.5px] text-ink leading-relaxed">{c.investigation.findings}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actividades del plan */}
              <div className="mt-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="grid place-items-center h-7 w-7 rounded-lg bg-surface-2 text-brand-700">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <h2 className="text-[14px] font-semibold text-ink">Actividades del plan</h2>
                </div>
                <div className="space-y-3">
                  {plan?.items?.map((activity, idx) => (
                    <div key={activity.id} className="rounded-xl bg-surface p-3.5 border border-line-soft">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold text-ink-faint">Actividad #{idx + 1}</p>
                        <Pill tone={activity.status === "completado" ? "brand" : activity.status === "en_progreso" ? "info" : "neutral"} dot>
                          {activity.status === "completado" ? "Finalizada" : activity.status === "en_progreso" ? "En proceso" : "Pendiente"}
                        </Pill>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Responsable</p>
                          <p className="text-[12.5px] text-ink leading-relaxed">{activity.owner}</p>
                        </div>
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Área</p>
                          <p className="text-[12.5px] text-ink leading-relaxed">{activity.area ? AREA_LABELS[activity.area as keyof typeof AREA_LABELS] : "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Prioridad</p>
                          <p className="text-[12.5px] text-ink leading-relaxed">{activity.priority || "media"}</p>
                        </div>
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Inicio</p>
                          <p className="text-[12.5px] text-ink leading-relaxed">{formatDate(activity.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Fin</p>
                          <p className="text-[12.5px] text-ink leading-relaxed">{formatDate(activity.dueDate)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Descripción</p>
                        <textarea
                          value={editingDescriptions[activity.id] || activity.description}
                          onChange={(e) => setEditingDescriptions(prev => ({ ...prev, [activity.id]: e.target.value }))}
                          className="w-full text-[12.5px] px-3 py-2 rounded-lg border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all resize-none"
                          rows={2}
                          placeholder="Descripción de la actividad..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {plan.observations && plan.observations !== "—" && (
                <div className="rounded-xl bg-surface p-3.5 border border-line-soft">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Observaciones</p>
                  <p className="text-[12.5px] text-ink leading-relaxed">{plan.observations}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Comentarios del Jefe de Área */}
        <Card padded={false} className="border-line-soft overflow-hidden shadow-sm">
          <div className="px-5 pt-4">
            <SectionHeader
              icon={<MessageSquare className="h-4 w-4" />}
              title="Comentarios de Ejecución"
              open={expandedSections.activityDetail}
              onToggle={() => toggleSection("activityDetail")}
            />
          </div>
          {expandedSections.activityDetail && (
            <div className="px-5 pt-4 pb-5 space-y-5">
              {/* Comentarios de texto */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2.5">
                  Comentarios de ejecución
                  {plan?.comments && plan.comments.length > 0 && <span className="ml-1.5 text-ink-quiet">({plan.comments.length})</span>}
                </p>
                <div className="space-y-2 mb-3">
                  {plan?.comments && plan.comments.length > 0 ? (
                    plan.comments.map((comment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-3 text-ink-quiet">
                          <MessageSquare className="h-4 w-4" />
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
                  <Button size="sm" onClick={() => { 
                    if (comment.trim()) { 
                      addPlanComment(c.id, planIndex, comment.trim());
                      setComment(""); 
                    }
                  }} className="bg-brand-700 hover:bg-brand-800 transition-colors">
                    <Plus className="h-3 w-3 mr-1" /> Agregar
                  </Button>
                </div>
              </div>

              {/* Evidencias de archivos */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-2.5">
                  Evidencias de ejecución
                  {c.evidence && c.evidence.filter(e => e.kind !== "documento" || e.size !== "0 KB").length > 0 && <span className="ml-1.5 text-ink-quiet">({c.evidence.filter(e => e.kind !== "documento" || e.size !== "0 KB").length})</span>}
                </p>
                <div className="space-y-2 mb-3">
                  {c.evidence && c.evidence.filter(e => e.kind !== "documento" || e.size !== "0 KB").length > 0 ? (
                    c.evidence.filter(e => e.kind !== "documento" || e.size !== "0 KB").map((ev, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-3 text-ink-quiet">
                          {ev.kind === "foto" ? <ImageIcon className="h-4 w-4" /> : ev.kind === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium text-ink truncate">{ev.name}</p>
                          <p className="text-[11px] text-ink-quiet">{ev.size}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12.5px] text-ink-quiet bg-surface rounded-lg p-3 border border-dashed border-line">No hay evidencias registradas</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => {
                    const evidence = {
                      id: uid("ev"),
                      name: "Foto de evidencia",
                      kind: "foto" as const,
                      size: "2.4 MB",
                      at: new Date().toISOString()
                    };
                    addExecutionEvidence(c.id, evidence);
                  }} className="hover:bg-surface-2 transition-colors">
                    <Upload className="h-3 w-3 mr-1" /> Agregar Foto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const evidence = {
                      id: uid("ev"),
                      name: "Video de evidencia",
                      kind: "video" as const,
                      size: "15.2 MB",
                      at: new Date().toISOString()
                    };
                    addExecutionEvidence(c.id, evidence);
                  }} className="hover:bg-surface-2 transition-colors">
                    <Upload className="h-3 w-3 mr-1" /> Agregar Video
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const evidence = {
                      id: uid("ev"),
                      name: "Documento de evidencia",
                      kind: "documento" as const,
                      size: "1.8 MB",
                      at: new Date().toISOString()
                    };
                    addExecutionEvidence(c.id, evidence);
                  }} className="hover:bg-surface-2 transition-colors">
                    <Upload className="h-3 w-3 mr-1" /> Agregar Documento
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isAccepted && !isVerification && (
            <Button onClick={() => acceptPlan(c.id)} className="flex-1 bg-brand-700 hover:bg-brand-800 transition-colors" size="lg">
              <Check className="h-4 w-4 mr-2" /> Aceptar Plan
            </Button>
          )}
          <Button variant="outline" className="flex-1 hover:bg-surface-2 transition-colors" size="lg" onClick={handleSaveChanges}>
            <Save className="h-4 w-4 mr-2" /> Guardar cambios
          </Button>
          {allItemsComplete && isAccepted && (
            <Button onClick={handleCompletePlan} className="flex-1 bg-success hover:bg-success/90 transition-colors text-white" size="lg">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Completar Plan
            </Button>
          )}
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full animate-in zoom-in duration-200">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-2 text-brand-700">
                <Clock className="h-4 w-4" />
              </span>
              <h3 className="text-[16px] font-semibold text-ink">Solicitar Prórroga</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5 block">Nueva fecha</label>
                <input
                  type="date"
                  value={extensionData.nuevaFecha}
                  onChange={(e) => setExtensionData({ ...extensionData, nuevaFecha: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg text-[12.5px] bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-1.5 block">Justificación</label>
                <textarea
                  value={extensionData.justificacion}
                  onChange={(e) => setExtensionData({ ...extensionData, justificacion: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg text-[12.5px] bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 h-24 resize-none transition-all"
                  placeholder="Justificación de la solicitud"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowExtensionModal(false)} className="flex-1 hover:bg-surface-2 transition-colors">
                Cancelar
              </Button>
              <Button onClick={handleRequestExtension} className="flex-1 bg-brand-700 hover:bg-brand-800 transition-colors" disabled={!canRequestExtension}>
                Enviar Solicitud
              </Button>
            </div>
          </div>
        </div>
      )}
    </JefeShell>
  );
}
