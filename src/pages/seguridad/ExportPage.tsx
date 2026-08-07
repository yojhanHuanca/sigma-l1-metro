import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileBarChart, Check, Filter, Calendar, Building2, Tag, Clock, Layers } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Select } from "@/design-system/primitives/Input";
import { Pill } from "@/design-system/primitives/Pill";
import { cn, formatDate } from "@/lib/utils";
import { AREA_LABELS, EVENT_LABELS, STAGE_LABELS, type Stage } from "@/lib/types";

const FORMATS = [
  { id: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet, hint: "Hoja de cálculo con columnas y filtros" },
  { id: "pdf", label: "PDF (.pdf)", icon: FileText, hint: "Reporte ejecutivo formateado" },
  { id: "csv", label: "CSV (.csv)", icon: FileBarChart, hint: "Datos crudos para importar en otros sistemas" },
] as const;

const RANGES = [
  { id: "all", label: "Todo el histórico" },
  { id: "365", label: "Último año" },
  { id: "90", label: "Últimos 90 días" },
  { id: "30", label: "Últimos 30 días" },
  { id: "7", label: "Últimos 7 días" },
  { id: "today", label: "Hoy" },
  { id: "custom", label: "Rango personalizado" },
];

export function ExportPage() {
  const { cases } = useStore();
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("xlsx");
  const [range, setRange] = useState("all");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [stage, setStage] = useState<Stage | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState("");
  const [done, setDone] = useState(false);

  const filtered = cases.filter((c) => {
    if (type && c.type !== type) return false;
    if (area && c.area !== area) return false;
    if (stage && c.stage !== stage) return false;
    
    // Filtro por rango de fechas
    if (range === "today") {
      const today = new Date().toISOString().slice(0, 10);
      if (c.createdAt.slice(0, 10) !== today) return false;
    } else if (range === "7") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      if (c.createdAt < sevenDaysAgo) return false;
    } else if (range === "30") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      if (c.createdAt < thirtyDaysAgo) return false;
    } else if (range === "90") {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
      if (c.createdAt < ninetyDaysAgo) return false;
    } else if (range === "365") {
      const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString();
      if (c.createdAt < oneYearAgo) return false;
    } else if (range === "custom" && startDate && endDate) {
      if (c.createdAt < startDate || c.createdAt > endDate) return false;
    }
    
    return true;
  });

  const fields = [
    // Campos principales del caso
    "Código SOP", "Tipo de SOP", "Título", "Descripción", "Área", "Estación", "Ubicación",
    "Fecha del hallazgo", "Fecha de evento", "Estado de hallazgo", "Días abierto", "Procedencia",
    "Tipo", "Responsable de Hallazgo", "Tipo de SOP", "Subtipo SOP", "Peligro", "Consecuencia",
    "Análisis de riesgo", "ACR", "Plan de Acción", "Descripción de Plan de Acción",
    "Responsable Plan de Acción", "Estado Plan de acción", "Fecha de plan", "Fecha programada",
    "Días abierto plan de acción", "Anexos",
    // Campos de Lista de Eventos
    "Fecha evento", "Hora de evento", "Año", "Mes", "Semana", "Día", "Rango horario",
    "Tipo de incidente operativo", "Descripción del evento", "Ubicación incidente", "Tipo de vía",
    "Dirección de vía", "Lugar de Incidente", "Modelo MR", "Nro. MR", "Nro. Carrera",
    "Personal o falla Involucrado", "Tipo Causa", "Posible Causa", "Información adicional",
    "Cámara monitoreada", "DEMORA",
    // Campos de gestión
    "Prioridad", "Estado del caso", "Reportante", "Asignado a", "SLA vence", "Creado",
  ];

  return (
    <SegShell>
      <div>
        <h1 className="text-[22px] font-bold text-ink tracking-tight">Exportar reportes</h1>
        <p className="text-[13px] text-ink-quiet mt-1">Genere un archivo con los casos filtrados para análisis externo o auditoría.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader icon={<FileText className="h-4.5 w-4.5" />} title="Formato de exportación" subtitle="Seleccione el tipo de archivo" />
            <div className="grid sm:grid-cols-3 gap-3">
              {FORMATS.map((f) => {
                const active = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all",
                      active ? "border-brand-600 bg-brand-50 ring-1 ring-brand-200" : "border-line bg-white hover:border-line-strong"
                    )}
                  >
                    <div className={cn("h-9 w-9 rounded-lg grid place-items-center", active ? "bg-brand-700 text-white" : "bg-surface-2 text-ink-soft")}>
                      <f.icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="mt-3 text-[13px] font-semibold text-ink">{f.label}</p>
                    <p className="text-[11.5px] text-ink-quiet mt-0.5">{f.hint}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Filter className="h-4.5 w-4.5" />} title="Filtros" subtitle="Acote el conjunto de casos a exportar" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Rango de fechas">
                <Select value={range} onChange={(e) => setRange(e.target.value)}>
                  {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </Select>
              </Field>
              {range === "custom" && (
                <>
                  <Field label="Fecha inicio">
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-md text-sm"
                    />
                  </Field>
                  <Field label="Fecha fin">
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-md text-sm"
                    />
                  </Field>
                </>
              )}
              <Field label="Tipo de evento">
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Todos</option>
                  {Object.entries(EVENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Área responsable">
                <Select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Todas</option>
                  {Object.entries(AREA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Estado del caso">
                <Select value={stage} onChange={(e) => setStage(e.target.value as Stage | "")}>
                  <option value="">Todos</option>
                  {Object.entries(STAGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Layers className="h-4.5 w-4.5" />} title="Campos incluidos" subtitle={`${fields.length} columnas disponibles`} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedFields(fields.length === selectedFields.length ? [] : fields)}
                  className="text-[11.5px] text-brand-700 hover:underline"
                >
                  {selectedFields.length === fields.length ? "Deseleccionar todos" : "Seleccionar todos"}
                </button>
                <span className="text-[11.5px] text-ink-faint">· {selectedFields.length} seleccionados</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {fields.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFields(prev => 
                        prev.includes(f) 
                          ? prev.filter(x => x !== f)
                          : [...prev, f]
                      );
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11.5px] border transition-colors",
                      selectedFields.includes(f) 
                        ? "border-brand-600 bg-brand-50 text-brand-700" 
                        : "border-line bg-white text-ink-soft hover:border-line-strong"
                    )}
                  >
                    {selectedFields.includes(f) && <Check className="h-3 w-3 inline mr-1" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Layers className="h-4.5 w-4.5" />} title="Agrupamiento" subtitle="Organizar datos por categoría" />
            <Field label="Agrupar por">
              <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">Sin agrupar</option>
                <option value="area">Por Área</option>
                <option value="tipo">Por Tipo de SOP</option>
                <option value="estado">Por Estado</option>
                <option value="estacion">Por Estación</option>
                <option value="fecha">Por Fecha</option>
              </Select>
            </Field>
          </Card>
        </div>

        {/* Summary / action */}
        <div className="space-y-5">
          <Card className="sticky top-24">
            <CardHeader icon={<Download className="h-4.5 w-4.5" />} title="Resumen de exportación" />
            <div className="space-y-3">
              <SummaryRow icon={<FileText className="h-3.5 w-3.5" />} label="Formato" value={FORMATS.find((f) => f.id === format)?.label ?? ""} />
              <SummaryRow icon={<Calendar className="h-3.5 w-3.5" />} label="Rango" value={RANGES.find((r) => r.id === range)?.label ?? ""} />
              <SummaryRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área" value={area ? AREA_LABELS[area as keyof typeof AREA_LABELS] : "Todas"} />
              <SummaryRow icon={<Layers className="h-3.5 w-3.5" />} label="Campos" value={`${selectedFields.length} de ${fields.length}`} />
              <SummaryRow icon={<Layers className="h-3.5 w-3.5" />} label="Agrupar por" value={groupBy ? groupBy : "Sin agrupar"} />
              <SummaryRow icon={<Clock className="h-3.5 w-3.5" />} label="Casos a exportar" value={`${filtered.length}`} highlight />
            </div>
            <div className="mt-5 pt-4 border-t border-line-soft">
              {done ? (
                <div className="rounded-lg bg-brand-50 border border-brand-200 p-3.5 flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-brand-700" />
                  <p className="text-[12.5px] text-brand-800">Archivo generado. (Demo — sin descarga real)</p>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setDone(true)}>
                  <Download className="h-4 w-4" /> Generar archivo
                </Button>
              )}
              <p className="text-[11px] text-ink-faint mt-2 text-center">La exportación respeta los filtros seleccionados.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview */}
      <Card className="mt-5" padded={false}>
        <div className="p-5 pb-3">
          <CardHeader icon={<FileSpreadsheet className="h-4.5 w-4.5" />} title={`Vista previa ${format === "xlsx" ? "Excel" : format === "pdf" ? "PDF" : "CSV"}`} subtitle={`${filtered.length} filas · primeros 3 casos · ${selectedFields.length} columnas seleccionadas`} className="mb-3" />
        </div>
        
        {/* Excel Preview */}
        {format === "xlsx" && (
          <div className="bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="h-5 w-5 text-green-700" />
              <span className="text-[13px] font-semibold text-green-800">Formato Excel (.xlsx)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-green-300">
                <thead>
                  <tr className="bg-green-100 border-b border-green-300 text-[10px] font-semibold uppercase tracking-wide text-green-900">
                    {selectedFields.length > 0 
                      ? selectedFields.slice(0, 6).map((f) => (
                          <th key={f} className="px-3 py-2 whitespace-nowrap border-r border-green-300">{f}</th>
                        ))
                      : ["Código", "Tipo", "Estación", "Área", "Estado", "Creado"].map((f) => (
                          <th key={f} className="px-3 py-2 whitespace-nowrap border-r border-green-300">{f}</th>
                        ))
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-200">
                  {filtered.length > 0 ? (
                    filtered.slice(0, 3).map((c) => (
                      <tr key={c.id} className="hover:bg-green-50">
                        {selectedFields.length > 0 ? (
                          selectedFields.slice(0, 6).map((f) => (
                            <td key={f} className="px-3 py-2 text-[11px] text-green-900 whitespace-nowrap border-r border-green-200">
                              {getFieldValue(c, f)}
                            </td>
                          ))
                        ) : (
                          <>
                            <td className="px-3 py-2 font-mono text-[11px] text-green-700 border-r border-green-200">{c.id}</td>
                            <td className="px-3 py-2 text-[11px] text-green-900 border-r border-green-200">{EVENT_LABELS[c.type as keyof typeof EVENT_LABELS]}</td>
                            <td className="px-3 py-2 text-[11px] text-green-900 border-r border-green-200">{c.station}</td>
                            <td className="px-3 py-2 text-[11px] text-green-900 border-r border-green-200">{AREA_LABELS[c.area as keyof typeof AREA_LABELS]}</td>
                            <td className="px-3 py-2 text-[11px] text-green-900 border-r border-green-200">{STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS]}</td>
                            <td className="px-3 py-2 text-[11px] text-green-700">{formatDate(c.createdAt)}</td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-green-700 text-[12px]">
                        No hay casos que coincidan con los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-green-700 mt-3">📁 Archivo con filas y columnas, filtros automáticos, formato de celdas y fórmulas</p>
          </div>
        )}

        {/* PDF Preview */}
        {format === "pdf" && (
          <div className="bg-gray-100 border border-gray-300 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-gray-700" />
              <span className="text-[13px] font-semibold text-gray-800">Formato PDF (.pdf)</span>
            </div>
            <div className="bg-white border border-gray-300 p-4 shadow-sm">
              <div className="text-center mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-[14px] font-bold text-gray-900">Reporte de Casos SIGMA L1</h3>
                <p className="text-[11px] text-gray-600">Generado: {new Date().toLocaleDateString('es-PE')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-[9px] font-semibold uppercase tracking-wide text-gray-900">
                      {selectedFields.length > 0 
                        ? selectedFields.slice(0, 5).map((f) => (
                            <th key={f} className="px-2 py-1.5 whitespace-nowrap border-r border-gray-300">{f}</th>
                          ))
                        : ["Código", "Tipo", "Estación", "Área", "Estado"].map((f) => (
                            <th key={f} className="px-2 py-1.5 whitespace-nowrap border-r border-gray-300">{f}</th>
                          ))
                      }
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.length > 0 ? (
                      filtered.slice(0, 3).map((c) => (
                        <tr key={c.id}>
                          {selectedFields.length > 0 ? (
                            selectedFields.slice(0, 5).map((f) => (
                              <td key={f} className="px-2 py-1.5 text-[9px] text-gray-900 whitespace-nowrap border-r border-gray-200">
                                {getFieldValue(c, f)}
                              </td>
                            ))
                          ) : (
                            <>
                              <td className="px-2 py-1.5 font-mono text-[9px] text-gray-700 border-r border-gray-200">{c.id}</td>
                              <td className="px-2 py-1.5 text-[9px] text-gray-900 border-r border-gray-200">{EVENT_LABELS[c.type as keyof typeof EVENT_LABELS]}</td>
                              <td className="px-2 py-1.5 text-[9px] text-gray-900 border-r border-gray-200">{c.station}</td>
                              <td className="px-2 py-1.5 text-[9px] text-gray-900 border-r border-gray-200">{AREA_LABELS[c.area as keyof typeof AREA_LABELS]}</td>
                              <td className="px-2 py-1.5 text-[9px] text-gray-900 border-r border-gray-200">{STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS]}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-600 text-[10px]">
                          No hay casos que coincidan con los filtros seleccionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <p className="text-[9px] text-gray-500">Página 1 de {Math.ceil(filtered.length / 20) || 1}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-700 mt-3">📄 Documento formateado para impresión, con encabezados, pies de página y paginación</p>
          </div>
        )}

        {/* CSV Preview */}
        {format === "csv" && (
          <div className="bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileBarChart className="h-5 w-5 text-blue-700" />
              <span className="text-[13px] font-semibold text-blue-800">Formato CSV (.csv)</span>
            </div>
            <div className="bg-white border border-blue-300 p-4 font-mono text-[10px]">
              <div className="text-blue-900 whitespace-pre-wrap">
                {selectedFields.length > 0 
                  ? selectedFields.slice(0, 4).join(",") + ",..."
                  : "Código,Tipo,Estación,Área,Estado,Creado"
                }
                {filtered.length > 0 ? (
                  filtered.slice(0, 3).map((c) => (
                    <div key={c.id}>
                      {selectedFields.length > 0 
                        ? selectedFields.slice(0, 4).map((f) => `"${getFieldValue(c, f)}"`).join(",") + ",..."
                        : `"${c.id}","${EVENT_LABELS[c.type as keyof typeof EVENT_LABELS]}","${c.station}","${AREA_LABELS[c.area as keyof typeof AREA_LABELS]}","${STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS]}","${formatDate(c.createdAt)}"`
                      }
                    </div>
                  ))
                ) : (
                  <div className="text-blue-700 py-4">No hay datos disponibles</div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-blue-700 mt-3">📊 Datos separados por comas, compatible con Excel, Google Sheets y otros sistemas</p>
          </div>
        )}
      </Card>
    </SegShell>
  );
}

function getFieldValue(c: any, field: string): string {
  const fieldMap: Record<string, () => string> = {
    "Código SOP": () => c.id,
    "Tipo de SOP": () => EVENT_LABELS[c.type as keyof typeof EVENT_LABELS] || c.type,
    "Título": () => c.title,
    "Descripción": () => c.description?.slice(0, 30) + "..." || "",
    "Área": () => AREA_LABELS[c.area as keyof typeof AREA_LABELS] || c.area,
    "Estación": () => c.station,
    "Ubicación": () => c.location,
    "Fecha del hallazgo": () => c.date,
    "Fecha de evento": () => c.date,
    "Estado de hallazgo": () => STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS] || c.stage,
    "Días abierto": () => c.stage !== "cierre" ? Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000).toString() : "0",
    "Procedencia": () => "Incidencias",
    "Tipo": () => EVENT_LABELS[c.type as keyof typeof EVENT_LABELS] || c.type,
    "Responsable de Hallazgo": () => c.investigator || c.reporter || "",
    "Subtipo SOP": () => "N/A",
    "Peligro": () => "N/A",
    "Consecuencia": () => "N/A",
    "Análisis de riesgo": () => c.riskLevel || "N/A",
    "ACR": () => "N/A",
    "Plan de Acción": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.planCode || "N/A";
    },
    "Descripción de Plan de Acción": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.description?.slice(0, 30) + "..." || "";
    },
    "Responsable Plan de Acción": () => c.assignee || (c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0].elaboratedBy : "") || "",
    "Estado Plan de acción": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.planStatus || "N/A";
    },
    "Fecha de plan": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.planDate || "";
    },
    "Fecha programada": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.scheduledDate || "";
    },
    "Días abierto plan de acción": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.planDate ? Math.floor((Date.now() - new Date(plan.planDate).getTime()) / 86400000).toString() : "0";
    },
    "Anexos": () => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      return plan?.annexes?.slice(0, 20) + "..." || "";
    },
    "Fecha evento": () => c.date,
    "Hora de evento": () => c.time,
    "Año": () => new Date(c.createdAt).getFullYear().toString(),
    "Mes": () => new Date(c.createdAt).toLocaleDateString('es-ES', { month: 'long' }),
    "Semana": () => Math.ceil(new Date(c.createdAt).getDate() / 7).toString(),
    "Día": () => new Date(c.createdAt).getDate().toString(),
    "Rango horario": () => c.time,
    "Tipo de incidente operativo": () => EVENT_LABELS[c.type as keyof typeof EVENT_LABELS] || c.type,
    "Descripción del evento": () => c.description?.slice(0, 30) + "..." || "",
    "Ubicación incidente": () => c.location,
    "Tipo de vía": () => "N/A",
    "Dirección de vía": () => "N/A",
    "Lugar de Incidente": () => c.station,
    "Modelo MR": () => "N/A",
    "Nro. MR": () => "N/A",
    "Nro. Carrera": () => "N/A",
    "Personal o falla Involucrado": () => c.reporter || "",
    "Tipo Causa": () => "N/A",
    "Posible Causa": () => "N/A",
    "Información adicional": () => c.observations?.slice(0, 20) + "..." || "",
    "Cámara monitoreada": () => "N/A",
    "DEMORA": () => "N/A",
    "Prioridad": () => c.priority,
    "Estado del caso": () => STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS] || c.stage,
    "Reportante": () => c.reporter,
    "Asignado a": () => c.assignee || "",
    "SLA vence": () => c.slaDueDate,
    "Creado": () => formatDate(c.createdAt),
  };
  
  return fieldMap[field]?.() || "N/A";
}

function SummaryRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-[12px] text-ink-quiet"><span className="text-ink-faint">{icon}</span> {label}</span>
      <span className={cn("text-[12.5px] font-semibold", highlight ? "text-brand-700 text-[15px] tabular-nums" : "text-ink")}>{value}</span>
    </div>
  );
}
