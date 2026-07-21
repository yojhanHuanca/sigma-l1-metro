import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { RoleSelectPage } from "@/pages/RoleSelectPage";
import { ReportanteHome } from "@/pages/reportante/ReportanteHome";
import { NewReportWizard } from "@/pages/reportante/NewReportWizard";
import { MyReports } from "@/pages/reportante/MyReports";
import { ReportanteNotifications } from "@/pages/reportante/ReportanteNotifications";
import { JefeHome } from "@/pages/jefe/JefeHome";
import { Dashboard } from "@/pages/seguridad/Dashboard";
import { DecisionCenter } from "@/pages/seguridad/DecisionCenter";
import { Alerts } from "@/pages/seguridad/Alerts";
import { CaseList } from "@/pages/seguridad/CaseList";
import { CaseFile } from "@/pages/seguridad/CaseFile";
import { KPIs } from "@/pages/seguridad/KPIs";
import { Estadisticas } from "@/pages/seguridad/Estadisticas";
import { ExportPage } from "@/pages/seguridad/ExportPage";
import { UsersModule } from "@/pages/seguridad/UsersModule";
import { SeguridadNotifications } from "@/pages/seguridad/SeguridadNotifications";
import { Profile } from "@/pages/seguridad/Profile";

function RequireRole({ role, children }: { role: "reportante" | "seguridad" | "jefe"; children: ReactNode }) {
  const { role: current } = useStore();
  const location = useLocation();
  if (current !== role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />

          <Route path="/reportante" element={<RequireRole role="reportante"><ReportanteHome /></RequireRole>} />
          <Route path="/reportante/nuevo" element={<RequireRole role="reportante"><NewReportWizard /></RequireRole>} />
          <Route path="/reportante/mis-reportes" element={<RequireRole role="reportante"><MyReports /></RequireRole>} />
          <Route path="/reportante/notificaciones" element={<RequireRole role="reportante"><ReportanteNotifications /></RequireRole>} />

          <Route path="/jefe" element={<RequireRole role="jefe"><JefeHome /></RequireRole>} />

          <Route path="/seguridad" element={<RequireRole role="seguridad"><Dashboard /></RequireRole>} />
          <Route path="/seguridad/decisiones" element={<RequireRole role="seguridad"><DecisionCenter /></RequireRole>} />
          <Route path="/seguridad/alertas" element={<RequireRole role="seguridad"><Alerts /></RequireRole>} />
          <Route path="/seguridad/casos" element={<RequireRole role="seguridad"><CaseList /></RequireRole>} />
          <Route path="/seguridad/casos/:id" element={<RequireRole role="seguridad"><CaseFile /></RequireRole>} />
          <Route path="/seguridad/kpis" element={<RequireRole role="seguridad"><KPIs /></RequireRole>} />
          <Route path="/seguridad/estadisticas" element={<RequireRole role="seguridad"><Estadisticas /></RequireRole>} />
          <Route path="/seguridad/exportar" element={<RequireRole role="seguridad"><ExportPage /></RequireRole>} />
          <Route path="/seguridad/usuarios" element={<RequireRole role="seguridad"><UsersModule /></RequireRole>} />
          <Route path="/seguridad/notificaciones" element={<RequireRole role="seguridad"><SeguridadNotifications /></RequireRole>} />
          <Route path="/seguridad/perfil" element={<RequireRole role="seguridad"><Profile /></RequireRole>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
