import { useLocation, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { Building2, FolderKanban, Clock, TrendingUp, Activity, Timer } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/design-system/primitives/Card";
import { AREA_LABELS, type Area, riskCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JefeSidebar() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cases, jefeArea } = useStore();

  const stateFilter = searchParams.get("estado") || "todos";

  // Extraer todos los planes de acción de los casos asignados al jefe
  const allPlans = useMemo(() => {
    const plans: Array<{
      id: string;
      planCode: string;
      caseId: string;
      caseTitle: string;
      description: string;
      sentToArea?: Area;
      stage: string;
      execution?: { acceptedByAreaAt?: string };
    }> = [];

    cases.forEach((c) => {
      if (c.actionPlans && c.actionPlans.length > 0) {
        c.actionPlans.forEach((plan, index) => {
          if (plan.sentToArea === jefeArea) {
            plans.push({
              id: `${c.id}-plan-${index}`,
              planCode: plan.planCode || `Plan ${index + 1}`,
              caseId: c.id,
              caseTitle: c.title,
              description: plan.description,
              sentToArea: plan.sentToArea,
              stage: c.stage,
              execution: c.execution,
            });
          }
        });
      }
    });

    return plans;
  }, [cases, jefeArea]);

  // Contadores por estado
  const enEjecucion = allPlans.filter((p: typeof allPlans[number]) => p.stage === "ejecucion" || (p.execution?.acceptedByAreaAt && p.stage !== "verificacion")).length;
  const enVerificacion = allPlans.filter((p: typeof allPlans[number]) => p.stage === "verificacion").length;
  const pendientes = allPlans.filter((p: typeof allPlans[number]) => p.stage === "plan_accion" && !p.execution?.acceptedByAreaAt).length;

  // Estadísticas adicionales
  const casosCriticos = cases.filter(
    (c) => c.assigneeArea === jefeArea && riskCategory(c.riskLevel) === "inaceptable"
  ).length;
  const casosVencidos = cases.filter(
    (c) => c.assigneeArea === jefeArea && c.slaDueDate && new Date(c.slaDueDate) < new Date() && c.stage !== "cierre"
  ).length;

  function cnSidebar(active: boolean) {
    return cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-colors",
      active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-surface hover:text-ink"
    );
  }

  const setEstado = (estado: string) => {
    if (estado === "todos") {
      setSearchParams({});
    } else {
      setSearchParams({ estado });
    }
  };

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* Información del área */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-ink-quiet">Área seleccionada</p>
              <p className="text-[13px] font-semibold text-ink">{AREA_LABELS[jefeArea]}</p>
            </div>
          </div>
        </Card>

        {/* Filtros de estado */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-line-soft bg-surface-50">
            <h3 className="text-[13px] font-semibold text-ink">Mis Planes de Acción</h3>
          </div>
          <div className="p-2 space-y-1">
            <button onClick={() => setEstado("todos")} className={cnSidebar(stateFilter === "todos")}>
              <FolderKanban className="h-4 w-4" />
              <span className="flex-1">Todos</span>
              {allPlans.length > 0 && (
                <span className="text-[11px] font-semibold tabular-nums bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  {allPlans.length}
                </span>
              )}
            </button>

            <button onClick={() => setEstado("ejecucion")} className={cnSidebar(stateFilter === "ejecucion")}>
              <Activity className="h-4 w-4" />
              <span className="flex-1">En Ejecución</span>
              {enEjecucion > 0 && (
                <span className="text-[11px] font-semibold tabular-nums bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  {enEjecucion}
                </span>
              )}
            </button>

            <button onClick={() => setEstado("verificacion")} className={cnSidebar(stateFilter === "verificacion")}>
              <Timer className="h-4 w-4" />
              <span className="flex-1">En Verificación</span>
              {enVerificacion > 0 && (
                <span className="text-[11px] font-semibold tabular-nums bg-warning-100 text-warning-700 rounded-full px-2 py-0.5">
                  {enVerificacion}
                </span>
              )}
            </button>

            <button onClick={() => setEstado("pendiente")} className={cnSidebar(stateFilter === "pendiente")}>
              <Clock className="h-4 w-4" />
              <span className="flex-1">Pendientes</span>
              {pendientes > 0 && (
                <span className="text-[11px] font-semibold tabular-nums bg-info-100 text-info-700 rounded-full px-2 py-0.5">
                  {pendientes}
                </span>
              )}
            </button>
          </div>
        </Card>

        {/* Resumen */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-brand-700" />
            <h3 className="text-[13px] font-semibold text-ink">Resumen del Área</h3>
          </div>
          <div className="space-y-2 text-[11.5px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">Total planes</span>
              <span className="font-medium text-ink">{allPlans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">En ejecución</span>
              <span className="font-medium text-ink">{enEjecucion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">En verificación</span>
              <span className="font-medium text-ink">{enVerificacion}</span>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
}
