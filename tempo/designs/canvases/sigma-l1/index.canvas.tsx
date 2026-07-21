// @tempo-home — Tempo home canvas (the workspace Run button opens this). Managed marker; do not remove.
import { Canvas, RouteStoryboard } from "tempo-sdk/canvas";

export default function SigmaL1Canvas() {
  return (
    <Canvas name="SIGMA L1">
      <RouteStoryboard
        id="RoleSelect"
        name="Selección de perfil"
        route="/"
        layout={{ x: 0, y: 0, width: 1280, height: 800 }}
      />
      <RouteStoryboard
        id="ReportanteHome"
        name="Portal Reportante — Inicio"
        route="/reportante"
        layout={{ x: 1330, y: 0, width: 1280, height: 800 }}
      />
      <RouteStoryboard
        id="NewReportWizard"
        name="Wizard — Nuevo reporte"
        route="/reportante/nuevo"
        layout={{ x: 0, y: 850, width: 1280, height: 900 }}
      />
      <RouteStoryboard
        id="Dashboard"
        name="Dashboard Ejecutivo"
        route="/seguridad"
        layout={{ x: 0, y: 1800, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="CaseList"
        name="Gestión de Casos"
        route="/seguridad/casos"
        layout={{ x: 0, y: 2750, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="CaseFile"
        name="Expediente Digital"
        route="/seguridad/casos/EXP-2026-00014"
        layout={{ x: 0, y: 3700, width: 1440, height: 950 }}
      />
      <RouteStoryboard
        id="DecisionCenter"
        name="Centro de Decisiones"
        route="/seguridad/decisiones"
        layout={{ x: 0, y: 4700, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="KPIs"
        name="KPIs"
        route="/seguridad/kpis"
        layout={{ x: 0, y: 5650, width: 1440, height: 900 }}
      />
      <RouteStoryboard
        id="Estadisticas"
        name="Estadísticas"
        route="/seguridad/estadisticas"
        layout={{ x: 0, y: 6600, width: 1440, height: 1000 }}
      />
    </Canvas>
  );
}
