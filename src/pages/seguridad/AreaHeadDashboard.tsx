import { useMemo } from "react";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2, TrendingUp, Calendar, Users, FileText, ArrowUpRight, ArrowDownRight, Sparkles, Zap, Target, BarChart3, ChevronRight, Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Pill } from "@/design-system/primitives/Pill";
import { Progress } from "@/design-system/primitives/Progress";
import { cn, formatDate, daysUntil, slaState } from "@/lib/utils";
import { AREA_LABELS, STAGE_STATUS } from "@/lib/types";

export function AreaHeadDashboard() {
  const { cases, currentUser } = useStore();
  
  // Obtener el área del jefe actual (simulado - en producción vendría del usuario autenticado)
  const currentArea = (currentUser?.area as any) || "mantenimiento";
  
  // Filtrar casos por área del jefe
  const areaCases = useMemo(() => {
    return cases.filter(c => c.area === currentArea);
  }, [cases, currentArea]);
  
  // Calcular métricas específicas del área
  const metrics = useMemo(() => {
    const activePlans = areaCases.filter(c => c.stage === "plan_accion" || c.stage === "ejecucion");
    const pendingApproval = areaCases.filter(c => c.stage === "plan_accion" && !(c.actionPlans && c.actionPlans.length > 0 && c.actionPlans[0].reviewedAt));
    const thisWeekActivities = areaCases.filter(c => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      const dueDate = plan?.scheduledDate;
      if (!dueDate) return false;
      const daysUntilDue = daysUntil(dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });
    const overdueActivities = areaCases.filter(c => {
      const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
      const dueDate = plan?.scheduledDate;
      if (!dueDate) return false;
      return daysUntil(dueDate) < 0;
    });
    const completedPlans = areaCases.filter(c => c.stage === "cierre" && c.actionPlans && c.actionPlans.length > 0);
    
    // Calcular SLA del área
    const closedOnTime = areaCases.filter(c => c.stage === "cierre" && daysUntil(c.slaDueDate) >= 0).length;
    const slaCompliance = areaCases.length > 0 ? Math.round((closedOnTime / areaCases.length) * 100) : 100;
    
    // Tiempo promedio de respuesta del área
    const responseTimes = areaCases.filter(c => c.actionPlans && c.actionPlans.length > 0 && c.actionPlans[0].reviewedAt).map(c => {
      const plan = c.actionPlans![0];
      const reviewTime = new Date(plan.reviewedAt!).getTime();
      const createdTime = new Date(c.createdAt).getTime();
      return Math.round((reviewTime - createdTime) / 86400000); // días
    });
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    return {
      activePlans: activePlans.length,
      pendingApproval: pendingApproval.length,
      thisWeekActivities: thisWeekActivities.length,
      overdueActivities: overdueActivities.length,
      completedPlans: completedPlans.length,
      slaCompliance,
      avgResponseTime,
      totalCases: areaCases.length
    };
  }, [areaCases]);
  
  // Actividades que vencen esta semana
  const weeklyActivities = useMemo(() => {
    return areaCases
      .filter(c => {
        const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
        return plan?.scheduledDate && daysUntil(plan.scheduledDate) >= 0 && daysUntil(plan.scheduledDate) <= 7;
      })
      .map(c => {
        const plan = c.actionPlans![0];
        return {
          id: c.id,
          title: c.title,
          dueDate: plan.scheduledDate || "",
          daysRemaining: daysUntil(plan.scheduledDate || ""),
          priority: c.priority
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [areaCases]);
  
  // Casos pendientes de aprobación
  const pendingCases = useMemo(() => {
    return areaCases
      .filter(c => c.stage === "plan_accion" && !(c.actionPlans && c.actionPlans.length > 0 && c.actionPlans[0].reviewedAt))
      .map(c => {
        const plan = c.actionPlans && c.actionPlans.length > 0 ? c.actionPlans[0] : null;
        return {
          id: c.id,
          title: c.title,
          submittedAt: plan?.submittedAt,
          priority: c.priority
        };
      })
      .slice(0, 5);
  }, [areaCases]);
  
  return (
    <SegShell>
      {/* Header mejorado con más contexto visual */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-20" />
        
        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-[28px] font-bold text-white tracking-tight">Centro de Comando</h1>
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </div>
                <p className="text-[14px] text-white/80">
                  {AREA_LABELS[currentArea as keyof typeof AREA_LABELS]} · Panel de Control Operativo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <Bell className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">Notificaciones</span>
                {metrics.pendingApproval > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{metrics.pendingApproval}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Hoy</p>
                <p className="text-white text-sm font-semibold">
                  {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Métricas principales con diseño mejorado */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernMetric 
              icon={<ShieldCheck className="h-6 w-6" />}
              label="Planes Activos"
              value={metrics.activePlans}
              subtitle="En ejecución"
              trend={metrics.activePlans > 0 ? "up" : "stable"}
              tone="brand"
              bgGradient="from-blue-500 to-blue-600"
            />
            <ModernMetric 
              icon={<Clock className="h-6 w-6" />}
              label="Por Aprobar"
              value={metrics.pendingApproval}
              subtitle="Requieren atención"
              trend={metrics.pendingApproval > 0 ? "up" : "down"}
              tone={metrics.pendingApproval > 0 ? "warning" : "brand"}
              bgGradient={metrics.pendingApproval > 0 ? "from-orange-500 to-orange-600" : "from-green-500 to-green-600"}
            />
            <ModernMetric 
              icon={<Zap className="h-6 w-6" />}
              label="Vencen Esta Semana"
              value={metrics.thisWeekActivities}
              subtitle="Actividades próximas"
              trend={metrics.thisWeekActivities > 0 ? "up" : "down"}
              tone={metrics.thisWeekActivities > 0 ? "warning" : "brand"}
              bgGradient={metrics.thisWeekActivities > 0 ? "from-amber-500 to-amber-600" : "from-emerald-500 to-emerald-600"}
            />
            <ModernMetric 
              icon={<CheckCircle2 className="h-6 w-6" />}
              label="Completados"
              value={metrics.completedPlans}
              subtitle="Planes finalizados"
              trend="up"
              tone="brand"
              bgGradient="from-green-500 to-green-600"
            />
          </div>
        </div>
      </div>
      
      {/* Sección principal con diseño de grid mejorado */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Alertas y Actividades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alertas urgentes con diseño más impactante */}
          <Card className="border-2 border-brand-200 shadow-lg">
            <CardHeader
              icon={<AlertTriangle className="h-5 w-5 text-brand-700" />}
              title="Centro de Alertas"
              subtitle="Situaciones que requieren su atención inmediata"
              action={metrics.overdueActivities > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-600 font-semibold text-sm">{metrics.overdueActivities} críticas</span>
                </div>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {metrics.overdueActivities > 0 ? (
                <AlertCard 
                  type="critical"
                  icon={<AlertTriangle className="h-6 w-6" />}
                  title="Actividades Vencidas"
                  count={metrics.overdueActivities}
                  description="Requieren atención inmediata"
                  action="Ver detalles"
                />
              ) : (
                <AlertCard 
                  type="success"
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  title="Sin Alertas Críticas"
                  count={0}
                  description="Todo está al día"
                  action=""
                />
              )}
              
              {metrics.pendingApproval > 0 && (
                <AlertCard 
                  type="warning"
                  icon={<Clock className="h-6 w-6" />}
                  title="Planes por Aprobar"
                  count={metrics.pendingApproval}
                  description="Dentro del plazo de 48h"
                  action="Revisar planes"
                />
              )}
              
              {metrics.thisWeekActivities > 0 && (
                <AlertCard 
                  type="info"
                  icon={<Calendar className="h-6 w-6" />}
                  title="Actividades Esta Semana"
                  count={metrics.thisWeekActivities}
                  description="Próximos 7 días"
                  action="Ver calendario"
                />
              )}
            </div>
          </Card>
          
          {/* Actividades de la semana con diseño de lista mejorado */}
          <Card className="shadow-lg">
            <CardHeader
              icon={<Calendar className="h-5 w-5 text-brand-700" />}
              title="Agenda de Actividades"
              subtitle={`Próximos 7 días · ${weeklyActivities.length} actividades programadas`}
              action={
                <button className="flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700">
                  Ver calendario
                  <ChevronRight className="h-4 w-4" />
                </button>
              }
            />
            <div className="space-y-3 mt-4">
              {weeklyActivities.length > 0 ? (
                weeklyActivities.map((activity, index) => (
                  <ActivityCard 
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-surface/30 rounded-xl">
                  <Calendar className="h-12 w-12 text-ink-faint mx-auto mb-3" />
                  <p className="text-ink-quiet text-sm">No hay actividades programadas para esta semana</p>
                  <p className="text-ink-faint text-xs mt-1">Disfruta del tiempo libre</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Columna derecha - KPIs y Pendientes */}
        <div className="space-y-6">
          {/* KPIs con diseño de tarjetas mejorado */}
          <Card className="shadow-lg bg-gradient-to-br from-surface to-white">
            <CardHeader
              icon={<BarChart3 className="h-5 w-5 text-brand-700" />}
              title="Indicadores de Desempeño"
              subtitle="Métricas clave del área"
            />
            <div className="space-y-4 mt-4">
              <KPIProgressCard 
                label="Cumplimiento SLA"
                value={metrics.slaCompliance}
                target={85}
                icon={<Target className="h-4 w-4" />}
              />
              <KPIProgressCard 
                label="Tasa de Resolución"
                value={Math.round((metrics.completedPlans / (metrics.totalCases || 1)) * 100)}
                target={90}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <KPIValueCard 
                label="Tiempo Respuesta"
                value={`${metrics.avgResponseTime}d`}
                subtitle="Promedio de aprobación"
                icon={<Clock className="h-4 w-4" />}
              />
              <KPIValueCard 
                label="Total Gestionados"
                value={metrics.totalCases}
                subtitle="Casos del área"
                icon={<FileText className="h-4 w-4" />}
              />
            </div>
          </Card>
          
          {/* Casos pendientes con diseño más compacto */}
          {pendingCases.length > 0 && (
            <Card className="shadow-lg border-2 border-warning-200">
              <CardHeader
                icon={<Bell className="h-5 w-5 text-warning-600" />}
                title="Planes Pendientes"
                subtitle={`${pendingCases.length} requieren aprobación`}
                action={<Pill tone="warning" dot>Urgente</Pill>}
              />
              <div className="space-y-2 mt-4">
                {pendingCases.map(c => (
                  <PendingCaseCard key={c.id} case={c} />
                ))}
              </div>
            </Card>
          )}
          
          {/* Acciones rápidas */}
          <Card className="shadow-lg bg-brand-50 border-brand-200">
            <CardHeader
              icon={<Zap className="h-5 w-5 text-brand-700" />}
              title="Acciones Rápidas"
              subtitle="Atajos comunes"
            />
            <div className="space-y-2 mt-4">
              <QuickAction icon={<FileText className="h-4 w-4" />} label="Crear nuevo plan" />
              <QuickAction icon={<Users className="h-4 w-4" />} label="Ver equipo del área" />
              <QuickAction icon={<Calendar className="h-4 w-4" />} label="Ver calendario completo" />
              <QuickAction icon={<BarChart3 className="h-4 w-4" />} label="Reportes detallados" />
            </div>
          </Card>
        </div>
      </div>
    </SegShell>
  );
}

function ModernMetric({ icon, label, value, subtitle, trend, tone, bgGradient }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  subtitle: string; 
  trend: "up" | "down" | "stable";
  tone: "brand" | "critical" | "warning" | "info";
  bgGradient: string;
}) {
  const trendIcons = { up: <ArrowUpRight className="h-4 w-4" />, down: <ArrowDownRight className="h-4 w-4" />, stable: null };
  const trendColors = { up: "text-white", down: "text-white", stable: "text-white/60" };
  
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${bgGradient} text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {icon}
          </div>
          {trendIcons[trend] && (
            <div className={cn("flex items-center gap-1 text-[11px] font-medium", trendColors[trend])}>
              {trendIcons[trend]}
            </div>
          )}
        </div>
        <p className="text-[32px] font-bold tabular-nums leading-none">{value}</p>
        <p className="text-[13px] font-medium mt-1 opacity-90">{label}</p>
        <p className="text-[11px] opacity-70 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertCard({ type, icon, title, count, description, action }: { 
  type: "critical" | "warning" | "info" | "success";
  icon: React.ReactNode; 
  title: string; 
  count: number; 
  description: string; 
  action: string;
}) {
  const styles = {
    critical: "bg-red-50 border-red-200 hover:bg-red-100",
    warning: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    info: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    success: "bg-green-50 border-green-200 hover:bg-green-100"
  };
  const iconColors = {
    critical: "text-red-600",
    warning: "text-orange-600",
    info: "text-blue-600",
    success: "text-green-600"
  };
  
  return (
    <div className={cn("rounded-xl border p-4 cursor-pointer transition-all", styles[type])}>
      <div className="flex items-start justify-between mb-2">
        <div className={cn("h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm", iconColors[type])}>
          {icon}
        </div>
        {count > 0 && (
          <span className="text-2xl font-bold tabular-nums text-ink">{count}</span>
        )}
      </div>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <p className="text-[11px] text-ink-quiet mt-1">{description}</p>
      {action && (
        <p className="text-[11px] font-medium text-brand-600 mt-2">{action} →</p>
      )}
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: any; index: number }) {
  const urgencyColors: Record<number, string> = {
    0: "bg-red-100 text-red-700 border-red-200",
    1: "bg-orange-100 text-orange-700 border-orange-200",
    2: "bg-yellow-100 text-yellow-700 border-yellow-200"
  };
  
  const daysRemaining = Math.max(0, activity.daysRemaining);
  const urgencyColor = daysRemaining <= 2 ? (urgencyColors[daysRemaining] || urgencyColors[2]) : "bg-brand-100 text-brand-700 border-brand-200";
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-line hover:bg-surface/40 transition-all group">
      <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold",
        urgencyColor
      )}>
        {daysRemaining}d
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-ink group-hover:text-brand-600 transition-colors">{activity.title}</p>
        <p className="text-[11px] text-ink-quiet mt-1">
          {formatDate(activity.dueDate)} · {activity.priority}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-ink-faint group-hover:text-brand-600 transition-colors" />
    </div>
  );
}

function KPIProgressCard({ label, value, target, icon }: { 
  label: string; 
  value: number; 
  target: number; 
  icon: React.ReactNode;
}) {
  const percentage = value;
  const isOnTarget = value >= target;
  
  return (
    <div className="bg-white rounded-xl border border-line p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-ink-soft">
            {icon}
          </div>
          <p className="text-[12px] font-medium text-ink">{label}</p>
        </div>
        <span className={cn("text-lg font-bold tabular-nums", isOnTarget ? "text-brand-600" : "text-warning-600")}>
          {value}%
        </span>
      </div>
      <Progress value={percentage} className="h-2" tone={isOnTarget ? "brand" : "warning"} />
      <p className="text-[10px] text-ink-faint mt-2">Objetivo: {target}%</p>
    </div>
  );
}

function KPIValueCard({ label, value, subtitle, icon }: { 
  label: string; 
  value: string | number; 
  subtitle: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-line p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-ink-soft">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-ink-quiet">{label}</p>
          <p className="text-[16px] font-bold tabular-nums text-ink">{value}</p>
          <p className="text-[10px] text-ink-fant">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PendingCaseCard({ case: c }: { case: any }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-warning-200 bg-warning-50/50 hover:bg-warning-50 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
        <FileText className="h-4 w-4 text-warning-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-ink truncate">{c.title}</p>
        <p className="text-[10px] text-ink-quiet">
          {c.submittedAt ? formatDate(c.submittedAt) : "N/A"}
        </p>
      </div>
      <Pill tone={c.priority === "critica" ? "critical" : c.priority === "alta" ? "warning" : "brand"}>
        {c.priority}
      </Pill>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-3 p-3 rounded-lg border border-line hover:bg-surface hover:border-brand-200 transition-all group">
      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-ink-soft group-hover:text-brand-600 transition-colors">
        {icon}
      </div>
      <span className="text-[12px] font-medium text-ink group-hover:text-brand-600 transition-colors">{label}</span>
      <ChevronRight className="h-4 w-4 text-ink-faint group-hover:text-brand-600 transition-colors ml-auto" />
    </button>
  );
}

function AreaMetric({ icon, label, value, subtitle, trend, tone }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  subtitle: string; 
  trend: "up" | "down" | "stable";
  tone: "brand" | "critical" | "warning" | "info";
}) {
  const trendIcons = { up: <ArrowUpRight className="h-4 w-4" />, down: <ArrowDownRight className="h-4 w-4" />, stable: null };
  const trendColors = { up: "text-brand-600", down: "text-critical-600", stable: "text-ink-faint" };
  
  return (
    <div className="bg-white rounded-xl border border-line p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "h-10 w-10 rounded-lg grid place-items-center",
          tone === "brand" && "bg-brand-50 text-brand-700",
          tone === "critical" && "bg-critical-soft text-critical-ink",
          tone === "warning" && "bg-warning-soft text-warning-ink",
          tone === "info" && "bg-info-soft text-info-ink"
        )}>
          {icon}
        </div>
        {trendIcons[trend] && (
          <div className={cn("flex items-center gap-1 text-[11px] font-medium", trendColors[trend])}>
            {trendIcons[trend]}
          </div>
        )}
      </div>
      <p className="text-[28px] font-bold tabular-nums text-ink leading-none">{value}</p>
      <p className="text-[12px] text-ink-soft mt-1">{label}</p>
      <p className="text-[10.5px] text-ink-faint mt-0.5">{subtitle}</p>
    </div>
  );
}

function KPIBox({ label, value, subtitle, tone }: { 
  label: string; 
  value: string | number; 
  subtitle: string; 
  tone: "brand" | "critical" | "warning" | "info" | "neutral";
}) {
  const toneClasses = {
    brand: "bg-brand-50 border-brand-200",
    critical: "bg-critical-soft border-critical/30",
    warning: "bg-warning-soft border-warning/30",
    info: "bg-info-soft border-info/30",
    neutral: "bg-surface border-line"
  };
  
  return (
    <div className={cn("rounded-xl border p-4", toneClasses[tone])}>
      <p className="text-[11px] font-semibold uppercase text-ink-fant">{label}</p>
      <p className="text-[24px] font-bold tabular-nums text-ink mt-2">{value}</p>
      <p className="text-[11px] text-ink-quiet mt-1">{subtitle}</p>
    </div>
  );
}
