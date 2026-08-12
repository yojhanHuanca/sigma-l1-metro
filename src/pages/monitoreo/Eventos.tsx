import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";
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
  investigationStatus?: string;
  investigator?: string;
  fuente: string;
}

export function Eventos() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
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

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      const updatedEvents = events.filter(e => e.id !== id);
      localStorage.setItem('monitoreo_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendiente: "Pendiente",
      investigando: "Investigando",
      investigacion_completada: "Investigación Completada",
      derivado_caso: "Derivado a Caso",
      cerrado: "Cerrado",
      cancelado: "Cancelado"
    };
    return labels[status] || status;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tipoIncidente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || event.status === statusFilter;
    const matchesType = typeFilter === "todos" || event.tipoIncidente === typeFilter;
    const matchesLocation = locationFilter === "todos" || event.ubicacion === locationFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation;
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
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Eventos</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Lista completa de todos los eventos registrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/monitoreo/nuevo/manual">
              <Button size="sm" className="bg-[#00A94F] hover:bg-[#008F42]">
                <Plus className="h-4 w-4 mr-2" /> Nuevo Evento
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Field label="Estado">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="investigando">Investigando</option>
                <option value="cerrado">Cerrado</option>
              </Select>
            </Field>

            <Field label="Tipo de incidente">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="otro">Otro</option>
                <option value="atropello">Atropello</option>
                <option value="caida_estacion">Caída en estación</option>
                <option value="intento_suicidio">Intento de suicidio</option>
              </Select>
            </Field>

            <Field label="Ubicación">
              <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="todos">Todas</option>
                <option value="estacion">Estación</option>
                <option value="tren">Tren</option>
                <option value="patio">Patio</option>
              </Select>
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
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Tipo Incidente</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Descripción</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Ubicación</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="text-right px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Acciones</th>
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
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.tipoIncidente}</span></td>
                    <td className="px-3 py-2 max-w-xs truncate"><span className="text-ink" title={event.descripcion}>{event.descripcion}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.ubicacion}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusColor(event.status))}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/monitoreo/eventos/${event.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/monitoreo/eventos/${event.id}/editar`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-ink-quiet mx-auto mb-4" />
              <p className="text-ink-quiet text-sm">No se encontraron eventos</p>
              <p className="text-ink-quiet text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
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
