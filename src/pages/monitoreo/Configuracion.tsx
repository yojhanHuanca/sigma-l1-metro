import { useState } from "react";
import { 
  Settings, 
  Save,
  Bell,
  User,
  Shield,
  Database,
  Palette
} from "lucide-react";
import { MonitoreoShell } from "@/design-system/layout/MonitoreoShell";
import { Card } from "@/design-system/primitives/Card";
import { Button } from "@/design-system/primitives/Button";
import { Field, Input, Select, Textarea } from "@/design-system/primitives/Input";

export function Configuracion() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState("light");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleSave = () => {
    localStorage.setItem('monitoreo_config', JSON.stringify({
      notifications,
      autoSave,
      theme,
      itemsPerPage
    }));
    alert('Configuración guardada exitosamente');
  };

  return (
    <MonitoreoShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">Configuración</h1>
          <p className="text-[13px] text-ink-quiet mt-1">
            Personalización del sistema de monitoreo
          </p>
        </div>

        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#00A94F]" />
            Configuración General
          </h3>
          
          <div className="space-y-4">
            <Field label="Tema">
              <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="system">Sistema</option>
              </Select>
            </Field>

            <Field label="Elementos por página">
              <Select value={itemsPerPage.toString()} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </Field>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#00A94F]" />
            Notificaciones
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Notificaciones de eventos</p>
                <p className="text-xs text-ink-quiet">Recibir alertas de nuevos incidentes</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Guardado automático</p>
                <p className="text-xs text-ink-quiet">Guardar cambios automáticamente</p>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>
          </div>
        </Card>

        {/* User Settings */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00A94F]" />
            Perfil de Usuario
          </h3>
          
          <div className="space-y-4">
            <Field label="Nombre">
              <Input placeholder="Tu nombre" />
            </Field>

            <Field label="Email">
              <Input type="email" placeholder="tu@email.com" />
            </Field>

            <Field label="Rol">
              <Select defaultValue="monitorista">
                <option value="monitorista">Monitorista</option>
                <option value="seguridad">Seguridad Operativa</option>
                <option value="jefe">Jefe de Seguridad</option>
              </Select>
            </Field>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00A94F]" />
            Seguridad
          </h3>
          
          <div className="space-y-4">
            <Field label="Contraseña actual">
              <Input type="password" placeholder="••••••••" />
            </Field>

            <Field label="Nueva contraseña">
              <Input type="password" placeholder="••••••••" />
            </Field>

            <Field label="Confirmar contraseña">
              <Input type="password" placeholder="••••••••" />
            </Field>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00A94F]" />
            Gestión de Datos
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">Exportar todos los datos</p>
                <p className="text-xs text-ink-quiet">Descargar copia de seguridad</p>
              </div>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">Limpiar datos locales</p>
                <p className="text-xs text-ink-quiet">Eliminar todos los eventos almacenados</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                Limpiar
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#00A94F] hover:bg-[#008F42]">
            <Save className="h-4 w-4 mr-2" /> Guardar Configuración
          </Button>
        </div>
      </div>
    </MonitoreoShell>
  );
}
