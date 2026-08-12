import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, AlertCircle, Camera, Timer, User, Info } from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  status: string;
  fecha: string;
  horaEvento: string;
  anio: number;
  mes: string;
  mes_1: string;
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
  investigatorId?: string;
  fuente: string;
}

const INCIDENT_TYPES: Record<string, string> = {
  'incidente_operativo': 'Incidente Operativo',
  'falla_tecnica': 'Falla Técnica',
  'incidente_seguridad': 'Incidente de Seguridad',
  'incidente_pasajeros': 'Incidente con Pasajeros',
  'incidente_infraestructura': 'Incidente de Infraestructura',
  'incidente_electrico': 'Incidente Eléctrico'
};

const LOCATION_TYPES: Record<string, string> = {
  'estacion': 'Estación',
  'taller': 'Taller',
  'via': 'Vía',
  'patio': 'Patio',
  'subestacion': 'Subestación'
};

const VIA_TYPES: Record<string, string> = {
  'andenes': 'Andenes',
  'plataformas': 'Plataformas',
  'via_principal': 'Vía Principal',
  'via_secundaria': 'Vía Secundaria',
  'via_desvio': 'Vía Desvío'
};

const CAUSE_TYPES: Record<string, string> = {
  'mecanica': 'Mecánica',
  'operacional': 'Operacional',
  'humana': 'Humana',
  'externa': 'Externa',
  'electrica': 'Eléctrica'
};

const STATUS_LABELS: Record<string, string> = {
  'registrado': 'Registrado',
  'en_revision': 'En Revisión',
  'investigando': 'En Investigación',
  'cerrado': 'Cerrado'
};

const STATUS_COLORS: Record<string, string> = {
  'registrado': 'bg-blue-50 text-blue-700 border-blue-200',
  'en_revision': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'investigando': 'bg-purple-50 text-purple-700 border-purple-200',
  'cerrado': 'bg-green-50 text-green-700 border-green-200'
};

export function EventoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const events = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
    const foundEvent = events.find((e: Event) => e.id === id);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [id]);

  const handleDelete = () => {
    if (!event) return;
    if (confirm('¿Está seguro de eliminar este evento?')) {
      const events = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
      const filtered = events.filter((e: Event) => e.id !== id);
      localStorage.setItem('monitoreo_events', JSON.stringify(filtered));
      navigate('/monitoreo');
    }
  };

  if (loading) {
    return (
      <MonitoreoShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-ink-quiet">Cargando evento...</div>
        </div>
      </MonitoreoShell>
    );
  }

  if (!event) {
    return (
      <MonitoreoShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-ink-quiet">Evento no encontrado</div>
        </div>
      </MonitoreoShell>
    );
  }

  return (
    <MonitoreoShell>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/monitoreo")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-[20px] font-bold text-ink tracking-tight">Detalle del Evento</h1>
              <p className="text-[12px] text-ink-quiet mt-0.5">
                {event.fecha} - {event.horaEvento}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/monitoreo/eventos/${event.id}/editar`)}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </div>
        </div>

        {/* Estado */}
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00A94F]/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#00A94F]" />
            </div>
            <div>
              <p className="text-[10px] text-ink-quiet uppercase tracking-wider">Estado del evento</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border mt-1 ${STATUS_COLORS[event.status]}`}>
                {STATUS_LABELS[event.status] || event.status}
              </span>
            </div>
          </div>
        </Card>

        {/* SECCIÓN 1 — DATOS DEL EVENTO */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#00A94F]" />
            <h2 className="text-[13px] font-semibold text-ink">1. Datos del Evento</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Fecha</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.fecha}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Hora</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.horaEvento}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Año</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.anio}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Mes</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.mes}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Mes_1</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.mes_1}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Sem</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.sem}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Día</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.dia}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Rango</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.rangoHorario}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-blue-700 bg-blue-50 p-1.5 rounded">
            <Info className="w-3.5 h-3.5" />
            <span>Campos calculados automáticamente desde Fecha + Hora</span>
          </div>
        </Card>

        {/* SECCIÓN 2 — CLASIFICACIÓN DEL EVENTO */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#00A94F]" />
            <h2 className="text-[13px] font-semibold text-ink">2. Clasificación</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Tipo incidente</label>
              <div className="mt-0.5 text-xs font-medium text-ink">
                {INCIDENT_TYPES[event.tipoIncidente] || event.tipoIncidente}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Ubicación</label>
              <div className="mt-0.5 text-xs font-medium text-ink">
                {LOCATION_TYPES[event.ubicacion] || event.ubicacion}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Tipo vía</label>
              <div className="mt-0.5 text-xs font-medium text-ink">
                {VIA_TYPES[event.tipoVia] || event.tipoVia}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Dirección vía</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.direccionVia || '—'}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Lugar incidente</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.lugarIncidente || '—'}</div>
            </div>
          </div>
        </Card>

        {/* SECCIÓN 3 — TREN / OPERACIÓN */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#00A94F]" />
            <h2 className="text-[13px] font-semibold text-ink">3. Tren / Operación</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Modelo MR</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.modeloMR || '—'}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Nro. MR</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.nroMR || '—'}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Nro. Carrera</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.nroCarrera || '—'}</div>
            </div>
          </div>
        </Card>

        {/* SECCIÓN 4 — PERSONAL / FALLA */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#00A94F]" />
            <h2 className="text-[13px] font-semibold text-ink">4. Personal / Falla</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Personal o falla involucrado</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.personalInvolucrado || '—'}</div>
            </div>
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Tipo causa</label>
              <div className="mt-0.5 text-xs font-medium text-ink">
                {CAUSE_TYPES[event.tipoCausa] || event.tipoCausa}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Posible causa</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.posibleCausa || '—'}</div>
            </div>
          </div>
        </Card>

        {/* SECCIÓN 5 — DETALLE DEL EVENTO */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-[#00A94F]" />
            <h2 className="text-[13px] font-semibold text-ink">5. Detalle del Evento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Descripción</label>
              <div className="mt-0.5 p-2 bg-surface border border-line rounded text-xs text-ink">
                {event.descripcion}
              </div>
            </div>

            {event.informacionAdicional && (
              <div className="md:col-span-2">
                <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Info adicional</label>
                <div className="mt-0.5 p-2 bg-surface border border-line rounded text-xs text-ink">
                  {event.informacionAdicional}
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Cámara</label>
              <div className="mt-0.5 text-xs font-medium text-ink">
                {event.camaraMonitoreada ? 'Sí' : 'No'}
              </div>
            </div>
            {event.camaraMonitoreada && event.camaraSeleccionada && (
              <div>
                <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Cámara ID</label>
                <div className="mt-0.5 text-xs font-medium text-ink">{event.camaraSeleccionada}</div>
              </div>
            )}
            <div>
              <label className="text-[10px] text-ink-quiet uppercase tracking-wider">Demora</label>
              <div className="mt-0.5 text-xs font-medium text-ink">{event.demora || '—'}</div>
            </div>
          </div>
        </Card>

        {/* Metadatos */}
        <Card className="p-2 bg-surface">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-ink-quiet">
            <div>
              <span className="uppercase tracking-wider">Registrado por:</span>
              <span className="ml-1 text-ink">{event.createdBy}</span>
            </div>
            <div>
              <span className="uppercase tracking-wider">Fecha registro:</span>
              <span className="ml-1 text-ink">{new Date(event.createdAt).toLocaleString('es-ES')}</span>
            </div>
            <div>
              <span className="uppercase tracking-wider">Fuente:</span>
              <span className="ml-1 text-ink">{event.fuente}</span>
            </div>
            <div>
              <span className="uppercase tracking-wider">ID:</span>
              <span className="ml-1 text-ink">{event.id}</span>
            </div>
          </div>
        </Card>
      </div>
    </MonitoreoShell>
  );
}
