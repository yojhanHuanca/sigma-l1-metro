import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Check, Rocket, Activity, Timer, Send, Calendar, User, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { JefeShell } from "@/design-system/layout/JefeShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Pill, PriorityPill } from "@/design-system/primitives/Pill";
import { formatDate } from "@/lib/utils";
import { AREA_LABELS } from "@/lib/types";

export function JefeHome() {
  const s = useStore();
  const { cases, currentUser, acceptPlan } = s;
  const [searchParams, setParams] = useSearchParams();
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedCaseForPlans, setSelectedCaseForPlans] = useState<any>(null);

  const stateFilter = searchParams.get("estado") || "todos";

  // Agrupar planes por caso
  const casesWithPlans = useMemo(() => {
    const caseMap = new Map<string, { id: string; title: string; plans: { id: string; planCode: string; planIndex: number; stage: string; acceptedAt?: string; caseData: any }[] }>();

    cases.forEach((c) => {
      const actionPlans = c.actionPlans;
      if (actionPlans && actionPlans.length > 0) {
        // Filtrar planes por área de destino del usuario
        const plansForArea = actionPlans
          .map((plan, index) => ({
            id: `plan_${index}`,
            planCode: `PLA-${String(index + 1).padStart(2, "0")}`,
            planIndex: index,
            stage: c.stage || "plan_accion",
            acceptedAt: plan.reviewedAt,
            caseData: c,
            sentToArea: plan.sentToArea,
          }))
          .filter((p) => p.sentToArea === currentUser.area || !p.sentToArea);

        // Mostrar el caso si tiene planes para el área del usuario
        if (plansForArea.length > 0) {
          caseMap.set(c.id, {
            id: c.id,
            title: c.title || "Sin título",
            plans: plansForArea,
          });
        }
      }
    });

    return Array.from(caseMap.values());
  }, [cases, currentUser.area]);

  // Filtrar casos según estado seleccionado
  const filteredCases = useMemo(() => {
    return casesWithPlans.filter((caseItem) => {
      const plans = caseItem.plans;
      return stateFilter === "todos"
        ? true
        : stateFilter === "ejecucion"
        ? plans.some((p) => p.stage === "ejecucion" || (p.acceptedAt && p.stage !== "verificacion"))
        : stateFilter === "verificacion"
        ? plans.some((p) => p.stage === "verificacion")
        : plans.some((p) => p.stage === "plan_accion" && !p.acceptedAt);
    });
  }, [casesWithPlans, stateFilter]);

  return (
    <JefeShell>
      {showPlanSelection && selectedCaseForPlans ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowPlanSelection(false);
                setSelectedCaseForPlans(null);
              }}
              className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-ink-quiet hover:text-ink"
              title="Volver a la lista"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-ink tracking-tight">Plan de Acción</h1>
              <p className="text-[12px] text-ink-soft mt-1">Caso: {selectedCaseForPlans.id}</p>
            </div>
          </div>

          <Card padded={false} className="border-line-soft shadow-sm">
            <div className="p-5 border-b border-line-soft bg-surface-2/50">
              <p className="text-[13px] font-semibold text-ink">Seleccione un plan para ver el detalle:</p>
            </div>
            <div className="p-5 space-y-3">
              {selectedCaseForPlans.plans.map((plan: any, index: number) => {
                const planData = plan.caseData.actionPlans?.[plan.planIndex];
                const isOverdue = planData?.dueDate && new Date(planData.dueDate) < new Date();
                return (
                  <div key={plan.id} className="p-4 border border-line-soft rounded-lg hover:bg-surface-2 transition-all hover:shadow-sm hover:border-line">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center border border-brand-200">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <Link
                          to={`/jefe/planes/${selectedCaseForPlans.id}?plan=${plan.planIndex}`}
                          className="text-[14px] font-semibold text-brand-700 hover:text-brand-800 hover:underline transition-colors"
                        >
                          {plan.planCode}
                        </Link>
                      </div>
                      <Pill tone={plan.stage === "verificacion" ? "warning" : plan.acceptedAt ? "brand" : "info"} dot>
                        {plan.stage === "verificacion" ? "En Verificación" : plan.acceptedAt ? "En Ejecución" : "Pendiente"}
                      </Pill>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-ink-quiet mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-ink-faint" />
                        <span className="text-ink-soft">Responsable:</span>
                        <span className="text-ink font-medium">{planData?.secondResponsible || (planData?.items?.[0]?.owner) || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-ink-soft">Tipo:</span>
                        <span className="text-ink font-medium">{planData?.actionType || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-ink-soft">Área:</span>
                        <span className="text-ink font-medium">{planData?.sentToArea ? AREA_LABELS[planData.sentToArea as keyof typeof AREA_LABELS] : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {planData?.priority && <PriorityPill priority={planData.priority} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-ink-quiet mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-ink-faint" />
                        <span className="text-ink-soft">Inicio:</span>
                        <span className="text-ink">{formatDate(planData?.startDate || plan.caseData.createdAt)}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${isOverdue ? "text-critical font-semibold" : ""}`}>
                        {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                        <span className={isOverdue ? "" : "text-ink-soft"}>Fin:</span>
                        <span className={isOverdue ? "" : "text-ink"}>{formatDate(planData?.dueDate || plan.caseData.slaDueDate)}</span>
                      </div>
                    </div>
                    {planData?.description && (
                      <p className="text-[12px] text-ink-soft mb-3 line-clamp-2 leading-relaxed">{planData.description}</p>
                    )}
                    {!plan.acceptedAt && plan.stage !== "verificacion" && (
                      <Button size="sm" onClick={() => acceptPlan(selectedCaseForPlans.id)} className="w-full bg-brand-700 hover:bg-brand-800 transition-colors">
                        <Check className="h-4 w-4 mr-2" /> Aceptar Plan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : filteredCases.length === 0 ? (
        <NoPlanAssigned />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-ink tracking-tight">Mis Planes de Acción</h1>
              <p className="text-[12px] text-ink-soft mt-1">Planes asignados por Seguridad Operativa</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-quiet">{filteredCases.length} caso{filteredCases.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setParams({})}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${stateFilter === "todos" ? "bg-brand-700 text-white shadow-sm" : "bg-surface-2 text-ink-soft hover:bg-surface-3 hover:text-ink"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setParams({ estado: "pendientes" })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${stateFilter === "pendientes" ? "bg-brand-700 text-white shadow-sm" : "bg-surface-2 text-ink-soft hover:bg-surface-3 hover:text-ink"}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setParams({ estado: "ejecucion" })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${stateFilter === "ejecucion" ? "bg-brand-700 text-white shadow-sm" : "bg-surface-2 text-ink-soft hover:bg-surface-3 hover:text-ink"}`}
            >
              En Ejecución
            </button>
            <button
              onClick={() => setParams({ estado: "verificacion" })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${stateFilter === "verificacion" ? "bg-brand-700 text-white shadow-sm" : "bg-surface-2 text-ink-soft hover:bg-surface-3 hover:text-ink"}`}
            >
              En Verificación
            </button>
          </div>

          {/* Tabla de casos */}
          <Card padded={false} className="border-line-soft shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line-soft bg-surface-2">
                    <th className="text-left px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Código</th>
                    <th className="text-left px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Título</th>
                    <th className="text-left px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Prioridad</th>
                    <th className="text-left px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Fecha límite</th>
                    <th className="text-right px-4 py-3 font-semibold text-ink-quiet text-[11px] uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((caseItem) => {
                    const planData = caseItem.plans[0].caseData.actionPlans?.[caseItem.plans[0].planIndex];
                    const isOverdue = planData?.dueDate && new Date(planData.dueDate) < new Date();
                    return (
                      <tr key={caseItem.id} className="border-b border-line-soft hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedCaseForPlans(caseItem);
                              setShowPlanSelection(true);
                            }}
                            className="font-mono text-[12px] font-semibold text-brand-700 hover:text-brand-800 hover:underline transition-colors"
                          >
                            {caseItem.id}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-ink font-medium">{caseItem.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Pill tone={caseItem.plans[0].stage === "verificacion" ? "warning" : caseItem.plans[0].acceptedAt ? "brand" : "info"} dot>
                            {caseItem.plans[0].stage === "verificacion" ? "En Verificación" : caseItem.plans[0].acceptedAt ? "En Ejecución" : "Pendiente"}
                          </Pill>
                        </td>
                        <td className="px-4 py-3">
                          {planData?.priority && <PriorityPill priority={planData.priority} />}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[12px] ${isOverdue ? "text-critical font-semibold" : "text-ink"}`}>
                            {formatDate(planData?.dueDate || caseItem.plans[0].caseData.slaDueDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[11px] text-ink-quiet">{caseItem.plans.length} plan{caseItem.plans.length !== 1 ? 'es' : ''}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </JefeShell>
  );
}

/* ─── Sin plan asignado ─── */
function NoPlanAssigned() {
  const { currentUser } = useStore();
  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="rounded-2xl text-white p-8 relative overflow-hidden"
        style={{
          backgroundImage: "url('/banner-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/70">Portal del Jefe de Área</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-tight font-display">Hola, {currentUser.name.split(" ")[0]}</h1>
          <p className="text-[13.5px] text-white/80 mt-2">No tiene Planes de Acción asignados pendientes de ejecución en este momento.</p>
        </div>
      </div>
      <Card className="mt-6 p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-700 grid place-items-center mx-auto mb-4">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h3 className="text-[16px] font-semibold text-ink mb-2">Sin planes activos</h3>
        <p className="text-[13px] text-ink-soft">Cuando Seguridad Operativa apruebe y asigne un Plan de Acción a su área, aparecerá aquí para su ejecución.</p>
      </Card>
      <Card className="mt-6 p-5">
        <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-3">¿Qué puede hacer aquí?</p>
        <ul className="space-y-2.5">
          {[
            { icon: Rocket, text: "Ejecutar las actividades del Plan de Acción asignado" },
            { icon: Activity, text: "Registrar avances, comentarios y evidencias" },
            { icon: Timer, text: "Solicitar ampliación de plazo si necesita más tiempo" },
            { icon: Send, text: "Enviar el plan a verificación al finalizar" },
          ].map((it, i) => (
            <li key={i} className="flex items-center gap-3 text-[13px] text-ink-soft">
              <span className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                <it.icon className="h-4 w-4" />
              </span>
              {it.text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
