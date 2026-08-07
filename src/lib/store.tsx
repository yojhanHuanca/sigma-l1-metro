import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AREA_HEADS,
  AREA_LABELS,
  type ActionItem,
  type Area,
  type CaseFile,
  type Evidence,
  type ImplicationType,
  type InvolvedWorker,
  type Investigation,
  type LaborState,
  type Notification,
  type Priority,
  type Role,
  type Stage,
  type SyncLog,
  type SystemRole,
  type TimelineEvent,
  type User,
  type UserRole,
  type RiskLevel,
  type ActivityComment,
  slaDaysFor,
  riskCategory,
  slaDaysForRisk,
} from "./types";
import { SEED_CASES, SEED_NOTIFICATIONS } from "./seed";
import { SEED_USERS, SEED_SYNC_LOGS, NEW_USERS_FROM_EXCEL } from "./seedUsers";
import { caseCodeFromSeq, nowISO, uid } from "./utils";

const CASES_KEY = "sigma_l1_cases_v4";
const NOTIF_KEY = "sigma_l1_notif_v4";
const ROLE_KEY = "sigma_l1_role_v1";
const SEQ_KEY = "sigma_l1_seq_v4";
const USERS_KEY = "sigma_l1_users_v3";
const SYNC_KEY = "sigma_l1_sync_v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadCases(): CaseFile[] {
  const raw = load<CaseFile[] | null>(CASES_KEY, null);
  if (!raw || !Array.isArray(raw) || raw.length === 0) return SEED_CASES;
  const first = raw[0];
  // Limpiar formatos muy viejos (CASO- o EXP-)
  if (first && typeof first.id === "string" && (first.id.startsWith("CASO-") || first.id.startsWith("EXP-"))) {
    try { localStorage.removeItem(CASES_KEY); localStorage.removeItem(SEQ_KEY); } catch { /* ignore */ }
    return SEED_CASES;
  }
  // Migrar prioridad → riskLevel si falta
  const prioToRisk: Record<string, RiskLevel> = {
    critica: "1A", alta: "2C", media: "3C", baja: "4C",
  };
  // Migrate old stages to new 7-stage flow
  const stageMap: Record<string, Stage> = {
    nuevo: "recepcion",
    en_revision: "recepcion",
    pendiente_info: "pendiente_info",
    derivado: "investigacion",
    en_investigacion: "investigacion",
    plan_accion: "plan_accion",
    en_ejecucion: "ejecucion",
    seguimiento: "verificacion",
    cerrado: "cierre",
    rechazado: "rechazado",
  };
  return raw.map((c) => ({
    ...c,
    stage: stageMap[c.stage] ?? c.stage,
    riskLevel: c.riskLevel ?? prioToRisk[c.priority] ?? "3C",
    actionPlans: c.actionPlans
      ? c.actionPlans.map((plan) => ({
          ...plan,
          elaboratedBy: plan.elaboratedBy ?? "Seguridad Operativa",
          actionType: plan.actionType ?? "Correctiva",
          description: plan.description ?? "",
          startDate: plan.startDate ?? (c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
          estimatedTime: plan.estimatedTime ?? "7 días",
          priority: plan.priority ?? c.priority,
          observations: plan.observations ?? "",
          sentToArea: plan.sentToArea ?? c.assigneeArea ?? c.area,
          reviewDecision: plan.reviewDecision,
          items: plan.items.map((it: any) => ({
            ...it,
            name: it.name ?? it.description ?? "Actividad",
            priority: it.priority ?? "media",
            startDate: it.startDate ?? (c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
            comments: Array.isArray(it.comments) && it.comments.length > 0 && typeof it.comments[0] === 'string' 
              ? it.comments.map((comment: string, idx: number) => ({
                  id: `comment_${it.id}_${idx}`,
                  text: comment,
                  author: c.assignee ?? "Jefe de Área",
                  at: new Date().toISOString()
                }))
              : it.comments ?? [],
          })),
        }))
      : (c as any).actionPlan
      ? [{
          ...(c as any).actionPlan,
          elaboratedBy: (c as any).actionPlan.elaboratedBy ?? "Seguridad Operativa",
          actionType: (c as any).actionPlan.actionType ?? "Correctiva",
          description: (c as any).actionPlan.description ?? "",
          startDate: (c as any).actionPlan.startDate ?? (c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
          estimatedTime: (c as any).actionPlan.estimatedTime ?? "7 días",
          priority: (c as any).actionPlan.priority ?? c.priority,
          observations: (c as any).actionPlan.observations ?? "",
          sentToArea: (c as any).actionPlan.sentToArea ?? c.assigneeArea ?? c.area,
          reviewDecision: (c as any).actionPlan.reviewDecision,
          items: (c as any).actionPlan.items.map((it: any) => ({
            ...it,
            name: it.name ?? it.description ?? "Actividad",
            priority: it.priority ?? "media",
            startDate: it.startDate ?? (c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
            comments: Array.isArray(it.comments) && it.comments.length > 0 && typeof it.comments[0] === 'string' 
              ? it.comments.map((comment: string, idx: number) => ({
                  id: `comment_${it.id}_${idx}`,
                  text: comment,
                  author: c.assignee ?? "Jefe de Área",
                  at: new Date().toISOString()
                }))
              : it.comments ?? [],
          }))
        }]
      : c.actionPlans,
    investigation: c.investigation
      ? { ...c.investigation, technicalDescription: c.investigation.technicalDescription ?? "" }
      : c.investigation,
  }));
}

function loadNotifs(): Notification[] {
  const raw = load<Notification[] | null>(NOTIF_KEY, null);
  if (!raw || !Array.isArray(raw)) return SEED_NOTIFICATIONS;
  return raw;
}

function loadUsers(): User[] {
  const raw = load<User[] | null>(USERS_KEY, null);
  if (!raw || !Array.isArray(raw) || raw.length === 0) return SEED_USERS;
  // Migrar usuarios viejos sin los campos nuevos
  return raw.map((u) => {
    const parts = (u.name ?? "").split(" ");
    const firstName = u.firstName ?? parts[0] ?? "";
    const lastName = u.lastName ?? parts.slice(1).join(" ") ?? "";
    return {
      ...u,
      dni: u.dni ?? "00000000",
      firstName,
      lastName,
      systemRole: u.systemRole ?? (u.userRole as SystemRole) ?? "consulta",
      cargoType: u.cargoType ?? "tecnico",
      laborState: u.laborState ?? "activo",
      turno: u.turno ?? "mañana",
      contractType: u.contractType ?? "indefinido",
      sede: u.sede ?? "Centro de Control",
      subarea: u.subarea ?? "General",
      roles: u.roles ?? [{ role: (u.systemRole ?? "consulta") as SystemRole, assignedBy: "Sistema", assignedAt: u.hiredAt }],
      workHistory: u.workHistory ?? [{ id: `wh_alta_${u.code}`, at: u.hiredAt, field: "alta", oldValue: "—", newValue: "Ingreso a la empresa", source: "excel" as const }],
      activity: u.activity ?? [],
      lastSyncBy: u.lastSyncBy ?? "Sistema",
      lastAccessAt: u.lastAccessAt ?? new Date().toISOString(),
    };
  });
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export interface NewReportInput {
  type: CaseFile["type"];
  title: string;
  description: string;
  observations: string;
  area: Area;
  station: string;
  location: string;
  date: string;
  time: string;
  priority: CaseFile["priority"];
  riskLevel: CaseFile["riskLevel"];
  evidence: Evidence[];
  reporter: string;
  anonymous?: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface EvaluationInput {
  gravity: "critica" | "alta" | "media" | "baja";
  riskLevel: RiskLevel;
  classification: string;
  requiresInvestigation: boolean;
  observations: string;
  danger: string;
  consequence: string;
}

interface ActionPlanInput {
  elaboratedBy: string;
  actionType: string;
  description: string;
  startDate: string;
  dueDate: string;
  estimatedTime: string;
  priority: Priority;
  observations: string;
  items: { description: string; owner: string; priority: Priority; startDate: string; dueDate: string; actionType: string; area: Area }[];
  sentToArea: Area;
  planCode?: string;
  planStatus?: "pendiente" | "cerrado";
  planDate?: string;
  scheduledDate?: string;
  annexes?: string;
  secondResponsible?: string;
}

interface ExtensionInput {
  nuevaFecha: string;
  justificacion: string;
}

interface StoreValue {
  cases: CaseFile[];
  notifications: Notification[];
  role: Role | null;
  setRole: (role: Role | null) => void;
  currentUser: { name: string; role: Role; initials: string; email: string; area?: Area };
  jefeArea: Area;
  setJefeArea: (area: Area) => void;

  // Reportante
  createReport: (input: NewReportInput) => CaseFile;
  respondInfoRequest: (caseId: string, response: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ETAPA 1 — Recepción y Revisión (SO)
  approveCase: (caseId: string) => void;
  rejectCase: (caseId: string, reason: string) => void;
  requestInfo: (caseId: string, question: string) => void;
  addReviewObservation: (caseId: string, note: string) => void;

  // ETAPA 2 — Evaluación (SO)
  saveEvaluation: (caseId: string, ev: EvaluationInput) => void;
  sendToInvestigation: (caseId: string) => void;
  setInvestigator: (caseId: string, name: string) => void;

  // ETAPA 3 — Investigación (SO)
  saveInvestigation: (caseId: string, inv: Investigation) => void;
  addInvestigationEvidence: (caseId: string, evidence: Evidence) => void;

  // ETAPA 4 — Plan de Acción (SO)
  submitActionPlan: (caseId: string, plan: ActionPlanInput) => void;
  reviewActionPlan: (caseId: string, decision: "aprobado" | "rechazado", note?: string) => void;
  verifyActionPlan: (caseId: string, planIndex: number, decision: "aprobado" | "rechazado" | "pendiente", note?: string) => void;
  addPlanComment: (caseId: string, planIndex: number, text: string) => void;
  startExecution: (caseId: string) => void;

  // ETAPA 5 — Ejecución (jefe del área)
  acceptPlan: (caseId: string) => void;
  requestExtension: (caseId: string, ext: ExtensionInput) => void;
  reviewExtension: (caseId: string, decision: "aprobada" | "rechazada", note?: string, newDate?: string) => void;
  updateActionItem: (caseId: string, itemId: string, patch: { status?: ActionItem["status"]; progress?: number; comment?: string }) => void;
  addExecutionEvidence: (caseId: string, evidence: Evidence) => void;
  completeExecution: (caseId: string) => void;

  // ETAPA 6 — Verificación (SO)
  addVerificationNote: (caseId: string, note: string) => void;

  // ETAPA 7 — Cierre (SO)
  closeCase: (caseId: string, note?: string) => void;
  keepPending: (caseId: string) => void;
  reopenCase: (caseId: string) => void;
  reopenCaseWithReason: (caseId: string, targetStage: Stage, reason: string) => void;
  moveToStageWithoutTimeline: (caseId: string, targetStage: Stage) => void;

  // Generales
  addTimelineComment: (caseId: string, comment: string) => void;
  notifySanction: (caseId: string, area: Area, sanction: string) => void;

  // Administración de Usuarios
  users: User[];
  syncLogs: SyncLog[];
  syncFromExcel: () => Promise<{ newCount: number; updatedCount: number; deactivatedCount: number; durationSec: number }>;
  assignUserRole: (userId: string, role: UserRole) => void;
  deactivateUser: (userId: string) => void;
  searchWorkers: (query: string) => User[];

  // Investigación — Trabajadores involucrados
  addInvolvedWorker: (caseId: string, user: User, implication: ImplicationType) => void;
  removeInvolvedWorker: (caseId: string, workerId: string) => void;
  updateInvolvedWorker: (caseId: string, workerId: string, patch: { implication?: ImplicationType; statement?: string; observations?: string }) => void;
  reassignResponsible: (caseId: string, newAssignee: string, newArea: Area, motivo: string) => void;

  getCase: (id: string) => CaseFile | undefined;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const SAFETY_USER = { name: "Antonio Rebaza Lizaraso", role: "seguridad" as Role, initials: "AR", email: "a.rebaza@metrolinea1.pe" };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseFile[]>(() => loadCases());
  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotifs());
  const [role, setRoleState] = useState<Role | null>(() => load<Role | null>(ROLE_KEY, null));
  const [seq, setSeq] = useState<number>(() => load(SEQ_KEY, 15));
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => load<SyncLog[]>(SYNC_KEY, SEED_SYNC_LOGS));
  const [jefeArea, setJefeAreaState] = useState<Area>(() => load<Area>("jefeArea", "mantenimiento"));

  useEffect(() => save(CASES_KEY, cases), [cases]);
  useEffect(() => save(NOTIF_KEY, notifications), [notifications]);
  useEffect(() => save(ROLE_KEY, role), [role]);
  useEffect(() => save(SEQ_KEY, seq), [seq]);
  useEffect(() => save(USERS_KEY, users), [users]);
  useEffect(() => save(SYNC_KEY, syncLogs), [syncLogs]);
  useEffect(() => save("jefeArea", jefeArea), [jefeArea]);

  const pushNotification = useCallback(
    (n: Omit<Notification, "id" | "at" | "read"> & { at?: string }) => {
      setNotifications((prev) => [
        { id: uid("nt"), at: n.at ?? nowISO(), read: false, ...n },
        ...prev,
      ]);
    },
    []
  );

  const mutate = useCallback(
    (id: string, fn: (c: CaseFile) => CaseFile) => {
      setCases((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
    },
    []
  );

  const pushTimeline = (c: CaseFile, ev: Omit<TimelineEvent, "id" | "at">): CaseFile => ({
    ...c,
    timeline: [...c.timeline, { id: uid("ev"), at: nowISO(), ...ev }],
  });

  const setRole = useCallback((r: Role | null) => setRoleState(r), []);
  const setJefeArea = useCallback((area: Area) => setJefeAreaState(area), []);

  const currentUser = useMemo(() => {
    if (role === "reportante") {
      return { name: "Carlos Núñez", role: "reportante" as Role, initials: "CN", email: "c.nunez@metrolinea1.pe" };
    }
    if (role === "jefe") {
      return { name: AREA_HEADS[jefeArea], role: "jefe" as Role, initials: "JA", email: "jefe@metrolinea1.pe", area: jefeArea };
    }
    return SAFETY_USER;
  }, [role, jefeArea]);

  // ─── Reportante ─────────────────────────────────────────────────────
  const createReport = useCallback(
    (input: NewReportInput): CaseFile => {
      const nextSeq = seq + 1;
      setSeq(nextSeq);
      const id = caseCodeFromSeq(nextSeq);
      const sla = new Date();
      sla.setDate(sla.getDate() + slaDaysForRisk(input.riskLevel));
      const newCase: CaseFile = {
        id,
        type: input.type,
        title: input.title,
        description: input.description,
        observations: input.observations,
        area: input.area,
        station: input.station,
        location: input.location,
        date: input.date,
        time: input.time,
        priority: input.priority,
        riskLevel: input.riskLevel,
        stage: "recepcion",
        reporter: input.reporter,
        reporterRole: "reportante",
        evidence: input.evidence,
        timeline: [
          {
            id: uid("ev"),
            kind: "creado",
            at: nowISO(),
            actor: input.reporter,
            actorRole: "reportante",
            title: "Reporte registrado por trabajador",
            detail: `SOP ${id} creado. Enviado a la bandeja de Seguridad Operativa.`,
          },
        ],
        slaDueDate: sla.toISOString(),
        createdAt: nowISO(),
      };
      setCases((prev) => [newCase, ...prev]);
      pushNotification({
        caseId: id,
        title: "Nuevo SOP en bandeja",
        body: `${id} · ${input.title}`,
        audience: "seguridad",
        kind: riskCategory(input.riskLevel) === "inaceptable" ? "critical" : "info",
      });
      return newCase;
    },
    [seq, pushNotification]
  );

  // ─── ETAPA 1 — Recepción y Revisión (SO) ────────────────────────────
  const approveCase = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "evaluacion" },
          {
            kind: "aprobado",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: "Reporte aprobado — pasa a Evaluación",
            detail: "Seguridad Operativa aprobó el reporte. Inicia el análisis del caso.",
          }
        )
      );
      pushNotification({ caseId, title: "Reporte aprobado", body: `${caseId} aprobado por Seguridad Operativa.`, audience: "both", kind: "success" });
    },
    [mutate, pushNotification]
  );

  const rejectCase = useCallback(
    (caseId: string, reason: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "rechazado", closedAt: nowISO() },
          { kind: "rechazado", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Reporte rechazado", detail: reason }
        )
      );
      pushNotification({ caseId, title: "Reporte rechazado", body: `${caseId} fue rechazado por Seguridad Operativa.`, audience: "both", kind: "warning" });
    },
    [mutate, pushNotification]
  );

  const requestInfo = useCallback(
    (caseId: string, question: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, pendingInfoRequest: { question, requestedAt: nowISO() } },
          { kind: "info_solicitada", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Información solicitada al reportante", detail: question }
        )
      );
      pushNotification({ caseId, title: "Información solicitada", body: `${caseId} · responde la solicitud para continuar.`, audience: "reportante", kind: "warning" });
    },
    [mutate, pushNotification]
  );

  const addReviewObservation = useCallback(
    (caseId: string, note: string) => {
      mutate(caseId, (c) =>
        pushTimeline(c, { kind: "comentario", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Observación de revisión registrada", detail: note })
      );
    },
    [mutate]
  );

  // ─── ETAPA 2 — Evaluación (SO) ──────────────────────────────────────
  const saveEvaluation = useCallback(
    (caseId: string, ev: EvaluationInput) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: ev.requiresInvestigation ? "investigacion" : "plan_accion", priority: ev.gravity, riskLevel: ev.riskLevel, evaluation: { ...ev, updatedAt: nowISO() } },
          {
            kind: "comentario",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: `Evaluación registrada — riesgo ${ev.riskLevel}`,
            detail: `Clasificación: ${ev.classification}. Requiere investigación: ${ev.requiresInvestigation ? "Sí" : "No"}.${ev.observations ? ` Obs: ${ev.observations}` : ""}`,
          }
        )
      );
      pushNotification({
        caseId,
        title: ev.requiresInvestigation ? "Caso en investigación" : "Caso pasado a Plan de Acción",
        body: `${caseId} · evaluación completada por Seguridad Operativa.`,
        audience: "seguridad",
        kind: "info",
      });
    },
    [mutate, pushNotification]
  );

  const sendToInvestigation = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) =>
        pushTimeline({ ...c, stage: "investigacion" }, { kind: "investigacion", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Caso enviado a Investigación" })
      );
    },
    [mutate]
  );

  const setInvestigator = useCallback(
    (caseId: string, name: string) => {
      mutate(caseId, (c) => ({ ...c, investigator: name }));
    },
    [mutate]
  );

  // ─── ETAPA 3 — Investigación (SO) ───────────────────────────────────
  const saveInvestigation = useCallback(
    (caseId: string, inv: Investigation) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "plan_accion", investigation: { ...inv, updatedAt: nowISO() } },
          { kind: "investigacion", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Investigación registrada por Seguridad Operativa", detail: `Causa raíz: ${inv.rootCause.slice(0, 80)}. Pasa a Plan de Acción.` }
        )
      );
      pushNotification({ caseId, title: "Investigación registrada", body: `${caseId} · investigación completada por SO. Listo para Plan de Acción.`, audience: "seguridad", kind: "info" });
    },
    [mutate, pushNotification]
  );

  const addInvestigationEvidence = useCallback(
    (caseId: string, evidence: Evidence) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, evidence: [...c.evidence, evidence] },
          { kind: "investigacion", actor: SAFETY_USER.name, actorRole: "seguridad", title: `Evidencia de investigación adjuntada — ${evidence.name}`, detail: `${evidence.kind} · ${evidence.size}` }
        )
      );
    },
    [mutate]
  );

  // ─── ETAPA 4 — Plan de Acción (SO) ──────────────────────────────────
  const submitActionPlan = useCallback(
    (caseId: string, plan: ActionPlanInput) => {
      const head = AREA_HEADS[plan.sentToArea];
      mutate(caseId, (c) =>
        pushTimeline(
          {
            ...c,
            stage: "plan_accion",
            assignee: head,
            assigneeArea: plan.sentToArea,
            actionPlans: c.actionPlans && c.actionPlans.length > 0
              ? c.actionPlans.map((existingPlan, index) => 
                  index === c.actionPlans!.length - 1 
                    ? {
                        ...existingPlan,
                        elaboratedBy: plan.elaboratedBy,
                        actionType: plan.actionType,
                        description: plan.description,
                        startDate: plan.startDate,
                        dueDate: plan.dueDate,
                        estimatedTime: plan.estimatedTime,
                        priority: plan.priority,
                        observations: plan.observations,
                        items: plan.items.map((it, idx) => {
                          const existingItem = existingPlan.items[idx];
                          return {
                            id: existingItem?.id || uid("ai"),
                            name: existingItem?.name || `Actividad`,
                            description: it.description,
                            owner: it.owner,
                            priority: it.priority,
                            startDate: it.startDate,
                            dueDate: it.dueDate,
                            progress: existingItem?.progress || 0,
                            status: existingItem?.status || "pendiente" as const,
                            comments: existingItem?.comments || [] as ActivityComment[],
                          };
                        }),
                        submittedAt: nowISO(),
                        sentToArea: plan.sentToArea,
                        planCode: plan.planCode || existingPlan.planCode,
                        planStatus: plan.planStatus || existingPlan.planStatus,
                        planDate: plan.planDate || existingPlan.planDate,
                        scheduledDate: plan.scheduledDate || existingPlan.scheduledDate,
                        annexes: plan.annexes || existingPlan.annexes,
                        secondResponsible: plan.secondResponsible || existingPlan.secondResponsible,
                      }
                    : existingPlan
                )
              : [{
                  elaboratedBy: plan.elaboratedBy,
                  actionType: plan.actionType,
                  description: plan.description,
                  startDate: plan.startDate,
                  dueDate: plan.dueDate,
                  estimatedTime: plan.estimatedTime,
                  priority: plan.priority,
                  observations: plan.observations,
                  items: plan.items.map((it) => ({
                    id: uid("ai"),
                    name: `Actividad`,
                    description: it.description,
                    owner: it.owner,
                    priority: it.priority,
                    startDate: it.startDate,
                    dueDate: it.dueDate,
                    progress: 0,
                    status: "pendiente" as const,
                    comments: [] as ActivityComment[],
                  })),
                  submittedAt: nowISO(),
                  sentToArea: plan.sentToArea,
                  planCode: plan.planCode,
                  planStatus: plan.planStatus,
                  planDate: plan.planDate,
                  scheduledDate: plan.scheduledDate,
                  annexes: plan.annexes,
                  secondResponsible: plan.secondResponsible,
                }],
          },
          {
            kind: "plan_propuesto",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: `Plan de Acción enviado a ${head} · ${AREA_LABELS[plan.sentToArea]}`,
            detail: `Correo enviado a ${head?.toLowerCase().replace(" ", ".") || "jefe.del.area"}@metrolinea1.pe con el resumen del plan. ${plan.items.length} actividades. Pendiente de aprobación por SO.`,
          }
        )
      );
      pushNotification({ caseId, title: "Plan de Acción enviado al área", body: `${caseId} · plan enviado a ${head} (${AREA_LABELS[plan.sentToArea]}). Pendiente de aprobación.`, audience: "both", kind: "info" });
    },
    [mutate, pushNotification]
  );

  const reviewActionPlan = useCallback(
    (caseId: string, decision: "aprobado" | "rechazado", note?: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          {
            ...c,
            actionPlans: c.actionPlans 
              ? c.actionPlans.map((plan) => ({ ...plan, reviewedAt: nowISO(), reviewDecision: decision, reviewNote: note }))
              : c.actionPlans,
          },
          {
            kind: decision === "aprobado" ? "plan_aprobado" : "plan_ajustado",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: decision === "aprobado" ? "Plan aprobado por Seguridad Operativa" : "Plan rechazado",
            detail: note,
          }
        )
      );
      pushNotification({ caseId, title: decision === "aprobado" ? "Plan aprobado — listo para Ejecución" : "Plan rechazado", body: `${caseId} · decisión de Seguridad Operativa.`, audience: "both", kind: decision === "aprobado" ? "success" : "warning" });
    },
    [mutate, pushNotification]
  );

  const verifyActionPlan = useCallback(
    (caseId: string, planIndex: number, decision: "aprobado" | "rechazado" | "pendiente", note?: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          {
            ...c,
            actionPlans: c.actionPlans 
              ? c.actionPlans.map((plan, index) => 
                  index === planIndex 
                    ? { 
                        ...plan, 
                        verification: { 
                          verifiedAt: nowISO(), 
                          verifiedBy: SAFETY_USER.name, 
                          decision, 
                          note 
                        } 
                      }
                    : plan
                )
              : c.actionPlans,
          },
          {
            kind: decision === "aprobado" ? "plan_aprobado" : "plan_ajustado",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: decision === "aprobado" ? "Plan de Acción verificado y aprobado" : "Plan de Acción rechazado en verificación",
            detail: decision === "aprobado" ? "El plan ha completado la verificación exitosamente." : `El plan requiere ajustes: ${note || ""}`,
          }
        )
      );
    },
    [mutate, pushNotification]
  );

  const addPlanComment = useCallback(
    (caseId: string, planIndex: number, text: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          {
            ...c,
            actionPlans: c.actionPlans 
              ? c.actionPlans.map((plan, index) => 
                  index === planIndex 
                    ? { 
                        ...plan, 
                        comments: [
                          ...(plan.comments || []),
                          {
                            id: uid("comment"),
                            text,
                            author: SAFETY_USER.name,
                            at: nowISO()
                          }
                        ]
                      }
                    : plan
                )
              : c.actionPlans,
          },
          {
            kind: "comentario",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: "Comentario agregado al Plan de Acción",
            detail: text
          }
        )
      );
      pushNotification({ 
        caseId, 
        title: "Nuevo comentario en Plan de Acción", 
        body: `${caseId} · ${SAFETY_USER.name} agregó un comentario: ${text.slice(0, 50)}...`, 
        audience: "both", 
        kind: "info" 
      });
    },
    [mutate, pushNotification]
  );

  const startExecution = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          {
            ...c,
            actionPlans: c.actionPlans
              ? c.actionPlans.map((plan) => ({ ...plan, reviewDecision: "pendiente" as const, reviewedAt: undefined }))
              : c.actionPlans,
          },
          { kind: "plan_propuesto", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Plan de Acción enviado a Jefe de Área", detail: `Correo enviado a jefe del área. Pendiente de aprobación.` }
        )
      );
      pushNotification({
        caseId,
        title: `Plan de Acción reenviado — ${caseId}`,
        body: `Seguridad Operativa reenvió el plan de acción para su revisión y aprobación.`,
        audience: "jefe",
        kind: "info",
      });
    },
    [mutate, pushNotification]
  );

  // ─── ETAPA 4 — Aceptación del plan (jefe del área) ─────────────────────
  const acceptPlan = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) => {
        // Calcular progreso dinámicamente basado en las actividades del plan
        const calculatePlanProgress = (plan: any) => {
          if (!plan.items || plan.items.length === 0) return 0;
          let totalProgress = 0;
          plan.items.forEach((item: any) => {
            if (item.status === "completado") totalProgress += 100;
            else if (item.status === "en_progreso") totalProgress += 50;
            else totalProgress += 0;
          });
          return Math.round(totalProgress / plan.items.length);
        };

        const updatedPlans = c.actionPlans 
          ? c.actionPlans.map((plan) => ({
              ...plan,
              reviewDecision: "aprobado" as const,
              reviewedAt: nowISO(),
              items: plan.items.map((it) => (it.status === "pendiente" ? { ...it, status: "en_progreso" as const } : it))
            }))
          : c.actionPlans;

        const initialProgress = updatedPlans ? calculatePlanProgress(updatedPlans[0]) : 0;

        return pushTimeline(
          { 
            ...c, 
            stage: "ejecucion",
            execution: { 
              ...c.execution, 
              progress: initialProgress, 
              updates: [], 
              acceptedByAreaAt: nowISO() 
            },
            actionPlans: updatedPlans
          },
          { kind: "plan_aprobado", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: "Plan aceptado por el jefe del área", detail: "El área aceptó el plan. Ejecución iniciada." }
        );
      });
      pushNotification({ 
        caseId, 
        title: `Plan de Acción aceptado — ${caseId}`, 
        body: `El jefe del área aceptó el plan. Ejecución iniciada.`, 
        audience: "seguridad", 
        kind: "success" 
      });
    },
    [mutate, pushNotification]
  );

  // ─── ETAPA 5 — Ejecución (SO inicia) ────────────────────────────────

  const requestExtension = useCallback(
    (caseId: string, ext: ExtensionInput) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { 
            ...c, 
            actionPlans: c.actionPlans 
              ? c.actionPlans.map((plan) => ({ 
                  ...plan, 
                  extensionRequest: { ...ext, requestedAt: nowISO() } 
                }))
              : c.actionPlans 
          },
          { kind: "ampliacion", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: "Solicitud de ampliación de plazo", detail: `Nueva fecha: ${ext.nuevaFecha}. Justificación: ${ext.justificacion}.` }
        )
      );
      pushNotification({ caseId, title: "Solicitud de ampliación de plazo", body: `${caseId} · el jefe del área solicita ampliación para el plan de acción. Pendiente de decisión de SO.`, audience: "seguridad", kind: "warning" });
    },
    [mutate, pushNotification]
  );

  const reviewExtension = useCallback(
    (caseId: string, decision: "aprobada" | "rechazada", note?: string, newDate?: string) => {
      mutate(caseId, (c) => {
        const due = c.actionPlans?.[0]?.dueDate ?? c.slaDueDate;
        const newDue = decision === "aprobada" && newDate ? newDate : due;
        return pushTimeline(
          {
            ...c,
            slaDueDate: newDue,
            actionPlans: c.actionPlans ? c.actionPlans.map((plan) => ({ 
              ...plan, 
              dueDate: newDue, 
              extensionRequest: plan.extensionRequest ? { ...plan.extensionRequest, decision, decidedAt: nowISO() } : plan.extensionRequest 
            })) : c.actionPlans,
            extensionRequest: c.extensionRequest ? { ...c.extensionRequest, decision, decidedAt: nowISO() } : c.extensionRequest,
          },
          { kind: "ampliacion", actor: SAFETY_USER.name, actorRole: "seguridad", title: `Solicitud de ampliación ${decision}`, detail: decision === "aprobada" ? `Ampliación aprobada. Nueva fecha: ${newDue}. ${note || ""}` : `Ampliación rechazada. ${note || ""}` }
        )
      });
      pushNotification({ caseId, title: `Solicitud de ampliación ${decision}`, body: `${caseId} · ${decision === "aprobada" ? "Ampliación aprobada" : "Ampliación rechazada"}.`, audience: "both", kind: decision === "aprobada" ? "success" : "warning" });
    },
    [mutate, pushNotification]
  );

  const updateActionItem = useCallback(
    (caseId: string, itemId: string, patch: { status?: ActionItem["status"]; progress?: number; comment?: string }) => {
      mutate(caseId, (c) => {
        if (!c.actionPlans || c.actionPlans.length === 0) return c;
        
        // Calcular progreso dinámicamente basado en el estado de las actividades
        const calculateProgress = (items: any[]) => {
          if (!items || items.length === 0) return 0;
          let totalProgress = 0;
          items.forEach((item) => {
            if (item.status === "completado") totalProgress += 100;
            else if (item.status === "en_progreso") totalProgress += 50;
            else totalProgress += 0;
          });
          return Math.round(totalProgress / items.length);
        };

        const updatedPlans = c.actionPlans.map((plan) => {
          const items = plan.items.map((it) => {
            if (it.id !== itemId) return it;
            const nextStatus = patch.status ?? it.status;
            const nextProgress = calculateProgress([{ ...it, status: nextStatus }]);
            const nextComments = patch.comment?.trim() 
              ? [...it.comments, { id: uid("comment"), text: patch.comment.trim(), author: c.assignee ?? "Jefe de Área", at: nowISO() }]
              : it.comments;
            return { ...it, status: nextStatus, progress: nextProgress, comments: nextComments };
          });
          const execProgress = calculateProgress(items);
          return { ...plan, items };
        });
        
        const execProgress = calculateProgress(updatedPlans[0].items);
        return pushTimeline(
          { ...c, actionPlans: updatedPlans, execution: { progress: execProgress, updates: c.execution?.updates ?? [], acceptedByAreaAt: c.execution?.acceptedByAreaAt } },
          patch.comment?.trim()
            ? { kind: "ejecucion", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: `Actividad ${nextStatusLabel(patch.status)}`, detail: patch.comment.trim() }
            : { kind: "ejecucion", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: `Actividad ${nextStatusLabel(patch.status)}`, detail: "Estado de actividad actualizado" }
        );
      });
      if (patch.status) {
        pushNotification({ 
          caseId, 
          title: "Actividad actualizada", 
          body: `${caseId} · actividad marcada como ${patch.status}.`, 
          audience: "both", 
          kind: "info" 
        });
      }
    },
    [mutate, pushNotification]
  );

  const addExecutionEvidence = useCallback(
    (caseId: string, evidence: Evidence) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, evidence: [...c.evidence, evidence] },
          { kind: "ejecucion", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: `Evidencia de ejecución adjuntada — ${evidence.name}`, detail: `${evidence.kind} · ${evidence.size}` }
        )
      );
      pushNotification({ 
        caseId, 
        title: "Evidencia de ejecución adjuntada", 
        body: `${caseId} · ${evidence.name} (${evidence.kind})`, 
        audience: "both", 
        kind: "info" 
      });
    },
    [mutate, pushNotification]
  );

  const completeExecution = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) => {
        // Calcular progreso dinámicamente basado en el estado de las actividades
        const calculateProgress = (items: any[]) => {
          if (!items || items.length === 0) return 0;
          let totalProgress = 0;
          items.forEach((item) => {
            if (item.status === "completado") totalProgress += 100;
            else if (item.status === "en_progreso") totalProgress += 50;
            else totalProgress += 0;
          });
          return Math.round(totalProgress / items.length);
        };

        const updatedPlans = c.actionPlans?.map((plan) => ({
          ...plan,
          items: plan.items.map((it) => ({ ...it, status: "completado" as const, progress: 100 }))
        })) ?? [];
        
        const execProgress = calculateProgress(updatedPlans[0]?.items ?? []);
        
        return pushTimeline(
          {
            ...c,
            stage: "verificacion",
            actionPlans: updatedPlans,
            execution: { progress: execProgress, updates: c.execution?.updates ?? [], acceptedByAreaAt: c.execution?.acceptedByAreaAt },
          },
          { kind: "seguimiento", actor: c.assignee ?? "Jefe de Área", actorRole: "reportante", title: "Ejecución finalizada — vuelve a Seguridad Operativa", detail: "El área completó las actividades. El expediente vuelve a SO para verificación." }
        );
      });
      pushNotification({ caseId, title: "Ejecución completada — pendiente de verificación", body: `${caseId} · el área finalizó. Verificación por Seguridad Operativa.`, audience: "seguridad", kind: "info" });
    },
    [mutate, pushNotification]
  );

  // ─── ETAPA 6 — Verificación (SO) ────────────────────────────────────
  const addVerificationNote = useCallback(
    (caseId: string, note: string) => {
      mutate(caseId, (c) =>
        pushTimeline(c, { kind: "seguimiento", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Observación de verificación registrada", detail: note })
      );
    },
    [mutate]
  );

  // ─── ETAPA 7 — Cierre (SO) ──────────────────────────────────────────
  const closeCase = useCallback(
    (caseId: string, note?: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "cierre", closedAt: nowISO() },
          { kind: "cierre", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Caso cerrado", detail: note ?? "Cierre del caso. Historial completo generado y archivado." }
        )
      );
      pushNotification({ caseId, title: "Caso cerrado", body: `${caseId} cerrado por Seguridad Operativa.`, audience: "both", kind: "success" });
    },
    [mutate, pushNotification]
  );

  const keepPending = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "ejecucion" as Stage },
          { kind: "seguimiento", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Caso mantenido pendiente", detail: "Seguridad Operativa decidió mantener el caso pendiente. Vuelta a ejecución para seguimiento." }
        )
      );
    },
    [mutate]
  );

  const reopenCase = useCallback(
    (caseId: string) => {
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: "verificacion", closedAt: undefined },
          { kind: "reapertura", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Caso reabierto", detail: "El caso vuelve a verificación." }
        )
      );
    },
    [mutate]
  );

  const reopenCaseWithReason = useCallback(
    (caseId: string, targetStage: Stage, reason: string) => {
      const stageLabels: Record<string, string> = {
        recepcion: "Recepción",
        evaluacion: "Evaluación",
        investigacion: "Investigación",
        plan_accion: "Plan de Acción",
        ejecucion: "Ejecución",
        verificacion: "Verificación",
      };
      mutate(caseId, (c) =>
        pushTimeline(
          { ...c, stage: targetStage, closedAt: undefined },
          {
            kind: "reapertura",
            actor: SAFETY_USER.name,
            actorRole: "seguridad",
            title: `Caso reabierto — vuelve a ${stageLabels[targetStage] ?? targetStage}`,
            detail: `Motivo de la reapertura: ${reason}. El caso fue reabierto para corregir o completar información.`,
          }
        )
      );
      // Notificación a Seguridad Operativa
      pushNotification({
        caseId,
        title: "Caso reabierto para edición",
        body: `${caseId} reabierto por Seguridad Operativa. Motivo: ${reason.slice(0, 60)}.`,
        audience: "seguridad",
        kind: "warning",
      });
      // Notificación al jefe de área si se reabre a plan_accion o ejecucion
      if (targetStage === "plan_accion" || targetStage === "ejecucion") {
        pushNotification({
          caseId,
          title: `Caso reabierto — ${caseId}`,
          body: `Seguridad Operativa reabrió el caso y lo devolvió a ${stageLabels[targetStage]}. Motivo: ${reason.slice(0, 60)}. Se requiere su revisión.`,
          audience: "jefe",
          kind: "warning",
        });
      }
    },
    [mutate, pushNotification]
  );

  // ─── Generales ──────────────────────────────────────────────────────
  const respondInfoRequest = useCallback(
    (caseId: string, response: string) => {
      mutate(caseId, (c) => {
        const updated = pushTimeline(c, { kind: "info_recibida", actor: c.reporter, actorRole: "reportante", title: "Información solicitada recibida", detail: response });
        return { ...updated, stage: "recepcion", pendingInfoRequest: undefined };
      });
      pushNotification({ caseId, title: "Información recibida del reportante", body: `${caseId} · respuesta enviada`, audience: "seguridad", kind: "info" });
    },
    [mutate, pushNotification]
  );

  const addTimelineComment = useCallback(
    (caseId: string, comment: string) => {
      mutate(caseId, (c) =>
        pushTimeline(c, { kind: "comentario", actor: SAFETY_USER.name, actorRole: "seguridad", title: "Comentario agregado al expediente", detail: comment })
      );
    },
    [mutate]
  );

  const moveToStageWithoutTimeline = useCallback(
    (caseId: string, targetStage: Stage) => {
      mutate(caseId, (c) => ({ ...c, stage: targetStage, closedAt: undefined }));
    },
    [mutate]
  );

  const notifySanction = useCallback(
    (caseId: string, area: Area, sanction: string) => {
      const head = AREA_HEADS[area];
      mutate(caseId, (c) =>
        pushTimeline(c, {
          kind: "sancion",
          actor: SAFETY_USER.name,
          actorRole: "seguridad",
          title: `Sanción notificada a ${head} · ${AREA_LABELS[area]}`,
          detail: `${sanction}\n\nCorreo enviado a ${head.toLowerCase().replace(" ", ".")}@metrolinea1.pe para aplicar la medida.`,
        })
      );
      pushNotification({ caseId, title: "Sanción notificada al área", body: `${caseId} · ${head} (${AREA_LABELS[area]}) fue notificado.`, audience: "both", kind: "warning" });
    },
    [mutate, pushNotification]
  );

  // ─── Administración de Usuarios ────────────────────────────────────
  const syncFromExcel = useCallback(async () => {
    const start = Date.now();
    // Simular lectura del Excel: marcar log en_proceso
    const inProgressLog: SyncLog = {
      id: uid("sync"),
      at: nowISO(),
      triggeredBy: SAFETY_USER.name,
      newUsers: 0, updatedUsers: 0, deactivatedUsers: 0,
      durationSec: 0, status: "en_proceso",
    };
    setSyncLogs((prev) => [inProgressLog, ...prev]);

    // Simular tiempo de lectura (3.5s)
    await new Promise((r) => setTimeout(r, 3500));

    const now = nowISO();
    const newCount = NEW_USERS_FROM_EXCEL.length;
    const updatedCount = 2; // simulación: 2 actualizados
    const deactivatedCount = 1; // simulación: 1 dado de baja

    setUsers((prev) => {
      const byCode = new Map(prev.map((u) => [u.code, u]));
      // 1) Agregar nuevos
      const newUsers: User[] = NEW_USERS_FROM_EXCEL.map((nu) => {
        const name = `${nu.firstName} ${nu.lastName}`;
        const initials = (nu.firstName[0] + nu.lastName[0]).toUpperCase();
        const colorIdx = parseInt(nu.code.replace(/\D/g, "")) % 8;
        const lastAccess = new Date();
        return {
          ...nu,
          name,
          role: nu.systemRole === "consulta" ? "reportante" as const : "seguridad" as const,
          userRole: nu.systemRole,
          id: `usr_${nu.code.toLowerCase().replace(/-/g, "")}`,
          initials,
          lastSyncAt: now,
          lastAccessAt: lastAccess.toISOString(),
          avatarColor: ["#14814a", "#2c7be0", "#d99520", "#8a6fd6", "#d23a2c", "#0f6b3e", "#5fb4d4", "#c79a3e"][colorIdx],
          roles: [{ role: nu.systemRole, assignedBy: "Sistema (Excel)", assignedAt: now }],
          workHistory: [{ id: `wh_alta_${nu.code}`, at: now, field: "alta", oldValue: "—", newValue: "Nuevo ingreso desde Excel", source: "excel" as const }],
          activity: [{ id: `act_alta_${nu.code}`, at: now, type: "cambio" as const, title: "Alta de trabajador", detail: "Sincronizado desde Excel corporativo" }],
        };
      });
      // 2) Actualizar existentes (simular cambio de área en EMP-0011)
      const updated = prev.map((u) => {
        if (u.code === "EMP-0011") return { ...u, area: "mantenimiento" as Area, cargo: "Supervisora de Mantenimiento", lastSyncAt: now };
        if (u.code === "EMP-0014") return { ...u, cargo: "Técnico Senior de Material Rodante", lastSyncAt: now };
        return u;
      });
      const merged = [...updated, ...newUsers];
      // 3) Dar de baja: EMP-0025 ya no aparece en el Excel
      const finalUsers = merged.map((u) =>
        u.code === "EMP-0025" ? { ...u, status: "inactivo" as const, laborState: "baja_definitiva" as const, lastSyncAt: now } : u
      );
      const uniqueByCode = new Map(finalUsers.map((u) => [u.code, u]));
      return Array.from(uniqueByCode.values());
    });

    const durationSec = Math.round((Date.now() - start) / 1000);
    setSyncLogs((prev) =>
      prev.map((l) =>
        l.id === inProgressLog.id
          ? { ...l, newUsers: newCount, updatedUsers: updatedCount, deactivatedUsers: deactivatedCount, durationSec, status: "completada" }
          : l
      )
    );

    return { newCount, updatedCount, deactivatedCount, durationSec };
  }, []);

  const assignUserRole = useCallback((userId: string, userRole: SystemRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? {
      ...u,
      userRole,
      systemRole: userRole,
      role: userRole === "consulta" ? "reportante" : "seguridad",
      roles: [...u.roles, { role: userRole, assignedBy: SAFETY_USER.name, assignedAt: nowISO() }],
    } : u)));
  }, []);

  const deactivateUser = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "inactivo" as const } : u)));
  }, []);

  const searchWorkers = useCallback((query: string): User[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) =>
      u.code.toLowerCase().includes(q) ||
      u.dni.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [users]);

  // ─── Investigación — Trabajadores involucrados ─────────────────────
  const addInvolvedWorker = useCallback((caseId: string, user: User, implication: ImplicationType) => {
    const boss = user.area ? AREA_HEADS[user.area] : "—";
    const worker: InvolvedWorker = {
      id: uid("iw"),
      userId: user.id,
      code: user.code,
      dni: user.dni,
      name: user.name,
      cargo: user.cargo,
      area: user.area ?? "operaciones",
      initials: user.initials,
      avatarColor: user.avatarColor,
      laborState: user.laborState,
      immediateBoss: boss,
      implication,
      addedAt: nowISO(),
    };
    mutate(caseId, (c) =>
      pushTimeline(
        { ...c, involvedWorkers: [...(c.involvedWorkers ?? []), worker] },
        {
          kind: "comentario",
          actor: SAFETY_USER.name,
          actorRole: "seguridad",
          title: `Trabajador involucrado agregado — ${worker.name}`,
          detail: `Código ${worker.code} · ${worker.cargo} · Implicación: ${implication}. Jefe inmediato: ${boss}.`,
        }
      )
    );
  }, [mutate, users]);

  const removeInvolvedWorker = useCallback((caseId: string, workerId: string) => {
    mutate(caseId, (c) => {
      const worker = (c.involvedWorkers ?? []).find((w) => w.id === workerId);
      if (!worker) return c;
      return pushTimeline(
        {
          ...c,
          involvedWorkers: (c.involvedWorkers ?? []).map((w) =>
            w.id === workerId ? { ...w, removedAt: nowISO() } : w
          ),
        },
        {
          kind: "comentario",
          actor: SAFETY_USER.name,
          actorRole: "seguridad",
          title: `Trabajador retirado del caso — ${worker.name}`,
          detail: `El trabajador ${worker.name} (${worker.code}) fue retirado del caso. Su información histórica se conserva.`,
        }
      );
    });
  }, [mutate]);

  const updateInvolvedWorker = useCallback(
    (caseId: string, workerId: string, patch: { implication?: ImplicationType; statement?: string; observations?: string }) => {
      mutate(caseId, (c) => ({
        ...c,
        involvedWorkers: (c.involvedWorkers ?? []).map((w) =>
          w.id === workerId ? { ...w, ...patch } : w
        ),
      }));
    },
    [mutate]
  );

  const reassignResponsible = useCallback((caseId: string, newAssignee: string, newArea: Area, motivo: string) => {
    mutate(caseId, (c) =>
      pushTimeline(
        { ...c, assignee: newAssignee, assigneeArea: newArea },
        {
          kind: "comentario",
          actor: SAFETY_USER.name,
          actorRole: "seguridad",
          title: `Responsable reasignado — ${newAssignee}`,
          detail: `Motivo: ${motivo}. Responsable anterior: ${c.assignee ?? "—"}. Nuevo responsable: ${newAssignee} (${AREA_LABELS[newArea]}).`,
        }
      )
    );
  }, [mutate]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const getCase = useCallback((id: string) => cases.find((c) => c.id === id), [cases]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(CASES_KEY);
    localStorage.removeItem(NOTIF_KEY);
    localStorage.removeItem(SEQ_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SYNC_KEY);
    setCases(SEED_CASES);
    setNotifications(SEED_NOTIFICATIONS);
    setSeq(15);
    setUsers(SEED_USERS);
    setSyncLogs(SEED_SYNC_LOGS);
  }, []);

  const value: StoreValue = {
    cases,
    notifications,
    role,
    setRole,
    currentUser,
    jefeArea,
    setJefeArea,
    createReport,
    respondInfoRequest,
    markNotificationRead,
    markAllNotificationsRead,
    approveCase,
    rejectCase,
    requestInfo,
    addReviewObservation,
    saveEvaluation,
    sendToInvestigation,
    setInvestigator,
    saveInvestigation,
    addInvestigationEvidence,
    submitActionPlan,
    reviewActionPlan,
    verifyActionPlan,
    addPlanComment,
    startExecution,
    acceptPlan,
    requestExtension,
    reviewExtension,
    updateActionItem,
    addExecutionEvidence,
    completeExecution,
    addVerificationNote,
    closeCase,
    keepPending,
    reopenCase,
    reopenCaseWithReason,
    moveToStageWithoutTimeline,
    addTimelineComment,
    notifySanction,
    users,
    syncLogs,
    syncFromExcel,
    assignUserRole,
    deactivateUser,
    searchWorkers,
    addInvolvedWorker,
    removeInvolvedWorker,
    updateInvolvedWorker,
    reassignResponsible,
    getCase,
    resetAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

function nextStatusLabel(status?: ActionItem["status"]): string {
  if (status === "completado") return "finalizada";
  if (status === "en_progreso") return "en proceso";
  if (status === "pendiente") return "pendiente";
  return "actualizada";
}

