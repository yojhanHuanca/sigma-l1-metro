import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  Check,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
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

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  pending: number;
  recent: number;
  investigating: number;
  closed: number;
  imported: number;
  manual: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [investigatorFilter, setInvestigatorFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    let storedEvents = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
    
    // Si no hay eventos, crear datos de ejemplo
    if (storedEvents.length === 0) {
      storedEvents = createSampleEvents();
      localStorage.setItem('monitoreo_events', JSON.stringify(storedEvents));
    }
    
    setEvents(storedEvents);
    calculateStats(storedEvents);
    setLoading(false);
  };

  const createSampleEvents = () => {
    const today = new Date().toISOString().slice(0, 10).split('-').reverse().join('/');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10).split('-').reverse().join('/');
    
    return [
      {
        id: crypto.randomUUID(),
        status: 'registrado',
        fecha: today,
        horaEvento: '08:30',
        anio: 2026,
        mes: 'Enero',
        mes_1: 1,
        sem: 2,
        dia: 'Lunes',
        rangoHorario: '08:00 - 08:59',
        tipoIncidente: 'incidente_operativo',
        descripcion: 'Falla en sistema de puertas en andén norte',
        ubicacion: 'Estación',
        tipoVia: 'andenes',
        direccionVia: 'Andén norte',
        lugarIncidente: 'Estación Atocongo',
        modeloMR: 'MR-200',
        nroMR: 'MR-200-015',
        nroCarrera: 'C-4521',
        personalInvolucrado: 'Operador de puertas',
        tipoCausa: 'mecanica',
        posibleCausa: 'Falla en sensor de posición',
        informacionAdicional: 'Se requiere revisión técnica',
        camaraMonitoreada: true,
        camaraSeleccionada: 'CAM-024',
        demora: '00:15',
        fuente: 'MANUAL',
        createdAt: new Date().toISOString(),
        createdBy: 'Usuario'
      },
      {
        id: crypto.randomUUID(),
        status: 'en_revision',
        fecha: yesterday,
        horaEvento: '14:45',
        anio: 2026,
        mes: 'Enero',
        mes_1: 1,
        sem: 2,
        dia: 'Domingo',
        rangoHorario: '14:00 - 14:59',
        tipoIncidente: 'falla_tecnica',
        descripcion: 'Problema en sistema de ventilación en vagón 3',
        ubicacion: 'Taller',
        tipoVia: 'via_principal',
        direccionVia: 'Vía 1',
        lugarIncidente: 'Taller San Miguel',
        modeloMR: 'MR-300',
        nroMR: 'MR-300-008',
        nroCarrera: 'C-3892',
        personalInvolucrado: 'Personal de mantenimiento',
        tipoCausa: 'operacional',
        posibleCausa: 'Falla en motor de ventilación',
        informacionAdicional: '',
        camaraMonitoreada: false,
        camaraSeleccionada: '',
        demora: '00:00',
        fuente: 'MANUAL',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'Usuario'
      },
      {
        id: crypto.randomUUID(),
        status: 'registrado',
        fecha: today,
        horaEvento: '10:15',
        anio: 2026,
        mes: 'Enero',
        mes_1: 1,
        sem: 2,
        dia: 'Lunes',
        rangoHorario: '10:00 - 10:59',
        tipoIncidente: 'incidente_seguridad',
        descripcion: 'Pasajero con emergencia médica en andén sur',
        ubicacion: 'Estación',
        tipoVia: 'plataformas',
        direccionVia: 'Plataforma sur',
        lugarIncidente: 'Estación San Juan de Dios',
        modeloMR: 'MR-200',
        nroMR: 'MR-200-022',
        nroCarrera: 'C-4101',
        personalInvolucrado: 'Personal de seguridad',
        tipoCausa: 'externa',
        posibleCausa: 'Problema de salud del pasajero',
        informacionAdicional: 'Ambulancia solicitada',
        camaraMonitoreada: true,
        camaraSeleccionada: 'CAM-018',
        demora: '00:05',
        fuente: 'MANUAL',
        createdAt: new Date().toISOString(),
        createdBy: 'Usuario'
      },
      {
        id: crypto.randomUUID(),
        status: 'cerrado',
        fecha: yesterday,
        horaEvento: '16:30',
        anio: 2026,
        mes: 'Enero',
        mes_1: 1,
        sem: 2,
        dia: 'Domingo',
        rangoHorario: '16:00 - 16:59',
        tipoIncidente: 'incidente_pasajeros',
        descripcion: 'Objeto olvidado en vagón 2',
        ubicacion: 'Patio',
        tipoVia: 'via_secundaria',
        direccionVia: 'Vía desvío',
        lugarIncidente: 'Patio Villa El Salvador',
        modeloMR: 'MR-400',
        nroMR: 'MR-400-011',
        nroCarrera: 'C-5234',
        personalInvolucrado: 'Personal de limpieza',
        tipoCausa: 'humana',
        posibleCausa: 'Olvio del pasajero',
        informacionAdicional: 'Objeto recuperado y entregado',
        camaraMonitoreada: false,
        camaraSeleccionada: '',
        demora: '00:00',
        fuente: 'MANUAL',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'Usuario'
      },
      {
        id: crypto.randomUUID(),
        status: 'investigando',
        fecha: today,
        horaEvento: '07:20',
        anio: 2026,
        mes: 'Enero',
        mes_1: 1,
        sem: 2,
        dia: 'Lunes',
        rangoHorario: '07:00 - 07:59',
        tipoIncidente: 'incidente_infraestructura',
        descripcion: 'Falla en sistema de iluminación de plataforma',
        ubicacion: 'Estación',
        tipoVia: 'andenes',
        direccionVia: 'Andén central',
        lugarIncidente: 'Estación Gamarra',
        modeloMR: '',
        nroMR: '',
        nroCarrera: '',
        personalInvolucrado: 'Personal de mantenimiento',
        tipoCausa: 'electrica',
        posibleCausa: 'Cortocircuito en panel eléctrico',
        informacionAdicional: 'Investigación en curso',
        camaraMonitoreada: true,
        camaraSeleccionada: 'CAM-032',
        demora: '00:45',
        fuente: 'MANUAL',
        createdAt: new Date().toISOString(),
        createdBy: 'Usuario',
        investigationStatus: 'investigando',
        investigator: 'Carlos Pérez'
      }
    ];
  };

  const calculateStats = (eventsData: Event[]) => {
    const today = new Date().toISOString().slice(0, 10).split('-').reverse().join('/');
    const thisWeek = getWeekNumber(new Date());
    
    const stats: Stats = {
      total: eventsData.length,
      today: eventsData.filter(e => e.fecha === today).length,
      thisWeek: eventsData.filter(e => e.sem === thisWeek).length,
      pending: eventsData.filter(e => e.status === 'registrado' || e.status === 'en_revision').length,
      recent: eventsData.filter(e => {
        const eventDate = new Date(e.createdAt);
        const daysDiff = Math.floor((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length,
      investigating: eventsData.filter(e => e.status === 'investigando').length,
      closed: eventsData.filter(e => e.status === 'cerrado').length,
      imported: eventsData.filter(e => e.fuente === 'EXCEL' || e.fuente === 'URL').length,
      manual: eventsData.filter(e => e.fuente === 'MANUAL').length
    };
    setStats(stats);
  };

  function getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek) + 1;
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.lugarIncidente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.nroMR?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.nroCarrera?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.personalInvolucrado?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "todos" || event.status === statusFilter;
    const matchesType = typeFilter === "todos" || event.tipoIncidente === typeFilter;
    const matchesLocation = locationFilter === "todos" || event.ubicacion === locationFilter;
    const matchesInvestigator = investigatorFilter === "todos" || 
      (investigatorFilter === "asignados" && event.investigator) ||
      (investigatorFilter === "no_asignados" && !event.investigator);
    
    let matchesDateRange = true;
    if (dateFrom) {
      matchesDateRange = matchesDateRange && event.fecha >= dateFrom;
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && event.fecha <= dateTo;
    }

    return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesInvestigator && matchesDateRange;
  });

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registrado":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "en_revision":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "investigando":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "investigacion_completada":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "derivado_caso":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "cerrado":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelado":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      registrado: "Registrado",
      en_revision: "En Revisión",
      investigando: "Investigando",
      investigacion_completada: "Investigación Completada",
      derivado_caso: "Derivado a Caso",
      cerrado: "Cerrado",
      cancelado: "Cancelado"
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      incidente_operativo: "Incidente Operativo",
      falla_tecnica: "Falla Técnica",
      incidente_seguridad: "Incidente de Seguridad",
      incidente_pasajeros: "Incidente con Pasajeros",
      incidente_infraestructura: "Incidente de Infraestructura",
      incidente_electrico: "Incidente Eléctrico"
    };
    return labels[type] || type;
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      const updatedEvents = events.filter(e => e.id !== id);
      localStorage.setItem('monitoreo_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      calculateStats(updatedEvents);
    }
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
      getStatusLabel(event.status)
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

  return (
    <MonitoreoShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Monitoreo de Incidentes</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Gestión de eventos operacionales en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileText className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
            <Link to="/monitoreo/nuevo">
              <Button size="sm" className="bg-[#00A94F] hover:bg-[#008F42]">
                <Plus className="h-4 w-4 mr-2" /> Registrar Evento
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Eventos registrados</p>
                <p className="text-2xl font-bold text-ink mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#00A94F]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#00A94F]" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Eventos pendientes</p>
                <p className="text-2xl font-bold text-ink mt-1">{stats?.pending || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">En investigación</p>
                <p className="text-2xl font-bold text-ink mt-1">{stats?.investigating || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-quiet uppercase tracking-wider">Eventos finalizados</p>
                <p className="text-2xl font-bold text-ink mt-1">{stats?.closed || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
              <Input
                placeholder="Buscar por descripción, ubicación, Nro MR o Nro Carrera..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm">
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="investigando">Investigando</option>
              <option value="cerrado">Cerrado</option>
            </Select>

            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-sm">
              <option value="todos">Todos los tipos</option>
              <option value="otro">Otro</option>
              <option value="atropello">Atropello</option>
              <option value="caida_estacion">Caída en estación</option>
            </Select>

            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="text-sm">
              <option value="todos">Todas las ubicaciones</option>
              <option value="estacion">Estación</option>
              <option value="tren">Tren</option>
              <option value="patio">Patio</option>
            </Select>

            <Select value={investigatorFilter} onChange={(e) => setInvestigatorFilter(e.target.value)} className="text-sm">
              <option value="todos">Todos los investigadores</option>
              <option value="asignado">Asignado</option>
              <option value="no_asignado">No asignado</option>
            </Select>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
                <Input
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-quiet" />
                <Input
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setStatusFilter("todos");
                setTypeFilter("todos");
                setLocationFilter("todos");
                setInvestigatorFilter("todos");
                setDateFrom("");
                setDateTo("");
              }} className="text-sm whitespace-nowrap">
                Limpiar
              </Button>
            </div>
          </div>
        </Card>

        {/* Events Table - Excel Style */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Hora</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Año</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Mes</th>
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
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Cámara</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-ink-quiet uppercase tracking-wider whitespace-nowrap">Demora</th>
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
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.anio}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.mes}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.sem}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.dia}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{event.rangoHorario}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-ink">{getTypeLabel(event.tipoIncidente)}</span></td>
                    <td className="px-3 py-2 max-w-xs truncate"><span className="text-ink" title={event.descripcion}>{event.descripcion}</span></td>
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

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-quiet">
            Mostrando {filteredEvents.length} de {events.length} eventos
          </p>
          <div className="flex items-center gap-2">
            <Link to="/monitoreo/eventos">
              <Button variant="outline" size="sm">
                Ver todos <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MonitoreoShell>
  );
}
