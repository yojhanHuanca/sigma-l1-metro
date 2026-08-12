import { Link } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill } from "@/design-system/primitives/Pill";
import {
  MODELO_MR_LABELS,
  TIPO_CAUSA_LABELS,
  TIPO_INCIDENTE_LABELS,
  UBICACION_LABELS,
} from "@/lib/types";
import {
  ESTADO_EVENTO_LABELS,
  ESTADO_EVENTO_TONE,
  formatoDemora,
  type EventoOperativo,
} from "@/lib/monitoreoStore";

export function EventoTable({ eventos, editable = true }: { eventos: EventoOperativo[]; editable?: boolean }) {
  if (eventos.length === 0) {
    return (
      <div className="rounded-[14px] bg-white border border-line p-10 text-center">
        <p className="text-[13.5px] text-ink-soft">No se encontraron eventos con los criterios seleccionados.</p>
        <p className="text-[12px] text-ink-quiet mt-1">Ajuste los filtros o registre un nuevo evento.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] bg-white border border-line shadow-[var(--shadow-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[980px]">
          <thead>
            <tr className="border-b border-line-soft bg-surface/60">
              {["Código", "Fecha", "Hora", "Tipo de incidente", "Ubicación", "Modelo MR", "Causa", "Demora", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-quiet whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {eventos.map((e) => (
              <tr key={e.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    to={`/monitoreo/eventos/${e.id}`}
                    className="text-[12.5px] font-semibold text-brand-700 hover:underline font-mono whitespace-nowrap"
                  >
                    {e.codigo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-ink tabular-nums whitespace-nowrap">{e.fecha}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink tabular-nums whitespace-nowrap">{e.hora}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink whitespace-nowrap">{TIPO_INCIDENTE_LABELS[e.tipoIncidente]}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-soft whitespace-nowrap">{UBICACION_LABELS[e.ubicacion]}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-soft whitespace-nowrap">{e.modeloMR ? MODELO_MR_LABELS[e.modeloMR as keyof typeof MODELO_MR_LABELS] ?? e.modeloMR : "—"}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-soft whitespace-nowrap">{e.tipoCausa ? TIPO_CAUSA_LABELS[e.tipoCausa as keyof typeof TIPO_CAUSA_LABELS] ?? e.tipoCausa : "—"}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink tabular-nums whitespace-nowrap">{formatoDemora(e.demora)}</td>
                <td className="px-4 py-3">
                  <Pill tone={ESTADO_EVENTO_TONE[e.estado]} dot>
                    {ESTADO_EVENTO_LABELS[e.estado]}
                  </Pill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/monitoreo/eventos/${e.id}`}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </Link>
                    {editable && (
                      <Link
                        to={`/monitoreo/editar/${e.id}`}
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EstadoFiltroPills({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const opciones = [
    { key: "todos", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en_proceso", label: "En proceso" },
    { key: "resuelto", label: "Resueltos" },
    { key: "cerrado", label: "Cerrados" },
  ];
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {opciones.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "h-8 px-3 rounded-full text-[12px] font-medium border transition-all",
            value === o.key
              ? "bg-brand-700 text-white border-brand-700 shadow-sm"
              : "bg-white text-ink-soft border-line hover:border-line-strong hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
