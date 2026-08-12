import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";

interface Event {
  id: string;
  status: string;
  fecha: string;
  tipoIncidente: string;
  ubicacion: string;
}

export function Indicadores() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const storedEvents = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
    setEvents(storedEvents);
    setLoading(false);
  };

  const calculateKPIs = () => {
    const total = events.length;
    const pendientes = events.filter(e => e.status === 'pendiente').length;
    const cerrados = events.filter(e => e.status === 'cerrado').length;
    const investigando = events.filter(e => e.status === 'investigando').length;
    
    const byType = events.reduce((acc, event) => {
      acc[event.tipoIncidente] = (acc[event.tipoIncidente] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = events.reduce((acc, event) => {
      acc[event.ubicacion] = (acc[event.ubicacion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, pendientes, cerrados, investigando, byType, byLocation };
  };

  const kpis = calculateKPIs();

  if (loading) {
    return (
      <MonitoreoShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-ink-quiet">Cargando indicadores...</div>
        </div>
      </MonitoreoShell>
    );
  }

  return (
    <MonitoreoShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Indicadores</h1>
          <p className="text-[13px] text-ink-quiet mt-1">
            Métricas y estadísticas de incidentes operativos
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-ink">{kpis.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Pendientes</p>
                <p className="text-2xl font-bold text-ink">{kpis.pendientes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Investigando</p>
                <p className="text-2xl font-bold text-ink">{kpis.investigando}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Cerrados</p>
                <p className="text-2xl font-bold text-ink">{kpis.cerrados}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00A94F]" />
              Incidentes por Tipo
            </h3>
            <div className="space-y-3">
              {Object.entries(kpis.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-ink">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00A94F]" 
                        style={{ width: `${(count / kpis.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-ink">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#00A94F]" />
              Incidentes por Ubicación
            </h3>
            <div className="space-y-3">
              {Object.entries(kpis.byLocation).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-sm text-ink">{location}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00A94F]" 
                        style={{ width: `${(count / kpis.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-ink">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MonitoreoShell>
  );
}
