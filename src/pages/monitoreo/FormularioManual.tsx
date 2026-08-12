import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Check,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Camera,
  Timer,
  Info
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select, Textarea } from "@/design-system/primitives/Input";
import { cn } from "@/lib/utils";

// Catálogos actualizados con valores reales del Excel
const INCIDENT_TYPES = [
  { value: 'amenaza_suicida', label: 'AMENAZA SUICIDA' },
  { value: 'arrollamiento', label: 'ARROLLAMIENTO' },
  { value: 'atrapamiento', label: 'ATRAPAMIENTO' },
  { value: 'atrapamiento_dj', label: 'ATRAPAMIENTO-DJ' },
  { value: 'atropello', label: 'ATROPELLO' },
  { value: 'caida_estacion', label: 'CAIDA EN ESTACIÓN' },
  { value: 'caida_estacion_dj', label: 'CAIDA EN ESTACIÓN-DJ' },
  { value: 'colision_mr_obstaculo', label: 'COLISION MR -OBSTÁCULO' },
  { value: 'desaljo', label: 'DESALOJO' },
  { value: 'descarrilamiento', label: 'DESCARRILAMIENTO' },
  { value: 'impacto_fisico', label: 'IMPACTO FÍSICO' },
  { value: 'impacto_fisico_dj', label: 'IMPACTO FÍSICO-DJ' },
  { value: 'ingreso_via', label: 'INGRESO A LA VÍA' },
  { value: 'intento_suicidio', label: 'INTENTO DE SUICIDIO' },
  { value: 'no_abre_puertas', label: 'NO ABRE PUERTAS' },
  { value: 'no_para_estacion', label: 'NO PARA EN ESTACIÓN' },
  { value: 'otro', label: 'OTRO' },
  { value: 'parada_incorrecta', label: 'PARADA INCORRECTA' },
  { value: 'rotura_catenaria', label: 'ROTURA DE CATENARIA' },
  { value: 'talonamiento', label: 'TALONAMIENTO' }
];

const LOCATION_TYPES = [
  { value: 'anden', label: 'ANDEN' },
  { value: 'ascensor', label: 'ASCENSOR' },
  { value: 'escalera_electrica', label: 'ESCALERA ELÉCTRICA' },
  { value: 'escalera_fija', label: 'ESCALERA FIJA' },
  { value: 'escalera_interna', label: 'ESCALERA INTERNA' },
  { value: 'estacion', label: 'ESTACIÓN' },
  { value: 'explanada', label: 'EXPLANADA' },
  { value: 'hall', label: 'HALL' },
  { value: 'interestacional', label: 'INTERESTACIONAL' },
  { value: 'pasarela', label: 'PASARELA' },
  { value: 'patio', label: 'PATIO' },
  { value: 'servicios_higienicos', label: 'SERVICIOS HIGIÉNICOS' },
  { value: 'tren', label: 'TREN' },
  { value: 'zona_no_paga', label: 'ZONA NO PAGA' }
];

const VIA_TYPES = [
  { value: 'impar', label: 'impar' },
  { value: 'par', label: 'par' }
];

const VIA_DIRECCION_TYPES = [
  { value: 'legal', label: 'legal' },
  { value: 'na', label: 'N/A' }
];

const STATION_CODES = [
  { value: 'VES', label: 'VES' },
  { value: 'PIN', label: 'PIN' },
  { value: 'PUM', label: 'PUM' },
  { value: 'VMA', label: 'VMA' },
  { value: 'MAU', label: 'MAU' },
  { value: 'SJU', label: 'SJU' },
  { value: 'ATO', label: 'ATO' },
  { value: 'JCH', label: 'JCH' },
  { value: 'AYA', label: 'AYA' },
  { value: 'CAB', label: 'CAB' },
  { value: 'ANG', label: 'ANG' },
  { value: 'SBS', label: 'SBS' },
  { value: 'CUL', label: 'CUL' },
  { value: 'NAR', label: 'NAR' },
  { value: 'GAM', label: 'GAM' },
  { value: 'MIG', label: 'MIG' },
  { value: 'ELA', label: 'ELA' },
  { value: 'PRE', label: 'PRE' },
  { value: 'CAA', label: 'CAA' },
  { value: 'PIR', label: 'PIR' },
  { value: 'JAR', label: 'JAR' },
  { value: 'POS', label: 'POS' },
  { value: 'SCA', label: 'SCA' },
  { value: 'SMA', label: 'SMA' },
  { value: 'SRO', label: 'SRO' },
  { value: 'BAY', label: 'BAY' },
  { value: 'exteriores', label: 'EXTERIORES' }
];

const MR_MODELS = [
  { value: 'ALSTOM', label: 'ALSTOM' },
  { value: 'ANSALDO', label: 'ANSALDO' },
  { value: 'N/A', label: 'N/A' },
  { value: 'VFA', label: 'VFA' }
];

const MR_NUMBERS = [
  { value: 'N/A', label: 'N/A' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
  { value: 'T4', label: 'T4' },
  { value: 'T5', label: 'T5' },
  { value: 'T6', label: 'T6' },
  { value: 'T7', label: 'T7' },
  { value: 'T8', label: 'T8' },
  { value: 'T9', label: 'T9' },
  { value: 'T10', label: 'T10' },
  { value: 'T11', label: 'T11' },
  { value: 'T12', label: 'T12' },
  { value: 'T13', label: 'T13' },
  { value: 'T14', label: 'T14' },
  { value: 'T15', label: 'T15' },
  { value: 'T16', label: 'T16' },
  { value: 'T17', label: 'T17' },
  { value: 'T18', label: 'T18' },
  { value: 'T19', label: 'T19' },
  { value: 'T20', label: 'T20' },
  { value: 'T21', label: 'T21' },
  { value: 'T22', label: 'T22' },
  { value: 'T23', label: 'T23' },
  { value: 'T24', label: 'T24' },
  { value: 'T25', label: 'T25' },
  { value: 'T26', label: 'T26' },
  { value: 'T27', label: 'T27' },
  { value: 'T28', label: 'T28' },
  { value: 'T29', label: 'T29' },
  { value: 'T30', label: 'T30' },
  { value: 'T31', label: 'T31' },
  { value: 'T32', label: 'T32' },
  { value: 'T33', label: 'T33' },
  { value: 'T34', label: 'T34' },
  { value: 'T35', label: 'T35' },
  { value: 'T36', label: 'T36' },
  { value: 'T37', label: 'T37' },
  { value: 'T38', label: 'T38' },
  { value: 'T39', label: 'T39' },
  { value: 'T40', label: 'T40' },
  { value: 'T41', label: 'T41' },
  { value: 'T42', label: 'T42' },
  { value: 'T43', label: 'T43' },
  { value: 'T44', label: 'T44' },
  { value: 'V-BIVIAL', label: 'V-BIVIAL' },
  { value: 'V-DRESINA', label: 'V-DRESINA' },
  { value: 'V-GRECO', label: 'V-GRECO' },
  { value: 'V-GRUA', label: 'V-GRUA' },
  { value: 'VH-PLATAFORMA', label: 'VH-PLATAFORMA' },
  { value: 'V-PLATAFORMA', label: 'V-PLATAFORMA' }
];

const PERSONAL_TYPES = [
  { value: 'agente_estacion', label: 'AGENTE DE ESTACIÓN' },
  { value: 'conductor', label: 'CONDUCTOR' },
  { value: 'falla_tren', label: 'FALLA DE TREN' },
  { value: 'ios', label: 'IOS' },
  { value: 'jr_abierto_acat', label: 'JR ABIERTO Y/O ACAT' },
  { value: 'jr_acat_frenos', label: 'JR, ACAT Y/O FRENOS CERRADOS' },
  { value: 'jr_acat_ventilacion', label: 'JR, ACAT Y/O FALTA DE VENTILACIÓN' },
  { value: 'mr', label: 'MR' },
  { value: 'otro', label: 'OTRO' },
  { value: 'pasajero', label: 'PASAJERO' },
  { value: 'personal_limpieza', label: 'PERSONAL DE LIMPIEZA' },
  { value: 'tecnico', label: 'TECNICO' },
  { value: 'tercero', label: 'TERCERO' },
  { value: 'transeunte', label: 'TRANSEUNTE' },
  { value: 'avp', label: 'AVP' }
];

const CAUSE_TYPES = [
  { value: 'carrera_comercial_bay', label: 'CARRERA COMERCIAL A BAY' },
  { value: 'factor_externo', label: 'FACTOR EXTERNO' },
  { value: 'falla_operacional', label: 'FALLA OPERACIONAL' },
  { value: 'falla_tecnica', label: 'FALLA TÉCNICA' }
];

const POSSIBLE_CAUSES = [
  { value: 'actos_delictivos', label: 'Actos delictivos' },
  { value: 'amenaza_suicida', label: 'Amenaza suicida' },
  { value: 'caida', label: 'Caída' },
  { value: 'confusion', label: 'Confusión' },
  { value: 'cruzar', label: 'Cruzar' },
  { value: 'distraccion', label: 'Distracción' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'empujado', label: 'Empujado' },
  { value: 'en_investigacion', label: 'En investigación' },
  { value: 'error_humano', label: 'Error de humano' },
  { value: 'errores_manejo', label: 'Errores de manejo u operación' },
  { value: 'estado_etilico', label: 'Estado etílico' },
  { value: 'estres_termico', label: 'Estrés térmico en el punto de contacto' },
  { value: 'falla_tren', label: 'Falla de tren, pedido de Trabajo 656150' },
  { value: 'fatiga_somnolencia', label: 'Fatiga y somnolencia' },
  { value: 'incumplimiento_videa', label: 'Incumplimiento Videa' },
  { value: 'intento_suicidio', label: 'Intento de suicidio' },
  { value: 'ios_225_245', label: 'IOS 225, 245' },
  { value: 'jr_abierto_acat', label: 'JR ABIERTO Y/O ACAT' },
  { value: 'jr_abierto_ventilacion', label: 'JR abierto, ACAT y falta de ventilación' },
  { value: 'lubricacion', label: 'Lubricación' },
  { value: 'lubricacion_curvas', label: 'Lubricación de curvas' },
  { value: 'mala_comunicacion', label: 'Mala comunicación' },
  { value: 'manejo_conduccion', label: 'Manejo o conducción' },
  { value: 'mecanico', label: 'Mecánico' },
  { value: 'miccionar', label: 'Miccionar' },
  { value: 'no_cumplio_procedimiento', label: 'No cumplió procedimiento o método establecido' },
  { value: 'no_identificada', label: 'No identificada' },
  { value: 'no_se_cumplio_procedimiento', label: 'no se cumplio procedimiento' },
  { value: 'obstruccion', label: 'Obstrucción' },
  { value: 'omision_procedimientos', label: 'Omisión de procedimientos' },
  { value: 'otro', label: 'Otro' },
  { value: 'problemas_mentales', label: 'Problemas mentales' },
  { value: 'problemas_mentales_enfermedades', label: 'Problemas mentales, enfermedades' },
  { value: 'recoger_objeto', label: 'Recoger objeto' },
  { value: 'retiro_animal', label: 'Retiro de animal en la vía' },
  { value: 'salida_entrada_destiempo', label: 'Salida/entrada a destiempo' },
  { value: 'salir', label: 'Salir' },
  { value: 'suicidio', label: 'Suicidio' },
  { value: 'transeunte_via', label: 'Transeunte en la vía' },
  { value: 'tropiezo', label: 'Tropiezo' },
  { value: 'uso_celular', label: 'Uso de celular/ distraído' }
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Funciones de cálculo automático de campos derivados
function calculateDerivedFields(fecha: string, horaEvento: string) {
  const [day, month, year] = fecha.split('/').map(Number);
  const [hour, minute] = horaEvento.split(':').map(Number);
  
  const date = new Date(year, month - 1, day);
  
  // Calcular año
  const anio: number = year;
  
  // Calcular mes (nombre)
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mes: string = monthNames[month - 1];
  
  // Calcular mes_1 (formato abreviado)
  const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mes_1: string = `${monthShort[month - 1]}-${year}`;
  
  // Calcular semana del año
  const startOfYear = new Date(year, 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const sem: number = Math.floor(diff / oneWeek) + 1;
  
  // Calcular día de la semana
  const dia: string = DAYS[date.getDay()];
  
  // Calcular rango horario (rangos de 2 horas según especificación)
  const hourRange = Math.floor(hour / 2) * 2;
  const endHour = hourRange + 1;
  const startHourStr = hourRange.toString().padStart(2, '0');
  const endHourStr = endHour.toString().padStart(2, '0');
  const rangoHorario: string = `${startHourStr}:00 - ${endHourStr}:59`;
  
  return {
    anio,
    mes,
    mes_1,
    sem,
    dia,
    rangoHorario
  };
}

export function FormularioManual() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // SECCIÓN 1 — DATOS DEL EVENTO (Todos manuales)
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10).split('-').reverse().join('/'));
  const [horaEvento, setHoraEvento] = useState(new Date().toTimeString().slice(0, 5));
  const [anio, setAnio] = useState<number>(2026);
  const [mes, setMes] = useState<string>("Enero");
  const [mes_1, setMes_1] = useState<string>("Ene-2026");
  const [sem, setSem] = useState<number>(1);
  const [dia, setDia] = useState<string>("Lunes");
  const [rangoHorario, setRangoHorario] = useState<string>("00:00 - 01:59");

  // SECCIÓN 2 — CLASIFICACIÓN
  const [tipoIncidente, setTipoIncidente] = useState("otro");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("estacion");
  const [tipoVia, setTipoVia] = useState("impar");
  const [direccionVia, setDireccionVia] = useState("legal");
  const [lugarIncidente, setLugarIncidente] = useState("ATO");

  // SECCIÓN 3 — INFORMACIÓN OPERACIONAL
  const [modeloMR, setModeloMR] = useState("N/A");
  const [nroMR, setNroMR] = useState("N/A");
  const [nroCarrera, setNroCarrera] = useState("");
  const [personalInvolucrado, setPersonalInvolucrado] = useState("otro");

  // SECCIÓN 4 — CAUSA
  const [tipoCausa, setTipoCausa] = useState("falla_tecnica");
  const [posibleCausa, setPosibleCausa] = useState("no_identificada");
  const [informacionAdicional, setInformacionAdicional] = useState("");

  // SECCIÓN 5 — MONITOREO
  const [camaraMonitoreada, setCamaraMonitoreada] = useState(false);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState("");
  const [demora, setDemora] = useState("");

  // Validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Automatización de campos derivados
  useEffect(() => {
    if (fecha && horaEvento) {
      const derived = calculateDerivedFields(fecha, horaEvento);
      setAnio(derived.anio);
      setMes(derived.mes);
      setMes_1(derived.mes_1);
      setSem(derived.sem);
      setDia(derived.dia);
      setRangoHorario(derived.rangoHorario);
    }
  }, [fecha, horaEvento]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fecha) newErrors.fecha = "Este campo es obligatorio";
    if (!horaEvento) newErrors.horaEvento = "Este campo es obligatorio";
    if (!tipoIncidente) newErrors.tipoIncidente = "Este campo es obligatorio";
    if (!descripcion.trim()) newErrors.descripcion = "Este campo es obligatorio";
    if (!ubicacion) newErrors.ubicacion = "Este campo es obligatorio";
    if (!tipoCausa) newErrors.tipoCausa = "Este campo es obligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    
    // Simular guardado local (prototipo)
    setTimeout(() => {
      // Guardar en localStorage (prototipo)
      const newEvent = {
        id: crypto.randomUUID(),
        status: "registrado",
        fecha,
        horaEvento,
        anio,
        mes,
        mes_1,
        sem,
        dia,
        rangoHorario,
        tipoIncidente,
        descripcion,
        ubicacion,
        tipoVia,
        direccionVia,
        lugarIncidente,
        modeloMR,
        nroMR,
        nroCarrera,
        personalInvolucrado,
        tipoCausa,
        posibleCausa,
        informacionAdicional,
        camaraMonitoreada,
        camaraSeleccionada,
        demora,
        fuente: "MANUAL",
        createdAt: new Date().toISOString(),
        createdBy: "Usuario"
      };

      const existingEvents = JSON.parse(localStorage.getItem('monitoreo_events') || '[]');
      localStorage.setItem('monitoreo_events', JSON.stringify([newEvent, ...existingEvents]));
      
      setShowSuccess(true);
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/monitoreo");
  };

  if (showSuccess) {
    return (
      <MonitoreoShell>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00A94F]/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-[#00A94F]" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">Evento registrado correctamente</h2>
            <p className="text-ink-quiet mb-6">El evento ha sido guardado exitosamente en el sistema</p>

            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setShowSuccess(false)}>
                Registrar otro evento
              </Button>
              <Button onClick={() => navigate("/monitoreo")}>
                Volver al dashboard
              </Button>
            </div>
          </Card>
        </div>
      </MonitoreoShell>
    );
  }

  return (
    <MonitoreoShell>
      <div className="w-full px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight">Registro Manual</h1>
            <p className="text-[13px] text-ink-quiet mt-1">
              Complete la información del evento. Los campos marcados con * son obligatorios.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Formulario compacto en orden del Excel */}
          <Card className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <Field label="Fecha *" required>
                <Input 
                  type="text"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className={errors.fecha ? "border-red-500" : ""}
                />
                {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
              </Field>

              <Field label="Hora *" required>
                <Input 
                  type="text"
                  value={horaEvento}
                  onChange={(e) => setHoraEvento(e.target.value)}
                  placeholder="HH:MM"
                  className={errors.horaEvento ? "border-red-500" : ""}
                />
                {errors.horaEvento && <p className="text-xs text-red-500 mt-1">{errors.horaEvento}</p>}
              </Field>

              <Field label="Año">
                <Input 
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="text-sm"
                />
              </Field>

              <Field label="Mes">
                <Input 
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field label="Mes_1">
                <Input 
                  value={mes_1}
                  onChange={(e) => setMes_1(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field label="Sem">
                <Input 
                  type="number"
                  value={sem}
                  onChange={(e) => setSem(Number(e.target.value))}
                  className="text-sm"
                />
              </Field>

              <Field label="Día">
                <Input 
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field label="Rango horario">
                <Input 
                  value={rangoHorario}
                  onChange={(e) => setRangoHorario(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field label="Tipo incidente *" required className="md:col-span-2">
                <Select 
                  value={tipoIncidente} 
                  onChange={(e) => setTipoIncidente(e.target.value)}
                  className={errors.tipoIncidente ? "border-red-500" : ""}
                >
                  {INCIDENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                {errors.tipoIncidente && <p className="text-xs text-red-500 mt-1">{errors.tipoIncidente}</p>}
              </Field>

              <Field label="Descripción *" required className="md:col-span-2 lg:col-span-4">
                <Textarea 
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Describa el evento..."
                  className={errors.descripcion ? "border-red-500" : ""}
                />
                {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>}
              </Field>

              <Field label="Ubicación *" required>
                <Select 
                  value={ubicacion} 
                  onChange={(e) => setUbicacion(e.target.value)}
                  className={errors.ubicacion ? "border-red-500" : ""}
                >
                  {LOCATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                {errors.ubicacion && <p className="text-xs text-red-500 mt-1">{errors.ubicacion}</p>}
              </Field>

              <Field label="Tipo vía *" required>
                <Select 
                  value={tipoVia} 
                  onChange={(e) => setTipoVia(e.target.value)}
                >
                  {VIA_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Dirección vía *" required>
                <Select 
                  value={direccionVia} 
                  onChange={(e) => setDireccionVia(e.target.value)}
                >
                  {VIA_DIRECCION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Lugar incidente *" required>
                <Select 
                  value={lugarIncidente} 
                  onChange={(e) => setLugarIncidente(e.target.value)}
                >
                  {STATION_CODES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Modelo MR">
                <Select 
                  value={modeloMR} 
                  onChange={(e) => setModeloMR(e.target.value)}
                >
                  {MR_MODELS.map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Nro. MR">
                <Select 
                  value={nroMR} 
                  onChange={(e) => setNroMR(e.target.value)}
                >
                  {MR_NUMBERS.map(num => (
                    <option key={num.value} value={num.value}>{num.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Nro. Carrera">
                <Input 
                  value={nroCarrera}
                  onChange={(e) => setNroCarrera(e.target.value)}
                  placeholder="Carrera"
                />
              </Field>

              <Field label="Personal/Falla">
                <Select 
                  value={personalInvolucrado} 
                  onChange={(e) => setPersonalInvolucrado(e.target.value)}
                >
                  {PERSONAL_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Tipo causa *" required>
                <Select 
                  value={tipoCausa} 
                  onChange={(e) => setTipoCausa(e.target.value)}
                  className={errors.tipoCausa ? "border-red-500" : ""}
                >
                  {CAUSE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
                {errors.tipoCausa && <p className="text-xs text-red-500 mt-1">{errors.tipoCausa}</p>}
              </Field>

              <Field label="Posible causa">
                <Select 
                  value={posibleCausa} 
                  onChange={(e) => setPosibleCausa(e.target.value)}
                >
                  {POSSIBLE_CAUSES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Info adicional" className="md:col-span-2 lg:col-span-4">
                <Textarea 
                  value={informacionAdicional}
                  onChange={(e) => setInformacionAdicional(e.target.value)}
                  rows={2}
                  placeholder="Información adicional..."
                />
              </Field>

              <Field label="Cámara">
                <Select 
                  value={camaraMonitoreada ? "si" : "no"} 
                  onChange={(e) => setCamaraMonitoreada(e.target.value === "si")}
                >
                  <option value="no">ns</option>
                  <option value="si">Sí</option>
                </Select>
              </Field>

              {camaraMonitoreada && (
                <Field label="Cámara seleccionada">
                  <Input 
                    value={camaraSeleccionada}
                    onChange={(e) => setCamaraSeleccionada(e.target.value)}
                    placeholder="Ej: CAM-024"
                  />
                </Field>
              )}

              <Field label="Demora">
                <Input 
                  value={demora}
                  onChange={(e) => setDemora(e.target.value)}
                  placeholder=""
                />
              </Field>
            </div>
          </Card>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" className="bg-[#00A94F] hover:bg-[#008F42]" disabled={loading}>
              {loading ? 'Guardando...' : <><Save className="h-4 w-4 mr-2" /> Registrar evento</>}
            </Button>
          </div>
        </form>
      </div>
    </MonitoreoShell>
  );
}
