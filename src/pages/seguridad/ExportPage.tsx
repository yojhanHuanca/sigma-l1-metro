import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileBarChart, Check, Filter, Calendar, Building2, Tag, Clock } from "lucide-react";
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
  { id: "30", label: "Últimos 30 días" },
  { id: "7", label: "Últimos 7 días" },
  { id: "custom", label: "Personalizado" },
];

export function ExportPage() {
  const { cases } = useStore();
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("xlsx");
  const [range, setRange] = useState("all");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [stage, setStage] = useState<Stage | "">("");
  const [done, setDone] = useState(false);

  const filtered = cases.filter((c) => {
    if (type && c.type !== type) return false;
    if (area && c.area !== area) return false;
    if (stage && c.stage !== stage) return false;
    return true;
  });

  const fields = [
    "Código", "Tipo", "Título", "Descripción", "Área", "Estación", "Ubicación",
    "Fecha", "Hora", "Prioridad", "Estado", "Reportante", "Asignado", "SLA", "Creado",
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
            <CardHeader icon={<Tag className="h-4.5 w-4.5" />} title="Campos incluidos" subtitle={`${fields.length} columnas en el archivo`} />
            <div className="flex flex-wrap gap-2">
              {fields.map((f) => (
                <Pill key={f} tone="neutral"><Check className="h-3 w-3 text-brand-700" /> {f}</Pill>
              ))}
            </div>
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
          <CardHeader icon={<FileSpreadsheet className="h-4.5 w-4.5" />} title="Vista previa" subtitle={`${filtered.length} filas · primeros 5 casos`} className="mb-3" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/60 border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5">Código</th>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5">Estación</th>
                <th className="px-4 py-2.5">Área</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-surface/40">
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-brand-700">{c.id}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-soft">{EVENT_LABELS[c.type]}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-soft">{c.station}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-soft">{AREA_LABELS[c.area]}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-soft">{STAGE_LABELS[c.stage]}</td>
                  <td className="px-4 py-2.5 text-[12px] text-ink-quiet">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </SegShell>
  );
}

function SummaryRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-[12px] text-ink-quiet"><span className="text-ink-faint">{icon}</span> {label}</span>
      <span className={cn("text-[12.5px] font-semibold", highlight ? "text-brand-700 text-[15px] tabular-nums" : "text-ink")}>{value}</span>
    </div>
  );
}
