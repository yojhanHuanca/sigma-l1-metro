import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserPlus,
  Building2,
  RefreshCw,
  Search,
  Download,
  ArrowUpDown,
  ChevronRight,
  X,
  Check,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  FileText,
  ClipboardList,
  Activity,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Filter,
  History,
  LayoutDashboard,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";
import { Modal } from "@/design-system/primitives/Modal";
import { Pill } from "@/design-system/primitives/Pill";
import {
  AREA_LABELS,
  USER_ROLE_LABELS,
  USER_ROLE_TONE,
  type User,
  type UserRole,
} from "@/lib/types";
import { cn, formatDate, formatDateTime, relativeTime } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const CHART = {
  brand: "#14814a", brandLight: "#6fbd86", critical: "#d23a2c",
  warning: "#d99520", info: "#2c7be0", ink: "#41504a", inkFaint: "#a4aba6", surface: "#eef2f1",
};

type Tab = "dashboard" | "usuarios" | "sincronizacion";

export function UsersModule() {
  const { users, syncLogs } = useStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ newCount: number; updatedCount: number; deactivatedCount: number; durationSec: number } | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const store = useStore();

  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === "activo").length;
    const inactive = users.filter((u) => u.status === "inactivo").length;
    const areas = new Set(users.map((u) => u.area).filter(Boolean)).size;
    return { total: users.length, active, inactive, areas };
  }, [users]);

  const runSync = async () => {
    setSyncing(true);
    setSyncModalOpen(true);
    const result = await store.syncFromExcel();
    setSyncing(false);
    setSyncResult(result);
  };

  return (
    <SegShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Administración de Usuarios</h1>
          <p className="text-[13px] text-ink-quiet mt-1">Sincronización con Excel corporativo · Gestión de roles y permisos</p>
        </div>
        <Button onClick={runSync} disabled={syncing} size="sm">
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Sincronizando…" : "Sincronizar Excel"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex items-center gap-1 p-1 rounded-lg bg-white border border-line w-fit">
        {[
          { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
          { id: "usuarios" as const, label: "Usuarios", icon: UsersIcon },
          { id: "sincronizacion" as const, label: "Historial de Sincronización", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "h-9 px-3.5 rounded-md text-[12.5px] font-medium transition-colors flex items-center gap-2",
              tab === t.id ? "bg-brand-700 text-white shadow-sm" : "text-ink-soft hover:bg-surface"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab users={users} stats={stats} onSync={runSync} syncing={syncing} />}
      {tab === "usuarios" && <UsersTab users={users} />}
      {tab === "sincronizacion" && <SyncHistoryTab syncLogs={syncLogs} />}

      {/* Modal de sincronización */}
      <SyncModal
        open={syncModalOpen}
        onClose={() => { if (!syncing) { setSyncModalOpen(false); setSyncResult(null); } }}
        syncing={syncing}
        result={syncResult}
      />
    </SegShell>
  );
}

/* ─── Dashboard Tab ─── */
function DashboardTab({ users, stats, onSync, syncing }: { users: User[]; stats: { total: number; active: number; inactive: number; areas: number }; onSync: () => void; syncing: boolean }) {
  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach((u) => map.set(u.area ?? "—", (map.get(u.area ?? "—") ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [users]);

  const byStatus = useMemo(() => [
    { name: "Activos", value: stats.active, color: CHART.brand },
    { name: "Inactivos", value: stats.inactive, color: CHART.inkFaint },
  ], [stats]);

  const byCargo = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach((u) => map.set(u.userRole, (map.get(u.userRole) ?? 0) + 1));
    const palette = [CHART.brand, CHART.info, CHART.warning, CHART.critical, CHART.brandLight, "#8a6fd6"];
    return Array.from(map.entries()).map(([role, value], i) => ({ name: USER_ROLE_LABELS[role as UserRole], value, color: palette[i % palette.length] }));
  }, [users]);

  return (
    <div className="mt-5 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={<UsersIcon className="h-5 w-5" />} label="Total trabajadores" value={stats.total} tone="neutral" />
        <KpiCard icon={<UserCheck className="h-5 w-5" />} label="Usuarios activos" value={stats.active} tone="brand" />
        <KpiCard icon={<UserX className="h-5 w-5" />} label="Usuarios inactivos" value={stats.inactive} tone="neutral" />
        <KpiCard icon={<UserPlus className="h-5 w-5" />} label="Nuevos sincronizados" value={3} tone="info" />
        <KpiCard icon={<Building2 className="h-5 w-5" />} label="Áreas registradas" value={stats.areas} tone="brand" />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-ink">Trabajadores por área</h3>
              <p className="text-[12px] text-ink-quiet">Distribución del personal</p>
            </div>
            <Pill tone="brand" dot>{stats.areas} áreas</Pill>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byArea} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }} barCategoryGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.surface} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART.inkFaint, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: CHART.ink, fontSize: 11.5 }} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e5", fontSize: 12 }} cursor={{ fill: CHART.surface, fillOpacity: 0.5 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14} fill={CHART.brand} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-ink">Activos vs Inactivos</h3>
            <p className="text-[12px] text-ink-quiet">Estado del personal</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                {byStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e5", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {byStatus.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name}
                <span className="ml-auto tabular-nums text-ink-quiet">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-ink">Distribución por cargo</h3>
          <p className="text-[12px] text-ink-quiet">Roles asignados en el sistema</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCargo} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={18}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.surface} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: CHART.inkFaint, fontSize: 10.5 }} tickLine={false} axisLine={false} dy={6} />
            <YAxis tick={{ fill: CHART.inkFaint, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e5", fontSize: 12 }} cursor={{ fill: CHART.surface, fillOpacity: 0.4 }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
              {byCargo.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function KpiCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "neutral" | "brand" | "info" }) {
  return (
    <Card className="p-4">
      <div className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0",
        tone === "brand" ? "bg-brand-50 text-brand-700" : tone === "info" ? "bg-info-soft text-info-ink" : "bg-surface-2 text-ink-soft")}>
        {icon}
      </div>
      <p className="mt-3 text-[24px] font-bold tabular-nums text-ink leading-none">{value}</p>
      <p className="text-[12px] text-ink-quiet mt-1.5">{label}</p>
    </Card>
  );
}

/* ─── Users Tab ─── */
function UsersTab({ users }: { users: User[] }) {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "code" | "area" | "cargo">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    let list = users;
    if (areaFilter) list = list.filter((u) => u.area === areaFilter);
    if (statusFilter) list = list.filter((u) => u.status === statusFilter);
    if (roleFilter) list = list.filter((u) => u.userRole === roleFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.cargo.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return sorted;
  }, [users, query, areaFilter, statusFilter, roleFilter, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const headers = ["Código", "Nombre", "Cargo", "Área", "Correo", "Teléfono", "Estado", "Rol", "Fecha ingreso"];
    const rows = filtered.map((u) => [u.code, u.name, u.cargo, u.area ? AREA_LABELS[u.area] : "", u.email, u.phone ?? "", u.status, USER_ROLE_LABELS[u.userRole], u.hiredAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "usuarios_sigma_l1.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Toolbar */}
      <Card className="p-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 h-9 px-3 rounded-lg bg-surface border border-line">
          <Search className="h-4 w-4 text-ink-faint shrink-0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, código, correo o cargo…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-faint" />
        </div>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="h-9 px-3 pr-8 rounded-lg bg-white border border-line text-[12.5px] text-ink-soft cursor-pointer">
          <option value="">Todas las áreas</option>
          {Object.entries(AREA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 pr-8 rounded-lg bg-white border border-line text-[12.5px] text-ink-soft cursor-pointer">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-3 pr-8 rounded-lg bg-white border border-line text-[12.5px] text-ink-soft cursor-pointer">
          <option value="">Todos los roles</option>
          {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4" /> Exportar</Button>
      </Card>

      {/* Tabla */}
      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/60 border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3 w-[60px]">Foto</th>
                <SortHeader label="Código" k="code" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[110px]" />
                <SortHeader label="Nombre" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Cargo" k="cargo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[180px]" />
                <SortHeader label="Área" k="area" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[150px]" />
                <th className="px-4 py-3 w-[200px]">Correo</th>
                <th className="px-4 py-3 w-[90px]">Estado</th>
                <th className="px-4 py-3 w-[120px]">Última sync</th>
                <th className="px-4 py-3 w-[80px] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface/40 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="h-9 w-9 rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0" style={{ background: u.avatarColor ?? "#14814a" }}>
                      {u.initials}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-[12px] font-semibold text-brand-700">{u.code}</span></td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-[13px] font-semibold text-ink truncate">{u.name}</p>
                    <p className="text-[11px] text-ink-quiet mt-0.5">{USER_ROLE_LABELS[u.userRole]}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-[12.5px] text-ink-soft">{u.cargo}</span></td>
                  <td className="px-4 py-3"><span className="text-[12.5px] text-ink-soft">{u.area ? AREA_LABELS[u.area] : "—"}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-ink-soft truncate block max-w-[180px]">{u.email}</span></td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[10.5px] font-semibold px-2 py-0.5 rounded-full", u.status === "activo" ? "bg-brand-50 text-brand-800" : "bg-surface-2 text-ink-quiet")}>
                      {u.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11.5px] text-ink-quiet">{formatDate(u.lastSyncAt)}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)}>Ver <ChevronRight className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-[13px] text-ink-quiet">No se encontraron usuarios con los filtros seleccionados.</div>
        )}
        <div className="p-3 border-t border-line-soft text-[11.5px] text-ink-quiet">
          Mostrando {filtered.length} de {users.length} usuarios
        </div>
      </Card>

      {/* Panel lateral del usuario */}
      {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

function SortHeader({ label, k, sortKey, sortDir, onSort, className }: { label: string; k: "name" | "code" | "area" | "cargo"; sortKey: string; sortDir: "asc" | "desc"; onSort: (k: "name" | "code" | "area" | "cargo") => void; className?: string }) {
  const active = sortKey === k;
  return (
    <th className={cn("px-4 py-3", className)}>
      <button onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 hover:text-ink transition-colors", active && "text-ink")}>
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active ? "text-brand-700" : "text-ink-faint")} />
      </button>
    </th>
  );
}

/* ─── User Drawer ─── */
function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const { assignUserRole, deactivateUser, cases } = useStore();
  const [role, setRole] = useState<UserRole>(user.userRole);

  const userCases = cases.filter((c) => c.assignee === user.name || c.reporter === user.name).slice(0, 5);
  const pendingPlans = userCases.filter((c) => c.stage === "ejecucion" || c.stage === "plan_accion").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-[var(--shadow-pop)] animate-[riseUp_0.25s_ease-out] flex flex-col">
        <div className="p-5 border-b border-line-soft flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-14 w-14 rounded-full grid place-items-center text-white text-[16px] font-bold shrink-0" style={{ background: user.avatarColor ?? "#14814a" }}>
              {user.initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold text-ink leading-tight truncate">{user.name}</h3>
              <p className="text-[12px] text-ink-quiet mt-0.5">{user.cargo}</p>
              <div className="mt-1.5"><Pill tone={user.status === "activo" ? "brand" : "neutral"} dot>{user.status === "activo" ? "Activo" : "Inactivo"}</Pill></div>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 h-8 w-8 grid place-items-center rounded-lg text-ink-quiet hover:bg-surface-2 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Datos */}
          <div className="space-y-2.5">
            <Row icon={<FileText className="h-3.5 w-3.5" />} label="Código" value={user.code} />
            <Row icon={<Building2 className="h-3.5 w-3.5" />} label="Área" value={user.area ? AREA_LABELS[user.area] : "—"} />
            <Row icon={<Mail className="h-3.5 w-3.5" />} label="Correo" value={user.email} />
            <Row icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={user.phone ?? "—"} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha de ingreso" value={formatDate(user.hiredAt)} />
            <Row icon={<RefreshCw className="h-3.5 w-3.5" />} label="Última sincronización" value={formatDateTime(user.lastSyncAt)} />
          </div>

          {/* Gestión de roles */}
          <div>
            <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Rol asignado</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((r) => (
                <button key={r} onClick={() => { setRole(r); assignUserRole(user.id, r); }}
                  className={cn("p-2.5 rounded-lg border text-left text-[12px] font-medium transition-all",
                    role === r ? "border-brand-600 bg-brand-50 text-brand-900" : "border-line bg-white text-ink-soft hover:bg-surface/50")}>
                  {USER_ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <div className="mt-2.5"><Pill tone={USER_ROLE_TONE[role]} dot>Rol actual: {USER_ROLE_LABELS[role]}</Pill></div>
          </div>

          {/* Stats de casos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface border border-line p-3">
              <div className="flex items-center gap-2 text-ink-faint"><ClipboardList className="h-4 w-4" /><span className="text-[10.5px] font-medium uppercase">Casos asignados</span></div>
              <p className="text-[20px] font-bold text-ink mt-1.5">{userCases.length}</p>
            </div>
            <div className="rounded-lg bg-surface border border-line p-3">
              <div className="flex items-center gap-2 text-ink-faint"><Activity className="h-4 w-4" /><span className="text-[10.5px] font-medium uppercase">Planes pendientes</span></div>
              <p className="text-[20px] font-bold text-ink mt-1.5">{pendingPlans}</p>
            </div>
          </div>

          {/* Casos recientes */}
          {userCases.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-faint mb-2">Casos recientes</p>
              <div className="space-y-1.5">
                {userCases.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-md bg-surface text-[12px]">
                    <span className="font-mono text-brand-700 font-semibold">{c.id}</span>
                    <span className="text-ink-soft truncate">{c.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line-soft bg-surface/50">
          {user.status === "activo" ? (
            <Button variant="outline" size="sm" className="w-full text-critical hover:bg-critical-soft" onClick={() => deactivateUser(user.id)}>
              <UserX className="h-4 w-4" /> Dar de baja
            </Button>
          ) : (
            <div className="rounded-lg bg-surface-2 p-3 text-[12px] text-ink-quiet text-center">Usuario inactivo</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-ink-faint shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] text-ink-faint">{label}</p>
        <p className="text-[12.5px] text-ink font-medium mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Sync History Tab ─── */
function SyncHistoryTab({ syncLogs }: { syncLogs: import("@/lib/types").SyncLog[] }) {
  return (
    <div className="mt-5">
      <Card padded={false} className="overflow-hidden">
        <div className="p-5 border-b border-line-soft">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center"><History className="h-4.5 w-4.5" /></div>
            <div>
              <h3 className="text-[15px] font-bold text-ink leading-tight">Historial de sincronizaciones</h3>
              <p className="text-[12px] text-ink-quiet">Registro de todas las sincronizaciones con Excel</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/60 border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Nuevos</th>
                <th className="px-4 py-3">Actualizados</th>
                <th className="px-4 py-3">Bajas</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3 w-[100px]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface/40 transition-colors">
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-ink font-medium">{formatDateTime(log.at)}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-ink-soft">{log.triggeredBy}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-brand-700 font-semibold tabular-nums">+{log.newUsers}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-info-ink font-semibold tabular-nums">{log.updatedUsers}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-critical-ink font-semibold tabular-nums">-{log.deactivatedUsers}</span></td>
                  <td className="px-4 py-3.5"><span className="text-[12.5px] text-ink-soft tabular-nums">{log.durationSec}s</span></td>
                  <td className="px-4 py-3.5">
                    {log.status === "completada"
                      ? <Pill tone="brand" dot>Completada</Pill>
                      : <Pill tone="warning" dot>En proceso</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {syncLogs.length === 0 && <div className="p-10 text-center text-[13px] text-ink-quiet">No hay sincronizaciones registradas.</div>}
      </Card>
    </div>
  );
}

/* ─── Sync Modal ─── */
function SyncModal({ open, onClose, syncing, result }: { open: boolean; onClose: () => void; syncing: boolean; result: { newCount: number; updatedCount: number; deactivatedCount: number; durationSec: number } | null }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={syncing ? "Sincronizando con Excel" : "Sincronización completada"}
      subtitle={syncing ? "Leyendo archivo Excel corporativo…" : "Resumen del proceso de sincronización"}
      size="sm"
      footer={syncing ? undefined : <Button onClick={onClose} className="w-full"><Check className="h-4 w-4" /> Cerrar</Button>}
    >
      {syncing ? (
        <div className="py-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 grid place-items-center">
            <Loader2 className="h-8 w-8 text-brand-700 animate-spin" />
          </div>
          <p className="mt-4 text-[14px] font-semibold text-ink">Conectando con Excel corporativo</p>
          <p className="text-[12.5px] text-ink-quiet mt-1">Leyendo trabajadores, detectando cambios y actualizando información…</p>
          <div className="mt-4 space-y-1.5 text-left">
            {["Conectando al archivo…", "Leyendo registros…", "Detectando cambios…", "Actualizando plataforma…"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Loader2 className="h-3.5 w-3.5 text-brand-700 animate-spin" /> {t}
              </div>
            ))}
          </div>
        </div>
      ) : result ? (
        <div className="py-2">
          <div className="mx-auto h-16 w-16 rounded-full bg-brand-700 grid place-items-center animate-[riseUp_0.4s_ease-out]">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <p className="mt-3 text-center text-[14px] font-semibold text-ink">¡Sincronización completada!</p>
          <div className="mt-4 space-y-2.5">
            <ResultRow icon={<UserPlus className="h-4 w-4" />} label="Nuevos trabajadores" value={`+${result.newCount}`} tone="brand" />
            <ResultRow icon={<RefreshCw className="h-4 w-4" />} label="Trabajadores actualizados" value={`${result.updatedCount}`} tone="info" />
            <ResultRow icon={<UserX className="h-4 w-4" />} label="Dados de baja" value={`-${result.deactivatedCount}`} tone="critical" />
            <ResultRow icon={<Activity className="h-4 w-4" />} label="Tiempo total" value={`${result.durationSec} segundos`} tone="neutral" />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function ResultRow({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "brand" | "info" | "critical" | "neutral" }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-line">
      <span className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0",
        tone === "brand" ? "bg-brand-50 text-brand-700" : tone === "info" ? "bg-info-soft text-info-ink" : tone === "critical" ? "bg-critical-soft text-critical-ink" : "bg-surface-2 text-ink-soft")}>
        {icon}
      </span>
      <p className="text-[13px] text-ink-soft flex-1">{label}</p>
      <p className={cn("text-[14px] font-bold tabular-nums",
        tone === "brand" ? "text-brand-700" : tone === "info" ? "text-info-ink" : tone === "critical" ? "text-critical-ink" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}
