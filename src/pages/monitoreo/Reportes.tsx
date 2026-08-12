import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Building2,
  Users
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";

interface Event {
  id: string;
  status: string;
  fecha: string;
  horaEvento?: string;
  anio?: number;
  mes?: string;
  mes_1?: number;
  sem?: number;
  dia?: string;
  rangoHorario?: string;
  tipoIncidente?: string;
  descripcion?: string;
  ubicacion?: string;
  tipoVia?: string;
  direccionVia?: string;
  lugarIncidente?: string;
  modeloMR?: string;
  nroMR?: string;
  nroCarrera?: string;
  personalInvolucrado?: string;
  tipoCausa?: string;
  posibleCausa?: string;
  informacionAdicional?: string;
  camaraMonitoreada?: boolean;
  demora?: string;
  investigator?: string;
}

export function Reportes() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const storedEvents = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
    setEvents(storedEvents);
  };

  const handleGenerateReport = () => {
    const filtered = events.filter(event => {
      const matchesType = typeFilter === "todos" || event.tipoIncidente === typeFilter;
      const matchesStatus = statusFilter === "todos" || event.status === statusFilter;
      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && event.fecha >= dateFrom;
      if (dateTo) matchesDate = matchesDate && event.fecha <= dateTo;
      return matchesType && matchesStatus && matchesDate;
    });

    const headers = ['Fecha', 'Tipo Incidente', 'Ubicación', 'Estado'];
    const rows = filtered.map(event => [
      event.fecha,
      event.tipoIncidente,
      event.ubicacion,
      event.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadReport = (type: string) => {
    let filteredEvents = [...events];
    let filename = '';

    switch(type) {
      case 'mensual':
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        filteredEvents = events.filter(e => {
          const [day, month, year] = e.fecha.split('/').map(Number);
          return month === currentMonth + 1 && year === currentYear;
        });
        filename = 'reporte_mensual';
        break;
      case 'ubicacion':
        filteredEvents = events.filter(e => e.ubicacion);
        filename = 'reporte_por_ubicacion';
        break;
      case 'tendencias':
        filteredEvents = events.filter(e => e.tipoIncidente);
        filename = 'reporte_tendencias';
        break;
      case 'criticos':
        filteredEvents = events.filter(e => e.status === 'pendiente' || e.status === 'investigando');
        filename = 'reporte_incidentes_criticos';
        break;
      case 'investigadores':
        filteredEvents = events.filter(e => e.investigator);
        filename = 'reporte_investigadores';
        break;
      case 'consolidado':
        filteredEvents = events;
        filename = 'reporte_consolidado';
        break;
    }

    const headers = [
      'Fecha', 'Hora', 'Año', 'Mes', 'Mes_1', 'Sem', 'Día', 'Rango Horario',
      'Tipo Incidente', 'Descripción', 'Ubicación', 'Tipo Vía', 'Dirección', 'Lugar',
      'Modelo MR', 'Nro MR', 'Nro Carrera', 'Personal/Falla', 'Tipo Causa',
      'Posible Causa', 'Info Adicional', 'Cámara', 'Demora', 'Estado'
    ];
    
    const rows = filteredEvents.map(event => [
      event.fecha,
      event.horaEvento,
      event.anio,
      event.mes,
      event.mes_1,
      event.sem,
      event.dia,
      event.rangoHorario,
      event.tipoIncidente,
      event.descripcion,
      event.ubicacion,
      event.tipoVia,
      event.direccionVia,
      event.lugarIncidente,
      event.modeloMR,
      event.nroMR,
      event.nroCarrera,
      event.personalInvolucrado,
      event.tipoCausa,
      event.posibleCausa,
      event.informacionAdicional,
      event.camaraMonitoreada ? 'Sí' : 'No',
      event.demora,
      event.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const reportStats = {
    total: events.length,
    pendientes: events.filter(e => e.status === 'pendiente').length,
    cerrados: events.filter(e => e.status === 'cerrado').length,
    investigando: events.filter(e => e.status === 'investigando').length
  };

  return (
    <MonitoreoShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Reportes</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Sistema de generación de reportes operativos
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink-quiet uppercase tracking-wider">Línea 1 Metro de Lima</p>
            <p className="text-[10px] text-ink-quiet">Sistema de Monitoreo v1.0</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A94F]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#00A94F]" />
              </div>
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Total Eventos</p>
                <p className="text-2xl font-bold text-ink">{reportStats.total}</p>
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
                <p className="text-2xl font-bold text-ink">{reportStats.pendientes}</p>
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
                <p className="text-2xl font-bold text-ink">{reportStats.investigando}</p>
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
                <p className="text-2xl font-bold text-ink">{reportStats.cerrados}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Generador de Reportes Personalizado */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#00A94F] flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Generador de Reportes Personalizado</h3>
              <p className="text-[12px] text-ink-quiet">Filtre los eventos y genere reportes a medida</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Field label="Fecha desde">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Fecha hasta">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
                <Input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Tipo de incidente">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="todos">Todos los tipos</option>
                <option value="otro">Otro</option>
                <option value="atropello">Atropello</option>
                <option value="caida_estacion">Caída en estación</option>
                <option value="intento_suicidio">Intento de suicidio</option>
              </Select>
            </Field>

            <Field label="Estado">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="investigando">Investigando</option>
                <option value="cerrado">Cerrado</option>
              </Select>
            </Field>
          </div>

          <Button onClick={handleGenerateReport} className="bg-[#00A94F] hover:bg-[#008F42]">
            <Download className="h-4 w-4 mr-2" /> Generar Reporte CSV
          </Button>
        </Card>

        {/* Reportes Predefinidos */}
        <div>
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00A94F]" />
            Reportes Predefinidos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte Mensual</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Resumen de incidentes del mes actual con estadísticas detalladas</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('mensual')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte por Ubicación</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Incidentes agrupados por estación y puntos críticos</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('ubicacion')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte de Tendencias</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Análisis de tendencias y patrones de incidentes</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('tendencias')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte de Incidentes Críticos</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Incidentes de alta prioridad y tiempos de respuesta</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('criticos')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte de Investigadores</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Rendimiento y carga de trabajo por investigador</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('investigadores')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold text-ink mb-1">Reporte Consolidado</h4>
                  <p className="text-[12px] text-ink-quiet mb-3">Reporte completo con todos los indicadores KPI</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownloadReport('consolidado')}>
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Información adicional */}
        <Card className="p-4 bg-surface">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-ink-quiet" />
            <div className="text-[12px] text-ink-quiet">
              <span className="font-medium text-ink">Nota:</span> Todos los reportes se generan en formato CSV compatible con Excel. 
              Los datos se actualizan en tiempo real desde el sistema de monitoreo.
            </div>
          </div>
        </Card>
      </div>
    </MonitoreoShell>
  );
}
