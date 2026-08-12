import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type DireccionVia,
  type LugarIncidente,
  type ModeloMR,
  type PersonalFalla,
  type TipoCausa,
  type TipoIncidenteOperativo,
  type TipoVia,
  type Ubicacion,
} from "@/lib/types";
import { nowISO, uid } from "@/lib/utils";

// ─── Estado del evento ─────────────────────────────────────────────────────
export type EstadoEvento = "pendiente" | "en_proceso" | "resuelto" | "cerrado";

export const ESTADO_EVENTO_LABELS: Record<EstadoEvento, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

export const ESTADO_EVENTO_TONE: Record<EstadoEvento, "warning" | "brand" | "info" | "neutral"> = {
  pendiente: "warning",
  en_proceso: "brand",
  resuelto: "info",
  cerrado: "neutral",
};

export const ESTADO_EVENTO_OPTIONS = Object.keys(ESTADO_EVENTO_LABELS) as EstadoEvento[];

// ─── Autocalculados ────────────────────────────────────────────────────────
export interface CamposAutomaticos {
  anio: number | null;
  mes: string;
  mes_1: string;
  semana: number | null;
  dia: string;
  rangoHorario: string;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function parseFecha(fecha: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha.trim());
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  if (y < 2000 || y > 2100) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function esHoraValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora.trim());
}

export function calcAutos(fecha: string, hora: string): CamposAutomaticos {
  const dt = parseFecha(fecha);
  const hm = /^(\d{2}):(\d{2})$/.exec(hora.trim());
  const hh = hm ? Number(hm[1]) : -1;
  const rango =
    hh >= 0 && hh <= 23
      ? `${String(hh).padStart(2, "0")}:00 - ${String(hh).padStart(2, "0")}:59`
      : "";
  if (!dt) {
    return { anio: null, mes: "", mes_1: "", semana: null, dia: "", rangoHorario: rango };
  }
  const inicioAnio = new Date(dt.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((dt.getTime() - inicioAnio.getTime()) / 86400000) + 1;
  return {
    anio: dt.getFullYear(),
    mes: MESES[dt.getMonth()],
    mes_1: `${MESES_CORTOS[dt.getMonth()]}-${dt.getFullYear()}`,
    semana: Math.floor((dayOfYear - 1) / 7) + 1,
    dia: DIAS[dt.getDay()],
    rangoHorario: rango,
  };
}

export function formatoHoy(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function formatoDemora(min: number | null): string {
  if (min === null || min === undefined || Number.isNaN(min)) return "—";
  if (min === 0) return "0 min";
  return `${min} min`;
}

// ─── Evento ────────────────────────────────────────────────────────────────
export interface EventoOperativo extends CamposAutomaticos {
  id: string;
  codigo: string;
  fecha: string;
  hora: string;
  tipoIncidente: TipoIncidenteOperativo;
  ubicacion: Ubicacion;
  tipoVia: TipoVia | "";
  direccionVia: DireccionVia | "";
  lugarIncidente: LugarIncidente | "";
  modeloMR: ModeloMR | "";
  nroMR: string;
  nroCarrera: string;
  personalFalla: PersonalFalla | "";
  tipoCausa: TipoCausa | "";
  posibleCausa: string;
  descripcion: string;
  informacionAdicional: string;
  camaraMonitoreada: string;
  demora: number | null;
  estado: EstadoEvento;
  registradoAt: string;
  registradoPor: string;
}

export interface EventoFormInput {
  fecha: string;
  hora: string;
  tipoIncidente: TipoIncidenteOperativo;
  ubicacion: Ubicacion;
  tipoVia: TipoVia | "";
  direccionVia: DireccionVia | "";
  lugarIncidente: LugarIncidente | "";
  modeloMR: ModeloMR | "";
  nroMR: string;
  nroCarrera: string;
  personalFalla: PersonalFalla | "";
  tipoCausa: TipoCausa | "";
  posibleCausa: string;
  descripcion: string;
  informacionAdicional: string;
  camaraMonitoreada: string;
  demora: number | null;
  estado: EstadoEvento;
}

function codigoSiguiente(eventos: EventoOperativo[], anio: number): string {
  const max = eventos.reduce((acc, e) => {
    const m = /^EV-(\d{4})-(\d{5})$/.exec(e.codigo);
    if (m && Number(m[1]) === anio) return Math.max(acc, Number(m[2]));
    return acc;
  }, 0);
  return `EV-${anio}-${String(max + 1).padStart(5, "0")}`;
}

function buildEvento(input: EventoFormInput, base?: EventoOperativo): EventoOperativo {
  const autos = calcAutos(input.fecha, input.hora);
  const anio = autos.anio ?? new Date().getFullYear();
  const codigo = base?.codigo ?? `EV-${anio}-XXXXX`;
  return {
    id: base?.id ?? uid("evo"),
    codigo,
    fecha: input.fecha.trim(),
    hora: input.hora.trim(),
    ...autos,
    tipoIncidente: input.tipoIncidente,
    ubicacion: input.ubicacion,
    tipoVia: input.tipoVia,
    direccionVia: input.direccionVia,
    lugarIncidente: input.lugarIncidente,
    modeloMR: input.modeloMR,
    nroMR: input.nroMR.trim(),
    nroCarrera: input.nroCarrera.trim(),
    personalFalla: input.personalFalla,
    tipoCausa: input.tipoCausa,
    posibleCausa: input.posibleCausa.trim(),
    descripcion: input.descripcion.trim(),
    informacionAdicional: input.informacionAdicional.trim(),
    camaraMonitoreada: input.camaraMonitoreada.trim(),
    demora: input.demora,
    estado: input.estado,
    registradoAt: base?.registradoAt ?? nowISO(),
    registradoPor: base?.registradoPor ?? "María Torres",
  };
}

// ─── Datos de ejemplo ──────────────────────────────────────────────────────
const SEED_EVENTOS: EventoOperativo[] = [
  seedEvento("EV-2026-00118", "08/08/2026", "22:35", "atropello", "interestacional", "Atropello de transeúnte que cruzó la vía por la zona sur, entre Villa El Salvador y Pueblo Nuevo. Se detuvo la operación por 45 minutos.", "cerrado", { tipoVia: "par", direccionVia: "legal", lugarIncidente: "VES", personalFalla: "transeunte", tipoCausa: "factor_externo", posibleCausa: "Transeúnte en la vía", demora: 45 }),
  seedEvento("EV-2026-00119", "09/08/2026", "09:10", "caida_estacion", "escalera_electrica", "Pasajera de 68 años resbaló en la escalera eléctrica del ingreso principal. Personal de estación brindó primeros auxilios.", "resuelto", { lugarIncidente: "PIN", personalFalla: "pasajero", tipoCausa: "factor_externo", posibleCausa: "Caída", demora: 15 }),
  seedEvento("EV-2026-00120", "09/08/2026", "18:45", "ingreso_via", "estación", "Persona ingresó a la vía en el extremo norte de la estación. AVP activó protocolo de corte de tensión.", "en_proceso", { lugarIncidente: "PUM", personalFalla: "transeunte", tipoCausa: "falla_operacional", posibleCausa: "Salir", demora: 60, camaraMonitoreada: "CAM-PUM-02" }),
  seedEvento("EV-2026-00121", "10/08/2026", "07:20", "no_abre_puertas", "tren", "El MR no abrió las puertas en la estación San Juan durante la hora punta. Se realizó corte de puertas y despeje manual.", "pendiente", { modeloMR: "ALSTOM", nroMR: "T22", personalFalla: "falla_tren", tipoCausa: "falla_tecnica", posibleCausa: "Falla de tren, pedido de Trabajo 656150", demora: 25 }),
  seedEvento("EV-2026-00122", "10/08/2026", "12:05", "colision_mr_obstaculo", "interestacional", "Colisión con obstáculo en el intertramo entre Miguel Grau y El Ángel. Verificación del tren en curso.", "pendiente", { modeloMR: "ANSALDO", nroMR: "T41", nroCarrera: "C-122", personalFalla: "mr", tipoCausa: "factor_externo", posibleCausa: "Obstrucción", demora: 0 }),
  seedEvento("EV-2026-00123", "11/08/2026", "06:55", "amenaza_suicida", "andén", "Persona sobre la vía manifestó intención de arrojarse al paso del tren. Intervención de seguridad y AVP.", "en_proceso", { lugarIncidente: "SJU", personalFalla: "transeunte", tipoCausa: "factor_externo", posibleCausa: "Amenaza suicida", demora: 90, camaraMonitoreada: "CAM-SJU-04" }),
  seedEvento("EV-2026-00124", "11/08/2026", "13:30", "parada_incorrecta", "tren", "El tren se detuvo fuera de la zona de parada en estación Cabitos. Reenfoque manual de la conducción.", "pendiente", { modeloMR: "VFA", nroMR: "T05", nroCarrera: "C-088", personalFalla: "conductor", tipoCausa: "falla_operacional", posibleCausa: "Errores de manejo u operación", demora: 10, camaraMonitoreada: "CAM-TREN-05" }),
];

function seedEvento(
  codigo: string,
  fecha: string,
  hora: string,
  tipoIncidente: TipoIncidenteOperativo,
  ubicacion: Ubicacion,
  descripcion: string,
  estado: EstadoEvento,
  extra: Partial<EventoOperativo>
): EventoOperativo {
  const autos = calcAutos(fecha, hora);
  return {
    id: uid("evo"),
    codigo,
    fecha,
    hora,
    ...autos,
    tipoIncidente,
    ubicacion,
    tipoVia: "",
    direccionVia: "",
    lugarIncidente: "",
    modeloMR: "",
    nroMR: "",
    nroCarrera: "",
    personalFalla: "",
    tipoCausa: "",
    posibleCausa: "",
    informacionAdicional: "",
    camaraMonitoreada: "",
    demora: null,
    estado,
    registradoAt: nowISO(),
    registradoPor: "María Torres",
    ...extra,
  };
}

// ─── Store ─────────────────────────────────────────────────────────────────
const KEY = "monitoreo_eventos_v1";

function loadEventos(): EventoOperativo[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EventoOperativo[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return SEED_EVENTOS;
}

interface MonitoreoStoreValue {
  eventos: EventoOperativo[];
  getEvento: (id: string) => EventoOperativo | undefined;
  addEvento: (input: EventoFormInput) => EventoOperativo;
  updateEvento: (id: string, input: EventoFormInput) => void;
  nextCodigoPara: (anio: number) => string;
}

const MonitoreoContext = createContext<MonitoreoStoreValue | null>(null);

export function MonitoreoProvider({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<EventoOperativo[]>(() => loadEventos());

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(eventos));
    } catch {
      /* ignore */
    }
  }, [eventos]);

  const getEvento = useCallback(
    (id: string) => eventos.find((e) => e.id === id),
    [eventos]
  );

  const nextCodigoPara = useCallback(
    (anio: number) => codigoSiguiente(eventos, anio),
    [eventos]
  );

  const addEvento = useCallback(
    (input: EventoFormInput): EventoOperativo => {
      const autos = calcAutos(input.fecha, input.hora);
      const anio = autos.anio ?? new Date().getFullYear();
      const nuevo: EventoOperativo = {
        ...buildEvento(input),
        codigo: codigoSiguiente(eventos, anio),
      };
      setEventos((prev) => [nuevo, ...prev]);
      return nuevo;
    },
    [eventos]
  );

  const updateEvento = useCallback((id: string, input: EventoFormInput) => {
    setEventos((prev) =>
      prev.map((e) => (e.id === id ? buildEvento(input, e) : e))
    );
  }, []);

  const value = useMemo<MonitoreoStoreValue>(
    () => ({ eventos, getEvento, addEvento, updateEvento, nextCodigoPara }),
    [eventos, getEvento, addEvento, updateEvento, nextCodigoPara]
  );

  return <MonitoreoContext.Provider value={value}>{children}</MonitoreoContext.Provider>;
}

export function useMonitoreoStore(): MonitoreoStoreValue {
  const ctx = useContext(MonitoreoContext);
  if (!ctx) throw new Error("useMonitoreoStore debe usarse dentro de <MonitoreoProvider>");
  return ctx;
}
