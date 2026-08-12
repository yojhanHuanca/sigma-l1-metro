import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input } from "@/design-system/primitives/Input";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  status: string;
  fecha: string;
  horaEvento: string;
  anio: number;
  mes: string;
  mes_1: number;
  sem: number;
  dia: string;
  rangoHorario: string;
  tipoIncidente: string;
  descripcion: string;
  ubicacion: string;
  tipoVia: string;
  direccionVia: string;
  lugarIncidente: string;
  modeloMR: string;
  nroMR: string;
  nroCarrera: string;
  personalInvolucrado: string;
  tipoCausa: string;
  posibleCausa: string;
  informacionAdicional: string;
  camaraMonitoreada: boolean;
  camaraSeleccionada: string;
  demora: string;
  createdAt: string;
  createdBy: string;
  fuente: string;
}

export function Historial() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const storedEvents = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
    setEvents(storedEvents);
    setLoading(false);
  };

  const handleExport = () => {
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
    link.download = `historial_eventos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      investigando: "bg-blue-100 text-blue-800",
      investigacion_completada: "bg-purple-100 text-purple-800",
      derivado_caso: "bg-orange-100 text-orange-800",
      cerrado: "bg-green-100 text-green-800",
      cancelado: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tipoIncidente.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDateRange = true;
    if (dateFrom) {
      matchesDateRange = matchesDateRange && event.fecha >= dateFrom;
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && event.fecha <= dateTo;
    }
    
    return matchesSearch && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <MonitoreoShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-ink-quiet">Cargando...</div>
        </div>
      </MonitoreoShell>
    );
  }

  return (
    <MonitoreoShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Historial</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Historial completo de eventos con opciones de exportación
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Buscar">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
                <Input
                  placeholder="Buscar por descripción, tipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Field>

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
          </div>
        </Card>

        {/* Events Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Hora</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Año</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Mes</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Mes_1</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Sem</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Día</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Rango Horario</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Tipo Incidente</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Descripción</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Ubicación</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Tipo Vía</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Dirección</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Lugar</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Modelo MR</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Nro MR</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Nro Carrera</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Personal/Falla</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Tipo Causa</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Posible Causa</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Info Adicional</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Cámara</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Demora</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((event) => (
                  <tr 
                    key={event.id} 
                    className="border-b border-line hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => navigate(`/monitoreo/eventos/${event.id}`)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.fecha}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.horaEvento}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.anio}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.mes}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.mes_1}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.sem}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.dia}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.rangoHorario}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.tipoIncidente}</span></td>
                    <td className="px-3 py-2 max-w-xs truncate">
                      <span 
                        className="text-ink cursor-help hover:text-[#00A94F]" 
                        title={event.descripcion}
                      >
                        {event.descripcion}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.ubicacion}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.tipoVia}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.direccionVia || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.lugarIncidente || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.modeloMR || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.nroMR || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.nroCarrera || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.personalInvolucrado || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.tipoCausa}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.posibleCausa || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.informacionAdicional || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.camaraMonitoreada ? 'Sí' : 'No'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.demora || '—'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(event.status))}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-ink-quiet mx-auto mb-4" />
              <p className="text-ink-quiet text-sm">No se encontraron eventos en el historial</p>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-quiet">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredEvents.length)} de {filteredEvents.length} eventos
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-ink-quiet">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MonitoreoShell>
  );
}
