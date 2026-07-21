import {
  AREA_HEADS,
  AREA_LABELS,
  type CaseFile,
  type Notification,
  type Priority,
  type Stage,
  type TimelineEvent,
} from "./types";
import { uid } from "./utils";

function daysAgo(n: number, h = 9, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAhead(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

function ev(
  kind: TimelineEvent["kind"],
  days: number,
  actor: string,
  actorRole: TimelineEvent["actorRole"],
  title: string,
  detail?: string
): TimelineEvent {
  return {
    id: uid("ev"),
    kind,
    at: daysAgo(days, 9 + (Math.abs(days) % 6)),
    actor,
    actorRole,
    title,
    detail,
  };
}

export const SEED_CASES: CaseFile[] = [
  {
    id: "EXP-2026-00014",
    type: "accidente",
    title: "Caída de personal en plataforma de estación Cabitos",
    description:
      "Durante tareas de inspección en la plataforma sur, un técnico resbaló sobre superficie mojada y sufrió luxación de muñeca. Se activó protocolo de primeros auxilios y traslado a centro asistencial.",
    observations:
      "El área presentaba humedad por condensación. Señalización temporal se encontraba fuera de posición.",
    area: "mantenimiento",
    station: "Cabitos",
    location: "Plataforma sur · vía 2",
    date: daysAgo(2, 7, 35).slice(0, 10),
    time: "07:35",
    priority: "critica",
    stage: "investigacion",
    reporter: "Carlos Núñez",
    reporterRole: "reportante",
    assignee: AREA_HEADS.mantenimiento,
    assigneeArea: "mantenimiento",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "plataforma_sur_1.jpg", size: "2.4 MB", at: daysAgo(2, 7, 40) },
      { id: uid("ev"), kind: "foto", name: "plataforma_sur_2.jpg", size: "3.1 MB", at: daysAgo(2, 7, 42) },
      { id: uid("ev"), kind: "documento", name: "parte_medico.pdf", size: "612 KB", at: daysAgo(1, 10, 5) },
    ],
    timeline: [
      ev("creado", 2, "Carlos Núñez", "reportante", "Reporte registrado por trabajador"),
      ev("aprobado", 1, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 1, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.mantenimiento} · ${AREA_LABELS.mantenimiento}`, "Correo enviado al jefe de área. Inicia investigación."),
    ],
    slaDueDate: daysAhead(6),
    createdAt: daysAgo(2),
  },
  {
    id: "EXP-2026-00013",
    type: "falla_operativa",
    title: "Falla intermitente en señalamiento tramo Atocongo–Pamplona",
    description:
      "Señales de tránsito ferroviario presentan corte intermitente entre Atocongo y Pamplona durante horas punta. Se reportan tres eventos de frenado de emergencia en la semana.",
    observations: "Patrón se repite entre 07:30–08:15 y 18:00–18:45.",
    area: "subestaciones",
    station: "Atocongo",
    location: "Tramo Atocongo ↔ Pamplona · vía 1",
    date: daysAgo(4, 8, 10).slice(0, 10),
    time: "08:10",
    priority: "alta",
    stage: "investigacion",
    reporter: "Lucía Ramírez",
    reporterRole: "reportante",
    assignee: AREA_HEADS.subestaciones,
    assigneeArea: "subestaciones",
    evidence: [
      { id: uid("ev"), kind: "video", name: "falla_señal.mp4", size: "18.7 MB", at: daysAgo(4, 8, 14) },
      { id: uid("ev"), kind: "documento", name: "log_operacion.xlsx", size: "244 KB", at: daysAgo(3, 9, 30) },
    ],
    timeline: [
      ev("creado", 4, "Lucía Ramírez", "reportante", "Reporte registrado por trabajador"),
      ev("aprobado", 3, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 3, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.subestaciones} · ${AREA_LABELS.subestaciones}`),
      ev("investigacion", 1, AREA_HEADS.subestaciones, "reportante", "Investigación iniciada", "Inspección de gabinetes y revisión de históricos de tensión."),
    ],
    investigation: {
      technicalDescription: "—", findings:
        "Fluctuación de tensión en subestación ATO-03 fuera de rango nominal. Gabinete de control con humedad interna.",
      rootCause:
        "Envejecimiento de aislamiento en transformador de medición + sello de gabinete deteriorado.",
      conclusions:
        "Falla atribuible a degradación de infraestructura eléctrica. Requiere reemplazo programado.",
      observations: "Recomendable programar mantenimiento preventivo en tramos adyacentes.",
      updatedAt: daysAgo(1, 11, 0),
    },
    slaDueDate: daysAhead(3),
    createdAt: daysAgo(4),
  },
  {
    id: "EXP-2026-00012",
    type: "condicion_insegura",
    title: "Baranda perimetral suelta en andén estación Javier Prado",
    description:
      "Tramo de baranda metálica perimetral presenta holgura y un tornillo faltante. Riesgo de caída al carril para personal de mantenimiento durante horas no operativas.",
    observations: "Ubicada cerca de acceso técnico sur.",
    area: "infraestructura",
    station: "Javier Prado",
    location: "Andén central · extremo sur",
    date: daysAgo(6, 14, 20).slice(0, 10),
    time: "14:20",
    priority: "media",
    stage: "plan_accion",
    reporter: "Fernando Quispe",
    reporterRole: "reportante",
    assignee: AREA_HEADS.infraestructura,
    assigneeArea: "infraestructura",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "baranda_suelta.jpg", size: "1.8 MB", at: daysAgo(6, 14, 25) },
    ],
    timeline: [
      ev("creado", 6, "Fernando Quispe", "reportante", "Reporte registrado por trabajador"),
      ev("aprobado", 5, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 5, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.infraestructura} · ${AREA_LABELS.infraestructura}`),
      ev("investigacion", 3, AREA_HEADS.infraestructura, "reportante", "Hallazgos de investigación registrados"),
      ev("plan_propuesto", 1, AREA_HEADS.infraestructura, "reportante", "Plan de acción propuesto", "3 acciones correctivas, plazo 7 días."),
    ],
    investigation: {
      technicalDescription: "—", findings:
        "Tres tornillos de anclaje con corrosión avanzada. Baranda requiere reapriete y reemplazo de elementos.",
      rootCause: "Corrosión por humedad ambiente + falta de mantenimiento preventivo programado.",
      conclusions: "Condición aislada pero repetible en estaciones de similar antigüedad.",
      observations: "Sugerir inspección integral en estaciones Javier Prado, Cabitos y Ayacucho.",
      updatedAt: daysAgo(3, 10, 0),
    },
    actionPlan: { elaboratedBy: "Marcela Falcón", actionType: "Correctiva", description: "Plan de acción correctivo derivado de la investigación.", startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(7), estimatedTime: "7 días", priority: "media" as Priority, observations: "Coordinar con el jefe del área responsable.", sentToArea: "infraestructura", items: [
        { id: uid("ai"), name: "Reapriete y reemplazo de tornillería en baranda afectada", description: "Reapriete y reemplazo de tornillería en baranda afectada", owner: AREA_HEADS.infraestructura, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(2), progress: 0, status: "pendiente", comments: [] as string[] },
        { id: uid("ai"), name: "Inspección de barandas en estaciones similares", description: "Inspección de barandas en estaciones similares", owner: AREA_HEADS.infraestructura, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(5), progress: 0, status: "pendiente", comments: [] as string[] },
        { id: uid("ai"), name: "Inclusión en plan preventivo trimestral", description: "Inclusión en plan preventivo trimestral", owner: AREA_HEADS.infraestructura, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(7), progress: 0, status: "pendiente", comments: [] as string[] },
      ],
      submittedAt: daysAgo(1, 16, 30),
    },
    slaDueDate: daysAhead(4),
    createdAt: daysAgo(6),
  },
  {
    id: "EXP-2026-00011",
    type: "acto_inseguro",
    title: "Personal sin EPP en zona de vías — San Juan",
    description:
      "Operario observado sin casco y sin chaleco reflectivo en zona de vías durante jornada de mantenimiento nocturno.",
    observations: "Observación reportada por supervisor de turno.",
    area: "operaciones",
    station: "San Juan",
    location: "Zona de vías · acceso norte",
    date: daysAgo(8, 22, 45).slice(0, 10),
    time: "22:45",
    priority: "alta",
    stage: "ejecucion",
    reporter: "Sofía Erazo",
    reporterRole: "reportante",
    assignee: AREA_HEADS.operaciones,
    assigneeArea: "operaciones",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "observacion_epp.jpg", size: "1.2 MB", at: daysAgo(8, 22, 50) },
    ],
    timeline: [
      ev("creado", 8, "Sofía Erazo", "reportante", "Observación registrada"),
      ev("aprobado", 7, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 7, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.operaciones} · ${AREA_LABELS.operaciones}`),
      ev("investigacion", 5, AREA_HEADS.operaciones, "reportante", "Investigación registrada"),
      ev("plan_propuesto", 4, AREA_HEADS.operaciones, "reportante", "Plan de acción propuesto"),
      ev("plan_aprobado", 3, "M. Falcón", "seguridad", "Plan aprobado por Seguridad Operativa"),
      ev("ejecucion", 1, AREA_HEADS.operaciones, "reportante", "Avance 60% registrado", "Capacitación EPP realizada al 80% del personal."),
    ],
    investigation: {
      technicalDescription: "—", findings: "Personal nuevo sin inducción completa. Supervisor no verificó EPP al ingreso.",
      rootCause: "Proceso de inducción incompleto + falta de verificación en acceso.",
      conclusions: "Reforzar control de EPP en accesos y completar inducción de personal nuevo.",
      observations: "Coordinar con RR.HH. el padrón actualizado de personal nuevo.",
      updatedAt: daysAgo(5, 10, 0),
    },
    actionPlan: { elaboratedBy: "Marcela Falcón", actionType: "Correctiva", description: "Plan de acción correctivo derivado de la investigación.", startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(7), estimatedTime: "7 días", priority: "media" as Priority, observations: "Coordinar con el jefe del área responsable.", sentToArea: "infraestructura", items: [
        { id: uid("ai"), name: "Completar inducción de seguridad al personal nuevo", description: "Completar inducción de seguridad al personal nuevo", owner: AREA_HEADS.operaciones, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(-1), progress: 80, status: "en_progreso", comments: [] as string[] },
        { id: uid("ai"), name: "Implementar checklist EPP en puntos de acceso", description: "Implementar checklist EPP en puntos de acceso", owner: AREA_HEADS.operaciones, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(1), progress: 60, status: "en_progreso", comments: [] as string[] },
        { id: uid("ai"), name: "Charla de concientización al turno nocturno", description: "Charla de concientización al turno nocturno", owner: AREA_HEADS.operaciones, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(3), progress: 40, status: "en_progreso", comments: [] as string[] },
      ],
      submittedAt: daysAgo(4, 15, 0),
      reviewedAt: daysAgo(3, 9, 30),
      reviewDecision: "aprobado",
    },
    execution: {
      progress: 60,
      updates: [
        { id: uid("ex"), at: daysAgo(3, 17, 0), author: AREA_HEADS.operaciones, progress: 20, comment: "Inicio de capacitación al turno nocturno." },
        { id: uid("ex"), at: daysAgo(2, 11, 0), author: AREA_HEADS.operaciones, progress: 40, comment: "Checklist implementado en 3 de 5 accesos." },
        { id: uid("ex"), at: daysAgo(1, 18, 0), author: AREA_HEADS.operaciones, progress: 60, comment: "Capacitación al 80% del personal. Faltan dos grupos." },
      ],
    },
    slaDueDate: daysAhead(5),
    createdAt: daysAgo(8),
  },
  {
    id: "EXP-2026-00010",
    type: "observacion",
    title: "Iluminación deficiente en paso peatonal — Estación Central",
    description:
      "Pasillo de acceso peatonal presenta dos luminarias apagadas. Condiciones de visibilidad reducidas en horas de cierre.",
    observations: "Reportado por personal de limpieza.",
    area: "mantenimiento",
    station: "Estación Central",
    location: "Acceso peatonal · nivel -1",
    date: daysAgo(10, 19, 15).slice(0, 10),
    time: "19:15",
    priority: "baja",
    stage: "verificacion",
    reporter: "Mario Chávez",
    reporterRole: "reportante",
    assignee: AREA_HEADS.mantenimiento,
    assigneeArea: "mantenimiento",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "iluminacion.jpg", size: "1.4 MB", at: daysAgo(10, 19, 18) },
    ],
    timeline: [
      ev("creado", 10, "Mario Chávez", "reportante", "Observación registrada"),
      ev("aprobado", 9, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 9, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.mantenimiento} · ${AREA_LABELS.mantenimiento}`),
      ev("investigacion", 7, AREA_HEADS.mantenimiento, "reportante", "Investigación registrada"),
      ev("plan_propuesto", 6, AREA_HEADS.mantenimiento, "reportante", "Plan propuesto"),
      ev("plan_aprobado", 5, "M. Falcón", "seguridad", "Plan aprobado"),
      ev("ejecucion", 3, AREA_HEADS.mantenimiento, "reportante", "Avance 90%", "Luminarias reemplazadas. Prueba de funcionamiento pendiente."),
      ev("seguimiento", 1, "M. Falcón", "seguridad", "Seguimiento de cierre", "Verificar funcionamiento en horario nocturno."),
    ],
    investigation: {
      technicalDescription: "—", findings: "Dos luminarias LED con fuente de alimentación dañada por variación de tensión.",
      rootCause: "Falta de regulador de tensión en circuito del pasillo.",
      conclusions: "Reemplazo de luminarias + instalación de regulador recomendada.",
      observations: "Extender revisión a circuitos de pasillos adyacentes.",
      updatedAt: daysAgo(7, 10, 0),
    },
    actionPlan: { elaboratedBy: "Marcela Falcón", actionType: "Correctiva", description: "Plan de acción correctivo derivado de la investigación.", startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(7), estimatedTime: "7 días", priority: "media" as Priority, observations: "Coordinar con el jefe del área responsable.", sentToArea: "infraestructura", items: [
        { id: uid("ai"), name: "Reemplazo de luminarias LED", description: "Reemplazo de luminarias LED", owner: AREA_HEADS.mantenimiento, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(-2), progress: 100, status: "completado", comments: [] as string[] },
        { id: uid("ai"), name: "Instalación de regulador de tensión", description: "Instalación de regulador de tensión", owner: AREA_HEADS.mantenimiento, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(0), progress: 90, status: "en_progreso", comments: [] as string[] },
        { id: uid("ai"), name: "Prueba de funcionamiento nocturno", description: "Prueba de funcionamiento nocturno", owner: AREA_HEADS.mantenimiento, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(1), progress: 0, status: "pendiente", comments: [] as string[] },
      ],
      submittedAt: daysAgo(6, 15, 0),
      reviewedAt: daysAgo(5, 9, 30),
      reviewDecision: "aprobado",
    },
    execution: {
      progress: 90,
      updates: [
        { id: uid("ex"), at: daysAgo(5, 16, 0), author: AREA_HEADS.mantenimiento, progress: 30, comment: "Luminarias retiradas." },
        { id: uid("ex"), at: daysAgo(3, 14, 0), author: AREA_HEADS.mantenimiento, progress: 80, comment: "Luminarias reemplazadas. Regulador en curso." },
        { id: uid("ex"), at: daysAgo(1, 17, 0), author: AREA_HEADS.mantenimiento, progress: 90, comment: "Regulador instalado. Prueba nocturna pendiente." },
      ],
    },
    slaDueDate: daysAhead(1),
    createdAt: daysAgo(10),
  },
  {
    id: "EXP-2026-00009",
    type: "incidente",
    title: "Puerta de andén con cierre defectuoso — Pamplona",
    description:
      "Puerta de andén no completa ciclo de cierre, permanece entreabierta generando riesgo de acceso a vía.",
    observations: "Falla reportada en dos oportunidades durante la semana.",
    area: "material_rodante",
    station: "Pamplona",
    location: "Andén · puerta 3",
    date: daysAgo(12, 11, 5).slice(0, 10),
    time: "11:05",
    priority: "alta",
    stage: "cierre",
    reporter: "Diego Salas",
    reporterRole: "reportante",
    assignee: AREA_HEADS.material_rodante,
    assigneeArea: "material_rodante",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "puerta_anden.jpg", size: "2.0 MB", at: daysAgo(12, 11, 10) },
      { id: uid("ev"), kind: "documento", name: "reporte_tecnico.pdf", size: "880 KB", at: daysAgo(9, 10, 0) },
    ],
    timeline: [
      ev("creado", 12, "Diego Salas", "reportante", "Incidente registrado"),
      ev("aprobado", 11, "M. Falcón", "seguridad", "Caso aprobado por Seguridad Operativa"),
      ev("derivado", 11, "M. Falcón", "seguridad", `Derivado a ${AREA_HEADS.material_rodante} · ${AREA_LABELS.material_rodante}`),
      ev("investigacion", 9, AREA_HEADS.material_rodante, "reportante", "Investigación registrada"),
      ev("plan_propuesto", 8, AREA_HEADS.material_rodante, "reportante", "Plan propuesto"),
      ev("plan_aprobado", 7, "M. Falcón", "seguridad", "Plan aprobado"),
      ev("ejecucion", 4, AREA_HEADS.material_rodante, "reportante", "Avance 100%", "Actuador reemplazado y prueba de ciclo correcta."),
      ev("seguimiento", 2, "M. Falcón", "seguridad", "Verificación final OK"),
      ev("cierre", 1, "M. Falcón", "seguridad", "Caso cerrado", "Historial completo generado y archivado."),
    ],
    investigation: {
      technicalDescription: "—", findings: "Actuador neumático con fuga de sello. Ciclo incompleto por presión insuficiente.",
      rootCause: "Desgaste de sello por uso prolongado sin mantenimiento preventivo.",
      conclusions: "Reemplazo de actuador + ajuste de presión. Reprogramar mantenimiento.",
      observations: "Recomendable revisar puertas gemelas en estaciones Pamplona y Matellini.",
      updatedAt: daysAgo(9, 10, 0),
    },
    actionPlan: { elaboratedBy: "Marcela Falcón", actionType: "Correctiva", description: "Plan de acción correctivo derivado de la investigación.", startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(7), estimatedTime: "7 días", priority: "media" as Priority, observations: "Coordinar con el jefe del área responsable.", sentToArea: "infraestructura", items: [
        { id: uid("ai"), name: "Reemplazo de actuador neumático", description: "Reemplazo de actuador neumático", owner: AREA_HEADS.material_rodante, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(-5), progress: 100, status: "completado", comments: [] as string[] },
        { id: uid("ai"), name: "Ajuste de presión del sistema", description: "Ajuste de presión del sistema", owner: AREA_HEADS.material_rodante, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(-4), progress: 100, status: "completado", comments: [] as string[] },
        { id: uid("ai"), name: "Revisión de puertas gemelas", description: "Revisión de puertas gemelas", owner: AREA_HEADS.material_rodante, priority: "media" as Priority, startDate: daysAgo(3).slice(0, 10), dueDate: daysAhead(-2), progress: 100, status: "completado", comments: [] as string[] },
      ],
      submittedAt: daysAgo(8, 15, 0),
      reviewedAt: daysAgo(7, 9, 30),
      reviewDecision: "aprobado",
    },
    execution: {
      progress: 100,
      updates: [
        { id: uid("ex"), at: daysAgo(6, 16, 0), author: AREA_HEADS.material_rodante, progress: 40, comment: "Actuador retirado." },
        { id: uid("ex"), at: daysAgo(5, 11, 0), author: AREA_HEADS.material_rodante, progress: 80, comment: "Actuador reemplazado y presión ajustada." },
        { id: uid("ex"), at: daysAgo(4, 17, 0), author: AREA_HEADS.material_rodante, progress: 100, comment: "Prueba de ciclo correcta. Puerta operativa." },
      ],
    },
    slaDueDate: daysAgo(1),
    createdAt: daysAgo(12),
    closedAt: daysAgo(1, 16, 0),
  },
  {
    id: "EXP-2026-00008",
    type: "riesgo",
    title: "Sobrecarga eléctrica en tablero de subestación Matellini",
    description:
      "Tablero de distribución presenta temperatura elevada y olor a quemado. Riesgo de falla mayor y posible incendio eléctrico.",
    observations: "Detectado durante inspección rutinaria.",
    area: "subestaciones",
    station: "Matellini",
    location: "Sala de tableros · nivel -2",
    date: daysAgo(1, 6, 50).slice(0, 10),
    time: "06:50",
    priority: "critica",
    stage: "recepcion",
    reporter: "Pedrio Aparicio",
    reporterRole: "reportante",
    evidence: [
      { id: uid("ev"), kind: "foto", name: "tablero_caliente.jpg", size: "2.6 MB", at: daysAgo(1, 6, 55) },
      { id: uid("ev"), kind: "foto", name: "termografia.png", size: "1.9 MB", at: daysAgo(1, 7, 5) },
    ],
    timeline: [
      ev("creado", 1, "Pedrio Aparicio", "reportante", "Reporte registrado por trabajador", "Caso ingresado al sistema. Pendiente de revisión por Seguridad Operativa."),
    ],
    slaDueDate: daysAhead(2),
    createdAt: daysAgo(1),
  },
  {
    id: "EXP-2026-00007",
    type: "hallazgo",
    title: "Documentación de procedimiento desactualizada — Comunicaciones",
    description:
      "Procedimiento de respuesta a falla de radiocomunicación data de 2022. No incluye canales digitales actuales.",
    observations: "Hallazgo de auditoría interna.",
    area: "comunicaciones",
    station: "Estación Central",
    location: "Operaciones · centro de control",
    date: daysAgo(3, 10, 30).slice(0, 10),
    time: "10:30",
    priority: "media",
    stage: "evaluacion",
    reporter: "M. Falcón",
    reporterRole: "seguridad",
    evidence: [
      { id: uid("ev"), kind: "documento", name: "procedimiento_2022.pdf", size: "1.2 MB", at: daysAgo(3, 10, 35) },
    ],
    timeline: [
      ev("creado", 3, "M. Falcón", "seguridad", "Hallazgo de auditoría registrado"),
    ],
    slaDueDate: daysAhead(7),
    createdAt: daysAgo(3),
  },
  {
    id: "EXP-2026-00006",
    type: "incumplimiento",
    title: "Incumplimiento de protocolo de bloqueo y etiquetado (LOTO)",
    description:
      "Personal de contratista ejecutó trabajos sin aplicar protocolo LTO en tablero de Subestación Puno.",
    observations: "Detectado por supervisor de turno.",
    area: "subestaciones",
    station: "Puno",
    location: "Subestación · sala de tableros",
    date: daysAgo(5, 13, 40).slice(0, 10),
    time: "13:40",
    priority: "critica",
    stage: "pendiente_info",
    reporter: "Hugo Reyna",
    reporterRole: "reportante",
    evidence: [
      { id: uid("ev"), kind: "documento", name: "registro_contratista.pdf", size: "540 KB", at: daysAgo(5, 13, 45) },
    ],
    timeline: [
      ev("creado", 5, "Hugo Reyna", "reportante", "Incumplimiento registrado"),
      ev("info_solicitada", 2, "M. Falcón", "seguridad", "Información solicitada al reportante", "Se requiere detallar personal involucrado y copia del permiso de trabajo."),
    ],
    pendingInfoRequest: {
      question:
        "Detallar personal de contratista involucrado y adjuntar copia del permiso de trabajo firmado.",
      requestedAt: daysAgo(2, 9, 15),
    },
    slaDueDate: daysAhead(1),
    createdAt: daysAgo(5),
  },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: uid("nt"),
    caseId: "EXP-2026-00008",
    title: "Caso crítico pendiente de revisión",
    body: "Sobrecarga eléctrica en Subestación Matellini — prioridad crítica.",
    at: daysAgo(1, 6, 55),
    read: false,
    audience: "seguridad",
    kind: "critical",
  },
  {
    id: uid("nt"),
    caseId: "EXP-2026-00014",
    title: "Caso derivado a Mantenimiento",
    body: "Se asignó EXP-2026-00014 a Jorge Salazar. Correo enviado.",
    at: daysAgo(1, 9, 30),
    read: false,
    audience: "both",
    kind: "success",
  },
  {
    id: uid("nt"),
    caseId: "EXP-2026-00006",
    title: "Solicitud de información pendiente",
    body: "Seguridad Operativa solicita detallar personal y permiso de trabajo.",
    at: daysAgo(2, 9, 15),
    read: false,
    audience: "reportante",
    kind: "warning",
  },
  {
    id: uid("nt"),
    caseId: "EXP-2026-00011",
    title: "Plan de acción aprobado",
    body: "El plan para EXP-2026-00011 fue aprobado. Inicia ejecución.",
    at: daysAgo(3, 9, 30),
    read: true,
    audience: "both",
    kind: "success",
  },
  {
    id: uid("nt"),
    caseId: "EXP-2026-00009",
    title: "Caso cerrado",
    body: "EXP-2026-00009 cerrado. Historial archivado.",
    at: daysAgo(1, 16, 5),
    read: false,
    audience: "seguridad",
    kind: "info",
  },
];



