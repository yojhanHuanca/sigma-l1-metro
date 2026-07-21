import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Bell,
  LogOut,
  RotateCcw,
  Check,
  Moon,
  Globe,
  Clock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SegShell } from "@/design-system/layout/SegShell";
import { Card, CardHeader } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select } from "@/design-system/primitives/Input";
import { Avatar } from "@/design-system/primitives/Avatar";
import { Pill } from "@/design-system/primitives/Pill";
import { Modal } from "@/design-system/primitives/Modal";

export function Profile() {
  const { currentUser, setRole, resetAll, cases } = useStore();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.stage !== "cierre" && c.stage !== "rechazado").length,
    closed: cases.filter((c) => c.stage === "cierre").length,
  };

  return (
    <SegShell>
      <div>
        <h1 className="text-[22px] font-bold text-ink tracking-tight">Mi Perfil</h1>
        <p className="text-[13px] text-ink-quiet mt-1">Información de la cuenta y preferencias del sistema.</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="space-y-5">
          <Card className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-brand-700 text-white grid place-items-center text-[26px] font-bold">
              {currentUser.initials}
            </div>
            <h2 className="mt-4 text-[18px] font-bold text-ink">{currentUser.name}</h2>
            <p className="text-[12.5px] text-ink-quiet mt-0.5">{currentUser.email}</p>
            <div className="mt-3 flex justify-center">
              <Pill tone="brand" dot><ShieldCheck className="h-3 w-3" /> Seguridad Operativa</Pill>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<ShieldCheck className="h-4.5 w-4.5" />} title="Resumen de actividad" />
            <div className="space-y-3">
              <StatRow label="Casos gestionados" value={stats.total} />
              <StatRow label="Casos activos" value={stats.open} />
              <StatRow label="Casos cerrados" value={stats.closed} />
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader icon={<User className="h-4.5 w-4.5" />} title="Datos personales" subtitle="Información de la cuenta institucional" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombres y apellidos">
                <Input defaultValue={currentUser.name} />
              </Field>
              <Field label="Correo institucional">
                <Input defaultValue={currentUser.email} />
              </Field>
              <Field label="Teléfono">
                <Input defaultValue="+51 999 887 654" />
              </Field>
              <Field label="Área">
                <Select defaultValue="seguridad">
                  <option value="seguridad">Seguridad Operativa</option>
                </Select>
              </Field>
              <Field label="Cargo">
                <Input defaultValue="Analista Senior de Seguridad Operativa" />
              </Field>
              <Field label="Sede">
                <Select defaultValue="central">
                  <option value="central">Estación Central · Centro de Control</option>
                  <option value="atocongo">Atocongo</option>
                </Select>
              </Field>
            </div>
            <div className="mt-5 pt-4 border-t border-line-soft flex items-center justify-end gap-2">
              {saved && (
                <span className="text-[12px] text-brand-700 font-medium flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Cambios guardados
                </span>
              )}
              <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
                <Check className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Bell className="h-4.5 w-4.5" />} title="Preferencias de notificación" subtitle="Cómo y cuándo recibir avisos" />
            <div className="space-y-1">
              <ToggleRow icon={<Mail className="h-4 w-4" />} label="Notificaciones por correo" description="Recibir avisos en el correo institucional" defaultOn />
              <ToggleRow icon={<Bell className="h-4 w-4" />} label="Alertas críticas en tiempo real" description="Avisos inmediatos para casos críticos" defaultOn />
              <ToggleRow icon={<Clock className="h-4 w-4" />} label="Resumen diario" description="Correo con el consolidado del día a las 08:00" />
              <ToggleRow icon={<ShieldCheck className="h-4 w-4" />} label="Notificaciones de SLA" description="Avisos cuando un caso está próximo a vencer" defaultOn />
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Globe className="h-4.5 w-4.5" />} title="Apariencia y región" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Idioma">
                <Select defaultValue="es">
                  <option value="es">Español (Perú)</option>
                  <option value="en">English</option>
                </Select>
              </Field>
              <Field label="Zona horaria">
                <Select defaultValue="lima">
                  <option value="lima">America/Lima (UTC-5)</option>
                </Select>
              </Field>
              <Field label="Tema">
                <Select defaultValue="light">
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </Select>
              </Field>
              <Field label="Formato de fecha">
                <Select defaultValue="dmy">
                  <option value="dmy">DD MMM YYYY</option>
                  <option value="ymd">YYYY-MM-DD</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Danger / session */}
          <Card className="border-critical/20">
            <CardHeader icon={<LogOut className="h-4.5 w-4.5" />} title="Sesión y datos" subtitle="Acciones de la cuenta en este dispositivo" />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setRole(null); navigate("/"); }}>
                  <LogOut className="h-4 w-4" /> Cambiar de perfil
                </Button>
                <Button variant="ghost" size="sm" className="text-critical hover:bg-critical-soft" onClick={() => setResetOpen(true)}>
                  <RotateCcw className="h-4 w-4" /> Restablecer datos de demo
                </Button>
              </div>
              <span className="text-[11.5px] text-ink-faint">Los datos se guardan solo en este navegador.</span>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Restablecer datos de demostración"
        subtitle="Se borrarán todos los cambios y se recargarán los casos sembrados."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { resetAll(); setResetOpen(false); navigate("/seguridad"); }}>
              <RotateCcw className="h-4 w-4" /> Restablecer
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-soft">
          Esta acción devuelve el sistema al estado inicial de demostración. Los casos y
          notificaciones que modificó durante la sesión se perderán.
        </p>
      </Modal>
    </SegShell>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-ink-soft">{label}</span>
      <span className="text-[16px] font-bold tabular-nums text-ink">{value}</span>
    </div>
  );
}

function ToggleRow({ icon, label, description, defaultOn }: { icon: React.ReactNode; label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-line-soft last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-surface-2 text-ink-soft grid place-items-center shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">{label}</p>
          <p className="text-[11.5px] text-ink-quiet mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-brand-600" : "bg-surface-3"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

