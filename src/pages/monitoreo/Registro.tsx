import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";

export function Registro() {
  const navigate = useNavigate();

  return (
    <MonitoreoShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/monitoreo")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Registrar Evento</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Complete el formulario manualmente con todos los campos del evento
            </p>
          </div>
        </div>

        {/* Manual Registration */}
        <Card 
          className="p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-[#00A94F]"
          onClick={() => navigate("/monitoreo/nuevo/manual")}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-[#00A94F]/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#00A94F]" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-ink">Registro Manual</h3>
              <p className="text-sm text-ink-quiet mt-2">
                Complete el formulario manualmente con todos los campos del evento operacional
              </p>
            </div>
            <Button className="bg-[#00A94F] hover:bg-[#008F42]">
              <Plus className="h-4 w-4 mr-2" /> Comenzar
            </Button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-surface">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00A94F]/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#00A94F]" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Información</p>
              <p className="text-xs text-ink-quiet mt-1">
                Esta versión del prototipo permite el registro manual de eventos. Los campos derivados 
                (año, mes, semana, día, rango horario) se completan manualmente por ahora, pero están 
                preparados para automatización futura.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MonitoreoShell>
  );
}
