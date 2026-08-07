import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowRight,
  FileSearch,
  Filter,
  Download,
  Inbox,
  Clock,
  Send,
  Activity,
  CheckCircle2,
  FolderKanban,
  ChevronDown,
  ClipboardList,
  Calendar,
  UserCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select, Textarea } from "@/design-system/primitives/Input";
import { Modal } from "@/design-system/primitives/Modal";
import { PriorityPill, StagePill, Pill, RiskPill } from "@/design-system/primitives/Pill";
import { EmptyState } from "@/design-system/primitives/Progress";
import {
  AREA_LABELS,
  EVENT_LABELS,
  PRIORITY_LABELS,
  STAGE_LABELS,
  STATIONS,
  TIPO_SOP_LABELS,
  SUBTIPO_SOP_LABELS,
  type Stage,
  type TipoSOP,
  type Area,
} from "@/lib/types";
import { cn, formatDate, relativeTime, slaState, daysUntil, PRIORITY_RANK, uid } from "@/lib/utils";

const FILTER_TABS: { id: string; label: string; stages: Stage[] | "all" | "extension" }[] = [
  { id: "todos", label: "Todos", stages: "all" },
  { id: "nuevos", label: "Reportes Nuevos", stages: ["recepcion", "evaluacion"] },
  { id: "pendientes", label: "Reportes Pendientes", stages: ["pendiente_info"] },
  { id: "proceso", label: "Reportes en proceso", stages: ["plan_accion", "ejecucion"] },
  { id: "prorrogas", label: "Prórrogas Solicitadas", stages: "extension" },
  { id: "investigacion", label: "En Investigación", stages: ["investigacion"] },
  { id: "verificacion", label: "En Verificación", stages: ["verificacion"] },
  { id: "cerrados", label: "Reportes Cerrados", stages: ["cierre", "rechazado"] },
];

// Solo filtros que NO están en el sidebar para visualización
const VISUAL_FILTERS = [
  { id: "todos", label: "Todos", stages: "all" },
  { id: "prorrogas", label: "Prórrogas Solicitadas", stages: "extension" },
  { id: "investigacion", label: "En Investigación", stages: ["investigacion"] },
  { id: "verificacion", label: "En Verificación", stages: ["verificacion"] },
];

const TYPE_TONE: Record<string, string> = {
  accidente: "bg-critical-soft text-critical-ink",
  incidente: "bg-warning-soft text-warning-ink",
  falla_operativa: "bg-info-soft text-info-ink",
  condicion_insegura: "bg-warning-soft text-warning-ink",
  acto_inseguro: "bg-warning-soft text-warning-ink",
  observacion: "bg-brand-50 text-brand-800",
  riesgo: "bg-critical-soft text-critical-ink",
  hallazgo: "bg-info-soft text-info-ink",
  incumplimiento: "bg-critical-soft text-critical-ink",
  otro: "bg-surface-2 text-ink-soft",
};

export function CaseList() {
  const { cases, createReport } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get("filtro") ?? "todos";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [sort, setSort] = useState<"recent" | "priority" | "sla">("recent");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Estado del formulario de reporte
  const [reportForm, setReportForm] = useState({
    type: "hallazgo" as TipoSOP | "otro" | "condicion_insegura" | "acto_inseguro",
    locationType: "estacion" as "estacion" | "patio_taller",
    station: "",
    location: "",
    description: "",
    evidence: [] as File[],
    assignedTo: "", // Para asignar a un miembro de SO
    anonymous: false,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const setFilter = (id: string) => {
    setParams(id === "todos" ? {} : { filtro: id });
  };

  const filtered = useMemo(() => {
    const cfg = FILTER_TABS.find((f) => f.id === tab) ?? FILTER_TABS[0];
    let list = cases;
    if (cfg.stages === "extension") {
      list = list.filter((c) => c.extensionRequest && !c.extensionRequest.decision);
    } else if (cfg.stages !== "all") {
      list = list.filter((c) => cfg.stages!.includes(c.stage));
    }
    if (areaFilter) list = list.filter((c) => c.area === areaFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.station.toLowerCase().includes(q) ||
          c.reporter.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "priority") {
      sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    } else if (sort === "sla") {
      sorted.sort((a, b) => +new Date(a.slaDueDate) - +new Date(b.slaDueDate));
    } else {
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return sorted;
  }, [cases, tab, areaFilter, query, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    FILTER_TABS.forEach((f) => {
      if (f.stages === "all") map[f.id] = cases.length;
      else if (f.stages === "extension") map[f.id] = cases.filter((c) => c.extensionRequest && !c.extensionRequest.decision).length;
      else map[f.id] = cases.filter((c) => f.stages!.includes(c.stage)).length;
    });
    return map;
  }, [cases]);

  return (
    <SegShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Gestión de Reportes</h1>
          <p className="text-[13px] text-ink-quiet mt-1">
            Todos los reportes del sistema. Abra el expediente para gestionar el flujo completo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setReportModalOpen(true)}>
            <Send className="h-4 w-4" /> Nuevo Reporte
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Exportar lista
          </Button>
        </div>
      </div>

      {/* Filter tabs - solo filtros únicos (no duplicados con sidebar) */}
      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-line overflow-x-auto scrollbar-none">
          {VISUAL_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-9 px-3.5 rounded-lg text-[12.5px] font-medium transition-all flex items-center gap-2 whitespace-nowrap",
                tab === f.id ? "bg-brand-700 text-white shadow-sm" : "text-ink-soft hover:bg-surface"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "tabular-nums text-[10.5px] px-1.5 rounded-full",
                  tab === f.id ? "bg-white/20" : "bg-surface-2 text-ink-quiet"
                )}
              >
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <Card className="mt-4 p-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 h-9 px-3 rounded-lg bg-surface border border-line">
          <Search className="h-4 w-4 text-ink-faint shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, título, estación o reportante…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-faint"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            value={areaFilter}
            onChange={setAreaFilter}
            options={[{ value: "", label: "Todas las áreas" }, ...Object.entries(AREA_LABELS).map(([value, label]) => ({ value, label }))]}
          />
          <FilterSelect
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={[
              { value: "recent", label: "Más recientes" },
              { value: "priority", label: "Por prioridad" },
              { value: "sla", label: "Por SLA" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padded={false} className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/60 border-b border-line">
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[120px]">Código</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[120px]">Tipo</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint">Título</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[120px]">Reportante</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[120px]">Estación</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[100px]">Riesgo</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[120px]">Estado</th>
                <th className="px-4 py-3 text-[11px] font-semibold tracking-wide uppercase text-ink-faint w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((c) => {
                const sla = slaState(c.slaDueDate, c.stage);
                const days = daysUntil(c.slaDueDate);
                const isExpanded = expandedId === c.id;
                const hasPlan = (c.actionPlans && c.actionPlans.length > 0) || c.sop?.planCodigo;
                return (
                  <>
                    <tr key={c.id} className="group hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link to={`/seguridad/casos/${c.id}`} className="font-mono text-[18px] font-bold text-brand-700 hover:underline cursor-pointer">
                          {c.id}
                        </Link>
                        <p className="text-[10.5px] text-ink-faint mt-0.5">{formatDate(c.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex px-2 py-1 rounded-md text-[11px] font-medium", TYPE_TONE[c.type])}>
                          {EVENT_LABELS[c.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[320px]">
                        <p className="text-[13px] font-semibold text-ink truncate">{c.title}</p>
                        <p className="text-[11px] text-ink-quiet truncate mt-0.5">{c.location}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12.5px] text-ink-soft truncate">{c.reporter}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12.5px] text-ink-soft truncate">{c.station}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        {c.riskLevel ? <RiskPill risk={c.riskLevel} /> : <span className="text-[11px] text-ink-faint">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <StagePill stage={c.stage} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link to={`/seguridad/casos/${c.id}`} className="text-[12.5px] font-medium text-brand-700 hover:underline">
                            Ver detalle
                          </Link>
                          {c.stage === "recepcion" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                              Aprobar
                            </Button>
                          )}
                          {c.stage === "investigacion" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                              Solicitar plan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && hasPlan && (
                      <tr key={`${c.id}-expanded`} className="bg-surface/60">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="rounded-xl border border-line bg-white p-4">
                            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3 flex items-center gap-1.5">
                              <ClipboardList className="h-3.5 w-3.5" /> Planes de Acción asociados
                            </p>
                            <div className="space-y-2">
                              {/* Plan principal del expediente */}
                              {c.actionPlans && c.actionPlans.length > 0 && c.actionPlans.map((plan, idx) => (
                                <div key={idx} className="flex items-start gap-3 rounded-lg border border-line-soft p-3 hover:bg-surface/40 transition-colors">
                                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                                    <ClipboardList className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[12px] font-semibold text-brand-700">
                                        {plan.planCode || `PLA-${c.id}-${idx + 1}`}
                                      </span>
                                      <Pill tone={plan.reviewDecision === "aprobado" ? "brand" : plan.reviewDecision === "rechazado" ? "critical" : "warning"} dot>
                                        {plan.reviewDecision === "aprobado" ? "Aprobado" : plan.reviewDecision === "rechazado" ? "Rechazado" : "Pendiente"}
                                      </Pill>
                                    </div>
                                    <p className="text-[12.5px] text-ink-soft mt-1 truncate">{plan.description || "Sin descripción"}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-quiet">
                                      <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {plan.elaboratedBy}</span>
                                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(plan.startDate)} → {formatDate(plan.dueDate)}</span>
                                      <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {plan.items.length} actividades</span>
                                    </div>
                                  </div>
                                  <Link to={`/seguridad/casos/${c.id}`}>
                                    <Button variant="ghost" size="sm">
                                      Ver <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                </div>
                              ))}
                              {/* Plan desde campo SOP */}
                              {!(c.actionPlans && c.actionPlans.length > 0) && c.sop?.planCodigo && (
                                <div className="flex items-start gap-3 rounded-lg border border-line-soft p-3">
                                  <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                                    <ClipboardList className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[12px] font-semibold text-brand-700">{c.sop.planCodigo}</span>
                                      <Pill tone={c.sop.planEstado === "cerrado" ? "brand" : "warning"} dot>
                                        {c.sop.planEstado === "cerrado" ? "Cerrado" : "Pendiente"}
                                      </Pill>
                                    </div>
                                    {c.sop.planDescripcion && <p className="text-[12.5px] text-ink-soft mt-1">{c.sop.planDescripcion}</p>}
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-quiet">
                                      {c.sop.planResponsable && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {c.sop.planResponsable}</span>}
                                      {c.sop.planFecha && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(c.sop.planFecha)}</span>}
                                      {c.sop.planFechaProgramada && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Programada: {formatDate(c.sop.planFechaProgramada)}</span>}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            className="m-4 border-0 bg-transparent"
            icon={<FolderKanban className="h-5 w-5" />}
            title="No hay casos en este filtro"
            description="Ajuste los filtros o el término de búsqueda para ver resultados."
          />
        )}
      </Card>

      <p className="mt-3 text-[11.5px] text-ink-quiet">
        Mostrando {filtered.length} de {cases.length} casos · Última actualización {relativeTime(new Date().toISOString())}
      </p>

      {/* Modal para crear nuevo reporte */}
      <Modal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Crear Nuevo Reporte"
        subtitle="Complete el formulario para registrar un nuevo reporte desde Seguridad Operativa"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReportModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => {
                const typeLabel = reportForm.type === "otro" ? "Otro" :
                                 reportForm.type === "condicion_insegura" ? "Condición Insegura" :
                                 reportForm.type === "acto_inseguro" ? "Acto Inseguro" :
                                 EVENT_LABELS[reportForm.type as TipoSOP];
                const locationLabel = reportForm.locationType === "patio_taller" ? reportForm.station :
                                      reportForm.locationType === "estacion" ? 
                                      (reportForm.station + (reportForm.location ? ` · ${reportForm.location}` : "")) : "";
                
                createReport({
                  type: reportForm.type === "otro" ? "hallazgo" as TipoSOP :
                        reportForm.type === "condicion_insegura" ? "hallazgo" as TipoSOP :
                        reportForm.type === "acto_inseguro" ? "hallazgo" as TipoSOP :
                        reportForm.type as TipoSOP,
                  title: `${typeLabel} en ${locationLabel}`,
                  description: reportForm.description.trim(),
                  observations: "",
                  area: "operaciones" as Area,
                  station: reportForm.station,
                  location: "",
                  date: new Date().toISOString().slice(0, 10),
                  time: new Date().toTimeString().slice(0, 5),
                  priority: "media",
                  riskLevel: undefined as any,
                  evidence: [],
                  reporter: "Seguridad Operativa",
                  anonymous: false,
                  contactName: undefined,
                  contactEmail: undefined,
                  contactPhone: undefined,
                  assignee: reportForm.assignedTo || undefined,
                  assigneeArea: reportForm.assignedTo ? "operaciones" as Area : undefined,
                });
                setReportModalOpen(false);
                setReportForm({
                  type: "hallazgo",
                  locationType: "estacion",
                  station: "",
                  location: "",
                  description: "",
                  evidence: [],
                  assignedTo: "",
                });
              }}
              disabled={!reportForm.description.trim() || (reportForm.locationType === "estacion" && !reportForm.station)}
            >
              <Send className="h-4 w-4" /> Crear Reporte
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Tipo de reporte" required>
            <Select 
              value={reportForm.type} 
              onChange={(e) => setReportForm({...reportForm, type: e.target.value as TipoSOP | "otro" | "condicion_insegura" | "acto_inseguro"})}
            >
              <option value="accidente">Accidente</option>
              <option value="incidente">Incidente</option>
              <option value="condicion_insegura">Condición Insegura</option>
              <option value="hallazgo">Hallazgo</option>
              <option value="acto_inseguro">Acto Inseguro</option>
              <option value="otro">Otro</option>
            </Select>
          </Field>

          <Field label="Ubicación" required>
            <Select 
              value={reportForm.locationType} 
              onChange={(e) => setReportForm({...reportForm, locationType: e.target.value as "estacion" | "patio_taller"})}
            >
              <option value="estacion">Estación</option>
              <option value="patio_taller">Patio Taller</option>
            </Select>
          </Field>

          {reportForm.locationType === "estacion" && (
            <Field label="Estación" required>
              <Select 
                value={reportForm.station} 
                onChange={(e) => setReportForm({...reportForm, station: e.target.value})}
              >
                <option value="">Seleccionar estación...</option>
                {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          )}

          {reportForm.locationType === "patio_taller" && (
            <Field label="Patio Taller" required>
              <Select 
                value={reportForm.station} 
                onChange={(e) => setReportForm({...reportForm, station: e.target.value})}
              >
                <option value="">Seleccionar patio taller...</option>
                <option value="Taller Villa El Salvador">Taller Villa El Salvador</option>
                <option value="Taller Bayóvar">Taller Bayóvar</option>
              </Select>
            </Field>
          )}

          <Field label="Descripción del evento" required>
            <Textarea
              value={reportForm.description}
              onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
              rows={4}
              placeholder="Describa detalladamente lo sucedido..."
            />
          </Field>

          <Field label="Asignar a (Seguridad Operativa)">
            <Select 
              value={reportForm.assignedTo} 
              onChange={(e) => setReportForm({...reportForm, assignedTo: e.target.value})}
            >
              <option value="">Sin asignar (se asignará automáticamente)</option>
              <option value="Antonio Rebaza Lizaraso">Antonio Rebaza Lizaraso</option>
              <option value="Carlos Barreda Torres">Carlos Barreda Torres</option>
              <option value="Emerson Navarrete Sotelo">Emerson Navarrete Sotelo</option>
              <option value="Gabriel Ferreira Acosta">Gabriel Ferreira Acosta</option>
              <option value="Hector Hinostroza Mansilla">Hector Hinostroza Mansilla</option>
              <option value="Jesus Alejandro Vielma Ochoa">Jesus Alejandro Vielma Ochoa</option>
              <option value="Jorge Arévalo Angeles">Jorge Arévalo Angeles</option>
              <option value="Jose Pacombia Pocohuanca">Jose Pacombia Pocohuanca</option>
              <option value="Juan Castro Velazco">Juan Castro Velazco</option>
              <option value="Karen Peralta Canchis">Karen Peralta Canchis</option>
              <option value="Louana Martel Ramos">Louana Martel Ramos</option>
              <option value="Maximo Jesús Alvarez Garcia">Maximo Jesús Alvarez Garcia</option>
              <option value="Roberto Pomar Roman">Roberto Pomar Roman</option>
              <option value="Ruben Francisco Luque Carbajal">Ruben Francisco Luque Carbajal</option>
              <option value="Teófilo De La Mata Luque">Teófilo De La Mata Luque</option>
              <option value="Victor Ruiz Micha">Victor Ruiz Micha</option>
              <option value="Anderson Sandoval Ramirez">Anderson Sandoval Ramirez</option>
            </Select>
          </Field>

          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-[11px] text-ink-faint">
              <strong>Reportante:</strong> Seguridad Operativa (usuario autenticado)
            </p>
          </div>
        </div>
      </Modal>
    </SegShell>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-lg bg-white border border-line text-[12.5px] text-ink-soft appearance-none cursor-pointer hover:border-line-strong focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23767f79' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
          backgroundPosition: "right 8px center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

