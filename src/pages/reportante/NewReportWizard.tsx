import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Train,
  Type,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ReportanteShell } from "@/design-system/layout/ReportanteShell";
import { Button } from "@/design-system/primitives/Button";
import { Card } from "@/design-system/primitives/Card";
import { Field, Input, Select, Textarea } from "@/design-system/primitives/Input";
import { Pill } from "@/design-system/primitives/Pill";
import { cn, uid } from "@/lib/utils";
import {
  AREA_LABELS,
  EVENT_LABELS,
  PRIORITY_LABELS,
  STATIONS,
  type Area,
  type Evidence,
  type EventType,
  type Priority,
} from "@/lib/types";

const STEPS = [
  { id: 0, label: "Tipo", icon: Tag },
  { id: 1, label: "Ubicación", icon: MapPin },
  { id: 2, label: "Detalle", icon: Type },
  { id: 3, label: "Evidencias", icon: Upload },
  { id: 4, label: "Revisión", icon: CheckCircle2 },
] as const;

const EVENT_OPTIONS: { value: EventType; hint: string }[] = [
  { value: "accidente", hint: "Lesión o daño a personas/instalaciones" },
  { value: "incidente", hint: "Evento que pudo derivar en accidente" },
  { value: "observacion", hint: "Comportamiento o situación detectada" },
  { value: "condicion_insegura", hint: "Estado físico con potencial de riesgo" },
  { value: "acto_inseguro", hint: "Acción fuera de procedimiento" },
  { value: "falla_operativa", hint: "Falla de equipo o sistema" },
  { value: "riesgo", hint: "Situación con potencial de daño" },
  { value: "hallazgo", hint: "Detección de auditoría o inspección" },
  { value: "incumplimiento", hint: "No conformidad de procedimiento" },
  { value: "otro", hint: "Otro evento relacionado" },
];

export function NewReportWizard() {
  const navigate = useNavigate();
  const { createReport, currentUser } = useStore();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    type: "" as EventType | "",
    title: "",
    area: "" as Area | "",
    station: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    description: "",
    observations: "",
    priority: "media" as Priority,
    evidence: [] as Evidence[],
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = (() => {
    switch (step) {
      case 0:
        return !!form.type;
      case 1:
        return !!form.area && !!form.station && form.location.trim().length > 0;
      case 2:
        return form.description.trim().length >= 10;
      default:
        return true;
    }
  })();

  const next = () => canNext && setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const addMockEvidence = (kind: Evidence["kind"]) => {
    const names: Record<Evidence["kind"], [string, string]> = {
      foto: ["evidencia_foto.jpg", "2.4 MB"],
      video: ["evidencia_video.mp4", "14.8 MB"],
      documento: ["documento_apoyo.pdf", "640 KB"],
    };
    const [name, size] = names[kind];
    set("evidence", [
      ...form.evidence,
      { id: uid("ev"), kind, name: name.replace(/(\.\w+)$/, `_${form.evidence.length + 1}$1`), size, at: new Date().toISOString() },
    ]);
  };

  const removeEvidence = (id: string) =>
    set("evidence", form.evidence.filter((e) => e.id !== id));

  const submit = () => {
    const newCase = createReport({
      type: form.type as EventType,
      title: form.title.trim() || `${EVENT_LABELS[form.type as EventType]} en ${form.station}`,
      description: form.description,
      observations: form.observations,
      area: form.area as Area,
      station: form.station,
      location: form.location,
      date: form.date,
      time: form.time,
      priority: form.priority,
      evidence: form.evidence,
      reporter: currentUser.name,
    });
    navigate(`/reportante/mis-reportes?nuevo=${newCase.id}`);
  };

  return (
    <ReportanteShell>
      {/* Wizard header */}
      <div className="rounded-2xl bg-white border border-line p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-700">
              Nuevo reporte · Asistente
            </p>
            <h1 className="mt-1 text-[22px] font-bold text-ink tracking-tight">
              Registrar una incidencia
            </h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Complete los pasos en menos de un minuto. Al finalizar se generará el código del caso.
            </p>
          </div>
          <Pill tone="brand" dot>
            Paso {step + 1} de {STEPS.length}
          </Pill>
        </div>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div
                  className={cn(
                    "h-9 px-3 rounded-full flex items-center gap-2 text-[12px] font-medium transition-all",
                    done && "bg-brand-700 text-white",
                    active && "bg-brand-50 text-brand-800 ring-1 ring-brand-200",
                    !done && !active && "bg-surface-2 text-ink-faint"
                  )}
                >
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full grid place-items-center text-[11px]",
                      done && "bg-white/20",
                      active && "bg-brand-700 text-white",
                      !done && !active && "bg-white text-ink-faint"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-1 rounded-full", done ? "bg-brand-700" : "bg-line")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div className="mt-5">
        {step === 0 && (
          <StepCard
            eyebrow="Paso 1"
            title="¿Qué tipo de evento reporta?"
            description="Seleccione la categoría que mejor describa la situación. Esto define el flujo del caso."
          >
            <div className="grid sm:grid-cols-2 gap-2.5">
              {EVENT_OPTIONS.map((opt) => {
                const active = form.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => set("type", opt.value)}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all flex items-start gap-3",
                      active
                        ? "border-brand-600 bg-brand-50 ring-1 ring-brand-200"
                        : "border-line bg-white hover:border-line-strong hover:bg-surface/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                        active ? "bg-brand-700 text-white" : "bg-surface-2 text-ink-soft"
                      )}
                    >
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-ink">{EVENT_LABELS[opt.value]}</p>
                      <p className="text-[11.5px] text-ink-quiet mt-0.5">{opt.hint}</p>
                    </div>
                    {active && <Check className="h-4 w-4 text-brand-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard
            eyebrow="Paso 2"
            title="¿Dónde ocurrió?"
            description="Identifique el área responsable y la ubicación exacta dentro de la red de Línea 1."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Área relacionada" required>
                <Select value={form.area} onChange={(e) => set("area", e.target.value as Area)}>
                  <option value="">Seleccione un área…</option>
                  {(Object.keys(AREA_LABELS) as Area[]).map((a) => (
                    <option key={a} value={a}>{AREA_LABELS[a]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Estación" required>
                <Select value={form.station} onChange={(e) => set("station", e.target.value)}>
                  <option value="">Seleccione una estación…</option>
                  {STATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Ubicación específica" required className="sm:col-span-2" hint="Ej. Plataforma sur · vía 2, Andén central, Sala de tableros">
                <Input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Describa el punto exacto dentro de la estación"
                />
              </Field>
            </div>

            {/* Mini map / station preview */}
            <div className="mt-5 rounded-xl bg-surface border border-line p-4">
              <div className="flex items-center gap-2 text-[12px] text-ink-quiet mb-3">
                <Train className="h-4 w-4 text-brand-700" />
                <span>Recorrido Línea 1 — selección actual</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {STATIONS.map((s, i) => {
                  const active = form.station === s;
                  return (
                    <div key={s} className="flex items-center shrink-0">
                      <div
                        className={cn(
                          "px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all",
                          active ? "bg-brand-700 text-white" : "bg-white border border-line text-ink-quiet"
                        )}
                      >
                        {s}
                      </div>
                      {i < STATIONS.length - 1 && (
                        <div className={cn("h-0.5 w-4", active ? "bg-brand-600" : "bg-line")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard
            eyebrow="Paso 3"
            title="Describa la situación"
            description="Cuanto más contexto aporte, más ágil será la gestión por Seguridad Operativa."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Fecha del evento" required>
                <div className="relative">
                  <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
                </div>
              </Field>
              <Field label="Hora del evento" required>
                <div className="relative">
                  <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
                </div>
              </Field>
              <Field label="Título breve" className="sm:col-span-2" hint="Opcional — se sugiere automáticamente si lo deja vacío">
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ej. Resbalón en plataforma sur por humedad"
                  maxLength={90}
                />
              </Field>
              <Field label="Descripción detallada" required className="sm:col-span-2" hint={`${form.description.length} caracteres · mínimo 10`}>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="¿Qué ocurrió? ¿Qué condiciones estaban presentes? ¿Hubo personas involucradas?"
                  rows={5}
                />
              </Field>
              <Field label="Observaciones adicionales" className="sm:col-span-2">
                <Textarea
                  value={form.observations}
                  onChange={(e) => set("observations", e.target.value)}
                  placeholder="Cualquier información complementaria que ayude al análisis…"
                  rows={3}
                />
              </Field>
              <Field label="Prioridad sugerida" className="sm:col-span-2">
                <div className="flex gap-2 flex-wrap">
                  {(["critica", "alta", "media", "baja"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => set("priority", p)}
                      className={cn(
                        "px-3.5 h-10 rounded-lg text-[12.5px] font-medium border transition-all flex items-center gap-2",
                        form.priority === p
                          ? p === "critica"
                            ? "border-critical bg-critical-soft text-critical-ink"
                            : p === "alta"
                            ? "border-warning bg-warning-soft text-warning-ink"
                            : p === "media"
                            ? "border-info bg-info-soft text-info-ink"
                            : "border-line-strong bg-surface-2 text-ink"
                          : "border-line bg-white text-ink-soft hover:bg-surface/50"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", p === "critica" ? "bg-critical" : p === "alta" ? "bg-warning" : p === "media" ? "bg-info" : "bg-ink-faint")} />
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard
            eyebrow="Paso 4"
            title="Adjunte evidencias"
            description="Fotografías, videos o documentos que respalden el reporte. Opcional pero altamente recomendado."
          >
            <div className="rounded-xl border-2 border-dashed border-line-strong bg-surface/50 p-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-white border border-line grid place-items-center text-brand-700 mx-auto">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[13.5px] font-medium text-ink">Arrastre archivos o adjunte desde su equipo</p>
              <p className="text-[12px] text-ink-quiet mt-1">JPG, PNG, MP4, PDF · hasta 25 MB por archivo</p>
              <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => addMockEvidence("foto")}>
                  <ImageIcon className="h-4 w-4" /> Simular foto
                </Button>
                <Button variant="outline" size="sm" onClick={() => addMockEvidence("video")}>
                  <Video className="h-4 w-4" /> Simular video
                </Button>
                <Button variant="outline" size="sm" onClick={() => addMockEvidence("documento")}>
                  <FileText className="h-4 w-4" /> Simular documento
                </Button>
              </div>
            </div>

            {form.evidence.length > 0 && (
              <div className="mt-4 space-y-2">
                {form.evidence.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-line">
                    <div className="h-9 w-9 rounded-lg bg-surface-2 text-ink-soft grid place-items-center shrink-0">
                      {ev.kind === "foto" ? <ImageIcon className="h-4 w-4" /> : ev.kind === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-ink truncate">{ev.name}</p>
                      <p className="text-[11px] text-ink-quiet">{ev.size}</p>
                    </div>
                    <button
                      onClick={() => removeEvidence(ev.id)}
                      className="h-8 w-8 grid place-items-center rounded-md text-ink-faint hover:bg-surface-2 hover:text-critical transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </StepCard>
        )}

        {step === 4 && (
          <StepCard
            eyebrow="Paso 5"
            title="Revise y envíe"
            description="Verifique la información antes de registrar el caso. Al enviar, el sistema generará el código automáticamente."
          >
            <div className="rounded-xl bg-surface border border-line p-5">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                <ReviewRow label="Tipo de evento" value={EVENT_LABELS[form.type as EventType]} />
                <ReviewRow label="Prioridad" value={PRIORITY_LABELS[form.priority]} />
                <ReviewRow label="Área" value={AREA_LABELS[form.area as Area]} />
                <ReviewRow label="Estación" value={form.station} />
                <ReviewRow label="Ubicación" value={form.location} />
                <ReviewRow label="Fecha y hora" value={`${form.date} · ${form.time}`} />
                <ReviewRow label="Título" value={form.title || `${EVENT_LABELS[form.type as EventType]} en ${form.station}`} full />
                <ReviewRow label="Descripción" value={form.description} full />
                {form.observations && <ReviewRow label="Observaciones" value={form.observations} full />}
                <ReviewRow label="Evidencias" value={`${form.evidence.length} archivo(s)`} />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-brand-50 border border-brand-200 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-brand-800">
                Al enviar, el caso ingresa al sistema con estado <strong>Nuevo</strong> y notifica
                automáticamente al área de Seguridad Operativa para iniciar la revisión.
              </p>
            </div>
          </StepCard>
        )}
      </div>

      {/* Wizard footer */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canNext}>
            Continuar <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={!canNext}>
            <Check className="h-4 w-4" /> Enviar reporte
          </Button>
        )}
      </div>
    </ReportanteShell>
  );
}

function StepCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="animate-[riseUp_0.3s_ease-out]">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-700">{eyebrow}</p>
      <h2 className="mt-1 text-[19px] font-bold text-ink tracking-tight">{title}</h2>
      <p className="text-[13px] text-ink-quiet mt-1 mb-5">{description}</p>
      {children}
    </Card>
  );
}

function ReviewRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn(full && "sm:col-span-2")}>
      <p className="text-[11px] font-medium tracking-wide uppercase text-ink-faint">{label}</p>
      <p className="text-[13.5px] text-ink mt-1 leading-snug">{value || "—"}</p>
    </div>
  );
}
