import { AREA_HEADS, type Area, type User, type UserRole, type SyncLog } from "./types";

const COLORS = ["#14814a", "#2c7be0", "#d99520", "#8a6fd6", "#d23a2c", "#0f6b3e", "#5fb4d4", "#c79a3e"];

function mk(
  code: string,
  name: string,
  userRole: UserRole,
  area: Area,
  cargo: string,
  email: string,
  phone: string,
  hiredAt: string,
  status: "activo" | "inactivo" = "activo"
): User {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const colorIndex = parseInt(code.replace(/\D/g, "")) % COLORS.length;
  return {
    id: `usr_${code.toLowerCase().replace(/-/g, "")}`,
    code,
    name,
    role: userRole === "jefe_area" ? "jefe" : userRole === "consulta" ? "reportante" : "seguridad",
    userRole,
    area,
    cargo,
    email,
    phone,
    initials,
    status,
    hiredAt,
    lastSyncAt: "2026-07-15T08:00:00.000Z",
    avatarColor: COLORS[colorIndex],
  };
}

export const SEED_USERS: User[] = [
  mk("EMP-0001", "Marcela Falcón", "administrador", "seguridad_fisica", "Jefa de Seguridad Operativa", "m.falcon@metrolinea1.pe", "+51 999 111 222", "2018-03-15"),
  mk("EMP-0002", "Jorge Salazar", "jefe_area", "mantenimiento", "Jefe de Mantenimiento", "j.salazar@metrolinea1.pe", "+51 999 222 333", "2017-08-20"),
  mk("EMP-0003", "Ingrid Quispe", "jefe_area", "subestaciones", "Jefa de Subestaciones", "i.quispe@metrolinea1.pe", "+51 999 333 444", "2019-01-10"),
  mk("EMP-0004", "Raúl Mendoza", "jefe_area", "operaciones", "Jefe de Operaciones", "r.mendoza@metrolinea1.pe", "+51 999 444 555", "2016-05-12"),
  mk("EMP-0005", "Cecilia Tapia", "jefe_area", "comunicaciones", "Jefa de Comunicaciones", "c.tapia@metrolinea1.pe", "+51 999 555 666", "2020-02-18"),
  mk("EMP-0006", "Luis Bravo", "jefe_area", "infraestructura", "Jefe de Infraestructura", "l.bravo@metrolinea1.pe", "+51 999 666 777", "2018-11-05"),
  mk("EMP-0007", "Ana Villanueva", "jefe_area", "material_rodante", "Jefa de Material Rodante", "a.villanueva@metrolinea1.pe", "+51 999 777 888", "2019-07-22"),
  mk("EMP-0008", "Mario Chávez", "jefe_area", "limpieza", "Jefe de Limpieza", "m.chavez@metrolinea1.pe", "+51 999 888 999", "2021-04-03"),
  mk("EMP-0009", "Patricia Ríos", "jefe_area", "seguridad_fisica", "Jefa de Seguridad Física", "p.rios@metrolinea1.pe", "+51 999 999 000", "2017-09-14"),
  mk("EMP-0010", "Carlos Núñez", "consulta", "mantenimiento", "Técnico de Mantenimiento", "c.nunez@metrolinea1.pe", "+51 988 111 222", "2022-03-01"),
  mk("EMP-0011", "Lucía Ramírez", "supervisor", "operaciones", "Supervisora de Operaciones", "l.ramirez@metrolinea1.pe", "+51 988 222 333", "2020-06-15"),
  mk("EMP-0012", "Fernando Quispe", "consulta", "infraestructura", "Operario de Infraestructura", "f.quispe@metrolinea1.pe", "+51 988 333 444", "2021-08-10"),
  mk("EMP-0013", "Sofía Erazo", "supervisor", "operaciones", "Supervisora de Turno", "s.erazo@metrolinea1.pe", "+51 988 444 555", "2019-11-20"),
  mk("EMP-0014", "Diego Salas", "consulta", "material_rodante", "Técnico de Material Rodante", "d.salas@metrolinea1.pe", "+51 988 555 666", "2022-01-18"),
  mk("EMP-0015", "Pedrio Aparicio", "consulta", "subestaciones", "Electricista de Subestaciones", "p.aparicio@metrolinea1.pe", "+51 988 666 777", "2021-05-22"),
  mk("EMP-0016", "Hugo Reyna", "supervisor", "subestaciones", "Supervisor Eléctrico", "h.reyna@metrolinea1.pe", "+51 988 777 888", "2018-12-03"),
  mk("EMP-0017", "Carmen Loayza", "analista_so", "seguridad_fisica", "Analista de Seguridad", "c.loayza@metrolinea1.pe", "+51 988 888 999", "2020-09-14"),
  mk("EMP-0018", "José Fernández", "analista_so", "seguridad_fisica", "Analista Senior SO", "j.fernandez@metrolinea1.pe", "+51 988 999 000", "2019-04-25"),
  mk("EMP-0019", "María López", "responsable_plan", "mantenimiento", "Responsable de Plan Preventivo", "m.lopez@metrolinea1.pe", "+51 977 111 222", "2021-02-08"),
  mk("EMP-0020", "Roberto Silva", "responsable_plan", "infraestructura", "Responsable de Plan Correctivo", "r.silva@metrolinea1.pe", "+51 977 222 333", "2020-12-15"),
  mk("EMP-0021", "Elena Torres", "consulta", "comunicaciones", "Operadora de Comunicaciones", "e.torres@metrolinea1.pe", "+51 977 333 444", "2022-06-30"),
  mk("EMP-0022", "Manuel Rojas", "consulta", "limpieza", "Coordinador de Limpieza", "m.rojas@metrolinea1.pe", "+51 977 444 555", "2021-10-11"),
  mk("EMP-0023", "Patricia Vega", "supervisor", "material_rodante", "Supervisora de Taller", "p.vega@metrolinea1.pe", "+51 977 555 666", "2019-03-28"),
  mk("EMP-0024", "Carlos Mendoza", "consulta", "operaciones", "Operador de Trenes", "c.mendoza@metrolinea1.pe", "+51 977 666 777", "2022-04-05"),
  mk("EMP-0025", "Rosa Flores", "consulta", "seguridad_fisica", "Agente de Seguridad", "r.flores@metrolinea1.pe", "+51 977 777 888", "2021-07-19"),
  mk("EMP-0026", "Alberto Díaz", "consulta", "mantenimiento", "Mecánico de Mantenimiento", "a.diaz@metrolinea1.pe", "+51 977 888 999", "2020-08-24"),
  mk("EMP-0027", "Sandra Castro", "analista_so", "seguridad_fisica", "Analista de Cumplimiento", "s.castro@metrolinea1.pe", "+51 977 999 000", "2018-10-30"),
  mk("EMP-0028", "Víctor Ramos", "consulta", "infraestructura", "Técnico de Obras", "v.ramos@metrolinea1.pe", "+51 966 111 222", "2022-02-14"),
  mk("EMP-0029", "Tania Vargas", "supervisor", "comunicaciones", "Supervisora de Sistemas", "t.vargas@metrolinea1.pe", "+51 966 222 333", "2021-03-09"),
  mk("EMP-0030", "Felipe Castillo", "consulta", "subestaciones", "Técnico Electrónico", "f.castillo@metrolinea1.pe", "+51 966 333 444", "2020-11-02"),
  // Usuarios inactivos (dados de baja en sincronizaciones previas)
  mk("EMP-0031", "Old Employee One", "consulta", "operaciones", "Ex Operador", "old1@metrolinea1.pe", "+51 900 000 001", "2015-01-01", "inactivo"),
  mk("EMP-0032", "Old Employee Two", "consulta", "mantenimiento", "Ex Técnico", "old2@metrolinea1.pe", "+51 900 000 002", "2014-06-15", "inactivo"),
];

// Trabajadores "nuevos" que aparecerán en la próxima sincronización
export const NEW_USERS_FROM_EXCEL: Array<Omit<User, "id" | "initials" | "lastSyncAt" | "avatarColor">> = [
  { code: "EMP-0033", name: "Daniela Mejía", role: "seguridad" as const, userRole: "analista_so" as UserRole, area: "seguridad_fisica" as Area, cargo: "Analista de Incidentes", email: "d.mejia@metrolinea1.pe", phone: "+51 955 111 222", status: "activo" as const, hiredAt: "2026-07-01" },
  { code: "EMP-0034", name: "Fernando Paz", role: "reportante" as const, userRole: "consulta" as UserRole, area: "mantenimiento" as Area, cargo: "Técnico Electromecánico", email: "f.paz@metrolinea1.pe", phone: "+51 955 222 333", status: "activo" as const, hiredAt: "2026-07-05" },
  { code: "EMP-0035", name: "Gabriela Soto", role: "reportante" as const, userRole: "consulta" as UserRole, area: "operaciones" as Area, cargo: "Operadora de Estación", email: "g.soto@metrolinea1.pe", phone: "+51 955 333 444", status: "activo" as const, hiredAt: "2026-07-08" },
];

export const SEED_SYNC_LOGS: SyncLog[] = [
  { id: "sync_1", at: "2026-07-10T08:00:00.000Z", triggeredBy: "Sistema", newUsers: 5, updatedUsers: 2, deactivatedUsers: 0, durationSec: 6, status: "completada" },
  { id: "sync_2", at: "2026-07-12T08:00:00.000Z", triggeredBy: "Sistema", newUsers: 0, updatedUsers: 4, deactivatedUsers: 1, durationSec: 5, status: "completada" },
  { id: "sync_3", at: "2026-07-15T08:00:00.000Z", triggeredBy: "Sistema", newUsers: 2, updatedUsers: 1, deactivatedUsers: 0, durationSec: 4, status: "completada" },
];
