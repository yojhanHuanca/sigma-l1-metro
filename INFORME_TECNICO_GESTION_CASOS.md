# INFORME TÉCNICO - SISTEMA DE GESTIÓN DE CASOS
## SIGMA L1 — Sistema de Gestión de Seguridad Operativa
### Línea 1 del Metro de Lima

---

## 1. RESUMEN EJECUTIVO

Este documento describe el flujo completo de gestión de casos del sistema SIGMA L1, diseñado para la gestión de seguridad operativa del Metro de Lima. El sistema permite reportar, evaluar, investigar, planificar acciones correctivas, ejecutar y verificar el cierre de incidentes de seguridad.

**Alcance:** Gestión completa de casos desde el reporte hasta el cierre, con workflow de 7 etapas, gestión de planes de acción, asignación por áreas y seguimiento de SLA.

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1. Stack Tecnológico (Prototipo Actual)
- **Frontend:** React + TypeScript
- **Estado:** Context API + localStorage (simulación de backend)
- **Rutas:** React Router
- **UI:** Componentes personalizados con TailwindCSS

### 2.2. Arquitectura Propuesta (Proyecto Real)
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express o NestJS
- **Base de Datos:** PostgreSQL o MongoDB
- **Autenticación:** JWT + OAuth2
- **API:** RESTful o GraphQL
- **File Storage:** AWS S3 o Azure Blob Storage
- **Notificaciones:** WebSocket + Email Service

---

## 3. MODELO DE DATOS

### 3.1. Tipos Principales

#### CaseFile (Caso/Reporte)
```typescript
interface CaseFile {
  id: string;                    // SOP-01-2026 (formato: SOP-XX-YYYY)
  type: TipoSOP;                // hallazgo | incidente | reporte_voluntario | accidente
  title: string;                // Título del caso
  description: string;          // Descripción detallada
  observations: string;         // Observaciones adicionales
  area: Area;                   // Área responsable
  station: string;              // Estación donde ocurrió
  location: string;             // Ubicación específica
  date: string;                 // Fecha del incidente (ISO date)
  time: string;                 // Hora del incidente
  priority: Priority;           // critica | alta | media | baja
  riskLevel: RiskLevel;         // Matriz 1A-4E (ej: 1A, 2C, 3C, etc.)
  stage: Stage;                 // Etapa actual del workflow
  reporter: string;             // Nombre del reportante
  reporterRole: Role;           // reportante | seguridad | jefe
  anonymous?: boolean;          // Reporte anónimo
  contactName?: string;         // Nombre de contacto (si no anónimo)
  contactEmail?: string;        // Email de contacto
  contactPhone?: string;        // Teléfono de contacto
  investigator?: string;        // Investigador asignado
  assignee?: string;            // Persona asignada
  assigneeArea?: Area;          // Área asignada
  assignmentPriority?: Priority; // Prioridad de asignación
  assignmentDueDate?: string;    // Fecha límite de asignación
  assignmentNote?: string;      // Notas de asignación
  involvedWorkers?: InvolvedWorker[]; // Trabajadores involucrados
  evidence: Evidence[];         // Evidencias adjuntas
  timeline: TimelineEvent[];    // Línea de tiempo de eventos
  evaluation?: Evaluation;      // Evaluación del caso
  investigation?: Investigation; // Investigación técnica
  actionPlans?: ActionPlan[];    // Planes de acción
  extensionRequest?: ExtensionRequest; // Solicitud de prórroga
  slaDueDate: string;           // Fecha límite SLA
  createdAt: string;            // Fecha de creación
  updatedAt: string;            // Fecha de última actualización
}
```

#### ActionPlan (Plan de Acción)
```typescript
interface ActionPlan {
  elaboratedBy: string;         // Quién elaboró el plan
  actionType: string;           // Correctiva | Preventiva
  description: string;          // Descripción del plan
  startDate: string;            // Fecha de inicio
  dueDate: string;              // Fecha de fin
  estimatedTime: string;        // Tiempo estimado (ej: "7 días")
  priority: Priority;           // Prioridad del plan
  observations: string;         // Observaciones
  items: ActionItem[];          // Actividades del plan
  submittedAt?: string;         // Fecha de envío
  sentToArea?: Area;            // Área destino
  reviewedAt?: string;          // Fecha de revisión
  reviewDecision?: "aprobado" | "rechazado" | "pendiente";
  reviewNote?: string;          // Nota de revisión
  planCode?: string;            // PLA-01, PLA-02, etc.
  planStatus?: "pendiente" | "cerrado";
  planDate?: string;            // Fecha del plan
  scheduledDate?: string;       // Fecha programada
  annexes?: string;             // Anexos
  secondResponsible?: string;   // Responsable secundario
  extensionRequest?: ExtensionRequest; // Solicitud de prórroga
}
```

#### ActionItem (Actividad del Plan)
```typescript
interface ActionItem {
  id: string;                   // ID único de actividad
  name: string;                 // Nombre de la actividad
  description: string;          // Descripción detallada
  owner: string;                // Responsable
  priority: Priority;           // Prioridad
  area?: Area;                  // Área responsable
  startDate: string;            // Fecha de inicio
  dueDate: string;              // Fecha límite
  progress: number;             // Progreso 0-100
  status: "pendiente" | "en_progreso" | "completado";
  comments: ActivityComment[];  // Comentarios
  extensionRequest?: ExtensionRequest; // Solicitud de prórroga
}
```

#### Investigation (Investigación)
```typescript
interface Investigation {
  findings: string;             // Hallazgos
  rootCause: string;            // Causa raíz
  technicalDescription: string; // Descripción técnica
  observations: string;         // Observaciones
  conclusions: string;          // Conclusiones
  updatedAt: string;            // Fecha de actualización
}
```

#### Evidence (Evidencia)
```typescript
interface Evidence {
  id: string;                   // ID único
  name: string;                 // Nombre del archivo
  kind: "foto" | "video" | "documento";
  size: string;                 // Tamaño (ej: "2.4 MB")
  url?: string;                 // URL del archivo (en backend)
  at: string;                   // Fecha de carga
}
```

#### TimelineEvent (Evento de Línea de Tiempo)
```typescript
interface TimelineEvent {
  id: string;                   // ID único
  kind: "creado" | "info_solicitada" | "info_recibida" | "aprobado" | 
        "rechazado" | "derivado" | "investigacion" | "plan_propuesto" | 
        "plan_aprobado" | "plan_ajustado" | "ejecucion" | "ampliacion" | 
        "seguimiento" | "cierre" | "reapertura" | "comentario" | "sancion";
  at: string;                   // Fecha del evento
  actor: string;                // Quién realizó la acción
  actorRole: Role;              // Rol del actor
  title: string;                // Título del evento
  detail?: string;              // Detalle adicional
}
```

### 3.2. Tipos Enumerados

#### Stage (Etapas del Workflow)
```typescript
type Stage = 
  | "recepcion"        // Recepción del reporte
  | "evaluacion"       // Evaluación de riesgo
  | "pendiente_info"   // Información pendiente
  | "investigacion"    // Investigación técnica
  | "plan_accion"      // Plan de acción
  | "ejecucion"        // Ejecución del plan
  | "verificacion"     // Verificación de cierre
  | "cierre"           // Cierre del caso
  | "rechazado";       // Caso rechazado
```

#### Area (Áreas Organizacionales)
```typescript
type Area = 
  | "seguridad"        // Seguridad Operativa
  | "ingenieria"       // Ingeniería
  | "mantenimiento"    // Mantenimiento
  | "operaciones"      // Operaciones
  | "rrhh"             // Recursos Humanos
  | "subestaciones"    // Subestaciones
  | "infraestructura"; // Infraestructura
```

#### Priority (Prioridad)
```typescript
type Priority = "critica" | "alta" | "media" | "baja";
```

#### RiskLevel (Matriz de Riesgo 5×5)
```typescript
type RiskLevel = 
  | "1A" | "1B" | "1C" | "1D" | "1E"
  | "2A" | "2B" | "2C" | "2D" | "2E"
  | "3A" | "3B" | "3C" | "3D" | "3E"
  | "4A" | "4B" | "4C" | "4D" | "4E";
```

#### Role (Roles de Usuario)
```typescript
type Role = "reportante" | "seguridad" | "jefe";
```

---

## 4. WORKFLOW DE GESTIÓN DE CASOS

### 4.1. Flujo de 7 Etapas

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DE GESTIÓN DE CASOS                 │
└─────────────────────────────────────────────────────────────────┘

1. RECEPCIÓN
   ↓
   - Reportante crea caso
   - Seguridad Operativa recibe y valida
   - Clasificación inicial

2. EVALUACIÓN
   ↓
   - Evaluación de riesgo (matriz 1A-4E)
   - Determinación de SLA
   - Decisión: requiere investigación

3. INVESTIGACIÓN (si aplica)
   ↓
   - Investigador asignado
   - Análisis técnico
   - Determinación de causa raíz
   - Hallazgos y conclusiones

4. PLAN DE ACCIÓN
   ↓
   - Elaboración de plan correctivo
   - Definición de actividades
   - Asignación de responsables
   - Envío a área responsable

5. EJECUCIÓN
   ↓
   - Jefe de Área recibe plan
   - Aceptación del plan
   - Ejecución de actividades
   - Actualización de progreso

6. VERIFICACIÓN
   ↓
   - Verificación de cumplimiento
   - Validación de efectividad
   - Evidencias de cierre

7. CIERRE
   ↓
   - Cierre formal del caso
   - Documentación final
   - Archivo en histórico
```

### 4.2. Transiciones de Estado

| Estado Actual | Acción | Estado Siguiente | Responsable |
|--------------|--------|------------------|-------------|
| recepcion | Validar información | evaluacion | Seguridad Operativa |
| evaluacion | Solicitar más info | pendiente_info | Seguridad Operativa |
| pendiente_info | Recibir información | evaluacion | Reportante |
| evaluacion | Derivar a investigación | investigacion | Seguridad Operativa |
| investigacion | Completar investigación | plan_accion | Investigador |
| plan_accion | Enviar plan | plan_accion (enviado) | Seguridad Operativa |
| plan_accion | Aceptar plan | ejecucion | Jefe de Área |
| plan_accion | Rechazar plan | plan_accion (ajustar) | Jefe de Área |
| ejecucion | Solicitar prórroga | ejecucion (prórroga) | Jefe de Área |
| ejecucion | Completar ejecución | verificacion | Jefe de Área |
| verificacion | Aprobar cierre | cierre | Seguridad Operativa |
| verificacion | Rechazar cierre | ejecucion | Seguridad Operativa |
| cierre | Reabrir caso | ejecucion | Seguridad Operativa |

---

## 5. INTERFACES DE USUARIO

### 5.1. Vista de Seguridad Operativa

#### CaseList.tsx - Lista de Casos
**Ubicación:** `/seguridad/casos`

**Funcionalidades:**
- Filtros por etapa (Todos, Nuevos, Pendientes, En Proceso, Prórrogas, Investigación, Verificación, Cerrados)
- Búsqueda por código, título, estación, reportante
- Filtro por área
- Ordenamiento (Recientes, Prioridad, SLA)
- Vista de tabla con información resumida
- Acciones rápidas por caso (Ver detalle, Derivar, Solicitar info)

**Campos en tabla:**
- Código del caso (SOP-XX-YYYY)
- Tipo de incidente (con badge de color)
- Título del caso
- Estación
- Área
- Prioridad/Riesgo (con badge de color)
- Estado actual (con badge de color)
- Fecha de reporte
- SLA (días restantes, con indicador de estado)
- Acciones rápidas (**botones contextuales**)

**Diseño:**
- Header con título y contadores
- Tabs de filtros horizontales
- Barra de búsqueda y filtros adicionales
- Tabla con filas expandibles
- Badges de colores para estados y prioridades
- Indicadores visuales de SLA (verde/amarillo/rojo)
- Botones de acción contextual

#### CaseFile.tsx - Detalle de Caso
**Ubicación:** `/seguridad/casos/:id`

**Funcionalidades:**
- Visualización completa del caso
- Workflow de 7 etapas con indicador visual
- Edición de campos según etapa
- Gestión de evidencias (fotos, videos, documentos)
- Línea de tiempo de eventos
- Asignación de investigador
- Creación de planes de acción
- Gestión de trabajadores involucrados
- Solicitud de información adicional
- Derivación a otras áreas

**Secciones:**
1. **Header del caso**
   - Código, título, tipo
   - Badges de estado y prioridad
   - Información de fecha y ubicación
   - Botones de acción según etapa

2. **Información del reporte**
   - Descripción detallada
   - Observaciones
   - Ubicación específica
   - Fecha y hora
   - Reportante (o anónimo)
   - Contacto (si aplica)

3. **Evaluación de riesgo**
   - Matriz de riesgo 1A-4E
   - Categoría de riesgo
   - SLA calculado
   - Decisión de investigación

4. **Investigación** (si aplica)
   - Investigador asignado
   - Causa raíz
   - Descripción técnica
   - Hallazgos
   - Conclusiones

5. **Plan de acción**
   - Lista de planes creados
   - Estado de cada plan
   - Envío a áreas responsables
   - Seguimiento de aprobación

6. **Evidencias**
   - Lista de archivos adjuntos
   - Vista previa de imágenes
   - Carga de nuevos archivos

7. **Trabajadores involucrados**
   - Lista de personal
   - Estado laboral
   - Rol en el incidente

8. **Línea de tiempo**
   - Cronología de eventos
   - Actor y fecha de cada acción
   - Detalles de cambios

**Diseño:**
- Layout de tarjetas colapsables
- Workflow visual con pasos numerados
- Iconos distintivos por sección
- Colores semánticos (rojo para crítico, amarillo para advertencia, verde para éxito)
- Formularios con validación
- Modales para acciones secundarias

### 5.2. Vista de Jefe de Área

#### JefeHome.tsx - Lista de Planes
**Ubicación:** `/jefe`

**Funcionalidades:**
- Lista de planes de acción asignados al área
- Filtros por estado (Todos, En Ejecución, En Verificación, Pendientes)
- Vista de tarjetas con información resumida
- Aceptación rápida de planes
- Navegación a detalle de plan

**Campos en tarjetas:**
- Código del caso
- Código del plan (PLA-XX)
- Estado del plan (con badge)
- Fechas de inicio y fin
- Botón de aceptación (si pendiente)

**Diseño:**
- Header con título y contadores
- Tabs de filtros horizontales
- Grid de tarjetas
- Badges de colores para estados
- Botones de acción prominentes

#### PlanDetail.tsx - Detalle de Plan
**Ubicación:** `/jefe/planes/:caseId?plan=:planIndex`

**Funcionalidades:**
- Visualización completa del plan de acción
- Información del plan (código, tipo, responsable, fechas)
- Investigación asociada (causa raíz, hallazgos)
- Actividades del plan
- Actualización de estado de actividades
- Solicitud de prórroga
- Aceptación/rechazo del plan

**Secciones:**
1. **Header del plan**
   - Código del caso y del plan
   - Estado del plan
   - Botones de acción (Aceptar Plan, Solicitar Prórroga)

2. **Información del plan**
   - Código del plan
   - Tipo (Correctiva/Preventiva)
   - Elaborado por
   - Área responsable
   - Fechas de inicio y fin
   - Tiempo estimado
   - Prioridad
   - Estado de revisión
   - Responsable

3. **Investigación**
   - Causa raíz
   - Descripción técnica
   - Hallazgos

4. **Actividades del plan**
   - Lista de actividades
   - Estado de cada actividad
   - Responsable de cada actividad
   - Selector de estado (Pendiente/En progreso/Completado)

5. **Descripción y observaciones**
   - Descripción del plan
   - Observaciones adicionales

**Diseño:**
- Layout de tarjetas colapsables
- Iconos distintivos por sección
- Colores semánticos
- Selectores de estado para actividades
- Modal para solicitud de prórroga

---

## 6. LÓGICA DE NEGOCIO

### 6.1. Cálculo de SLA

**Matriz de Riesgo a SLA:**
- **Inaceptable** (1A, 1B, 1C, 2A, 2B): 3 días
- **No Deseable** (1D, 2C, 3A, 3B): 7 días
- **Aceptable con revisión** (2D, 3C, 4A): 14 días
- **Aceptable sin revisión** (resto): 21 días

**Cálculo:**
```typescript
function slaDaysForRisk(riskLevel: RiskLevel): number {
  const category = riskCategory(riskLevel);
  return RISK_SLA_DAYS[category];
}

function slaState(dueDate: string): "ok" | "warning" | "critical" {
  const days = daysUntil(dueDate);
  if (days <= 0) return "critical";
  if (days <= 3) return "warning";
  return "ok";
}
```

### 6.2. Generación de Códigos

**Formato de código de caso:**
```
SOP-{secuencia}-{año}
Ejemplo: SOP-01-2026
```

**Formato de código de plan:**
```
PLA-{índice}
Ejemplo: PLA-01, PLA-02
```

### 6.3. Transiciones Automáticas

**Recepción → Evaluación:**
- Automático al crear caso
- Seguridad Operativa valida información

**Evaluación → Investigación:**
- Si `evaluation.requiresInvestigation = true`
- Asignación automática de investigador

**Investigación → Plan de Acción:**
- Al completar investigación
- Seguridad Operativa crea plan

**Plan de Acción → Ejecución:**
- Al aceptar plan por Jefe de Área
- Cambio de stage a "ejecucion"

**Ejecución → Verificación:**
- Al completar todas las actividades
- Cambio de stage a "verificacion"

**Verificación → Cierre:**
- Al aprobar verificación por Seguridad Operativa
- Cambio de stage a "cierre"

---

## 7. PERMISOS Y ROLES

### 7.1. Rol: Reportante
**Permisos:**
- Crear nuevos casos
- Ver sus propios casos
- Actualizar información solicitada
- Adjuntar evidencias

**No puede:**
- Modificar casos de otros
- Acceder a casos de otras áreas
- Aprobar/rechazar planes
- Cerrar casos

### 7.2. Rol: Seguridad Operativa
**Permisos:**
- Ver todos los casos
- Evaluar riesgos
- Asignar investigadores
- Crear planes de acción
- Enviar planes a áreas
- Verificar cierres
- Cerrar casos
- Solicitar información adicional
- Derivar casos

**No puede:**
- Ejecutar actividades de planes
- Modificar planes enviados a otras áreas

### 7.3. Rol: Jefe de Área
**Permisos:**
- Ver planes asignados a su área
- Aceptar/rechazar planes
- Actualizar estado de actividades
- Solicitar prórrogas
- Ver detalles de planes

**No puede:**
- Ver casos de otras áreas
- Modificar planes de otros
- Cerrar casos
- Crear nuevos planes

---

## 8. ESPECIFICACIONES DE DISEÑO

### 8.1. Sistema de Colores

**Colores Semánticos:**
- **Critical (Rojo):** Riesgo inaceptable, SLA vencido, estados críticos
- **Warning (Amarillo):** Riesgo no deseable, SLA próximo a vencer, estados de advertencia
- **Info (Azul):** Información general, estados neutrales
- **Brand (Verde/Azul):** Marca, estados activos, acciones principales
- **Success (Verde):** Estados completados, SLA en tiempo, aprobaciones

**Badges de Estado:**
- Recepción: Azul claro
- Evaluación: Azul
- Investigación: Amarillo
- Plan de Acción: Naranja
- Ejecución: Verde
- Verificación: Azul oscuro
- Cierre: Verde oscuro
- Rechazado: Rojo

### 8.2. Tipografía

**Tamaños de fuente:**
- Títulos principales: 20px, bold
- Títulos de sección: 14px, semibold
- Texto de cuerpo: 13px, regular
- Texto pequeño: 11px, semibold (labels)
- Texto auxiliar: 12px, regular

**Colores de texto:**
- Texto principal: #1a1a1a (ink)
- Texto secundario: #666666 (ink-soft)
- Texto tenue: #999999 (ink-quiet)
- Texto muy tenue: #cccccc (ink-faint)

### 8.3. Espaciado

**Escala de espaciado:**
- Muy pequeño: 4px
- Pequeño: 8px
- Normal: 16px
- Mediano: 24px
- Grande: 32px
- Muy grande: 48px

**Padding de tarjetas:**
- Compacto: 12px
- Normal: 16px
- Espacioso: 24px

### 8.4. Bordes y Sombras

**Bordes:**
- Sutil: 1px solid #e5e5e5 (line-soft)
- Normal: 1px solid #d4d4d4 (line)
- Fuerte: 2px solid #a3a3a3 (line-strong)

**Sombras:**
- Sutil: 0 1px 2px rgba(0,0,0,0.05)
- Normal: 0 2px 4px rgba(0,0,0,0.1)
- Fuerte: 0 4px 8px rgba(0,0,0,0.15)

### 8.5. Componentes UI

**Tarjetas (Card):**
- Bordes redondeados: 8px-12px
- Fondo: blanco (#ffffff)
- Padding: 16px-24px
- Sombra sutil

**Botones (Button):**
- Primario: Fondo de marca, texto blanco
- Secundario: Fondo transparente, borde de marca
- Terciario: Fondo gris claro, texto oscuro
- Tamaños: sm (32px), md (40px), lg (48px)
- Bordes redondeados: 6px-8px

**Badges (Pill):**
- Bordes redondeados: 999px (completamente redondo)
- Padding: 4px 12px
- Tamaño de fuente: 11px
- Con punto indicador opcional

**Inputs (Input, Select, Textarea):**
- Bordes: 1px solid #d4d4d4
- Bordes redondeados: 6px
- Padding: 8px 12px
- Focus: borde de marca, sombra sutil

**Tablas:**
- Bordes horizontales entre filas
- Header con fondo gris claro
- Padding de celdas: 12px 16px
- Hover en filas: fondo gris muy claro

---

## 9. ENDPOINTS DE API (Propuestos)

### 9.1. Casos

```
GET    /api/cases                    - Listar casos (con filtros)
GET    /api/cases/:id                - Obtener detalle de caso
POST   /api/cases                    - Crear nuevo caso
PUT    /api/cases/:id                - Actualizar caso
DELETE /api/cases/:id                - Eliminar caso
POST   /api/cases/:id/assign         - Asignar caso
POST   /api/cases/:id/request-info   - Solicitar información
POST   /api/cases/:id/evaluate       - Evaluar caso
POST   /api/cases/:id/investigate    - Iniciar investigación
POST   /api/cases/:id/close          - Cerrar caso
POST   /api/cases/:id/reopen         - Reabrir caso
```

### 9.2. Planes de Acción

```
GET    /api/cases/:id/plans          - Listar planes de caso
GET    /api/cases/:id/plans/:planId  - Obtener detalle de plan
POST   /api/cases/:id/plans          - Crear plan de acción
PUT    /api/cases/:id/plans/:planId  - Actualizar plan
POST   /api/cases/:id/plans/:planId/accept  - Aceptar plan
POST   /api/cases/:id/plans/:planId/reject  - Rechazar plan
POST   /api/cases/:id/plans/:planId/extension - Solicitar prórroga
```

### 9.3. Actividades

```
GET    /api/cases/:id/plans/:planId/items  - Listar actividades
POST   /api/cases/:id/plans/:planId/items  - Crear actividad
PUT    /api/cases/:id/plans/:planId/items/:itemId  - Actualizar actividad
POST   /api/cases/:id/plans/:planId/items/:itemId/comments  - Agregar comentario
```

### 9.4. Evidencias

```
GET    /api/cases/:id/evidence       - Listar evidencias
POST   /api/cases/:id/evidence       - Subir evidencia
DELETE /api/cases/:id/evidence/:evId - Eliminar evidencia
GET    /api/cases/:id/evidence/:evId/download - Descargar evidencia
```

### 9.5. Usuarios y Autenticación

```
POST   /api/auth/login               - Iniciar sesión
POST   /api/auth/logout              - Cerrar sesión
GET    /api/users/me                 - Obtener usuario actual
GET    /api/users                    - Listar usuarios (admin)
POST   /api/users                    - Crear usuario (admin)
```

---

## 10. ESQUEMA DE BASE DE DATOS (Propuesto)

### 10.1. Tablas Principales

**cases**
```sql
CREATE TABLE cases (
  id VARCHAR(20) PRIMARY KEY,           -- SOP-01-2026
  type VARCHAR(50) NOT NULL,           -- hallazgo, incidente, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  observations TEXT,
  area VARCHAR(50) NOT NULL,
  station VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  date DATE NOT NULL,
  time TIME NOT NULL,
  priority VARCHAR(20) NOT NULL,        -- critica, alta, media, baja
  risk_level VARCHAR(5) NOT NULL,       -- 1A, 2C, etc.
  stage VARCHAR(30) NOT NULL,           -- recepcion, evaluacion, etc.
  reporter VARCHAR(255) NOT NULL,
  reporter_role VARCHAR(20) NOT NULL,
  anonymous BOOLEAN DEFAULT false,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  investigator VARCHAR(255),
  assignee VARCHAR(255),
  assignee_area VARCHAR(50),
  assignment_priority VARCHAR(20),
  assignment_due_date DATE,
  assignment_note TEXT,
  sla_due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**action_plans**
```sql
CREATE TABLE action_plans (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL REFERENCES cases(id),
  elaborated_by VARCHAR(255) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  estimated_time VARCHAR(50),
  priority VARCHAR(20) NOT NULL,
  observations TEXT,
  submitted_at TIMESTAMP,
  sent_to_area VARCHAR(50),
  reviewed_at TIMESTAMP,
  review_decision VARCHAR(20),
  review_note TEXT,
  plan_code VARCHAR(10),
  plan_status VARCHAR(20),
  plan_date DATE,
  scheduled_date DATE,
  annexes TEXT,
  second_responsible VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**action_items**
```sql
CREATE TABLE action_items (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES action_plans(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  owner VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  area VARCHAR(50),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**investigations**
```sql
CREATE TABLE investigations (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL REFERENCES cases(id),
  findings TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  technical_description TEXT NOT NULL,
  observations TEXT,
  conclusions TEXT,
  investigator VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**evidence**
```sql
CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL REFERENCES cases(id),
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  size VARCHAR(50),
  url TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**timeline_events**
```sql
CREATE TABLE timeline_events (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL REFERENCES cases(id),
  kind VARCHAR(50) NOT NULL,
  at TIMESTAMP NOT NULL,
  actor VARCHAR(255) NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  detail TEXT
);
```

**users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  area VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. VALIDACIONES Y REGLAS DE NEGOCIO

### 11.1. Validaciones de Creación de Caso

- **Código:** Formato SOP-XX-YYYY
- **Tipo:** Debe ser uno de los tipos válidos
- **Área:** Debe ser un área válida
- **Fecha:** No puede ser futura
- **Prioridad/Riesgo:** Debe corresponder a matriz válida
- **Reportante:** Nombre obligatorio (a menos que sea anónimo)
- **Contacto:** Si no es anónimo, email o teléfono obligatorio

### 11.2. Validaciones de Plan de Acción

- **Fechas:** Fecha fin >= Fecha inicio
- **Responsable:** Debe ser usuario válido del sistema
- **Área:** Debe ser área válida
- **Actividades:** Mínimo 1 actividad por plan
- **Items:** Cada actividad debe tener responsable y fecha límite

### 11.3. Reglas de Transición

- No se puede cerrar un caso si tiene planes en ejecución
- No se puede eliminar un caso con evidencias asociadas
- No se puede modificar un plan ya aceptado
- Solo Seguridad Operativa puede cerrar casos
- Solo Jefe de Área puede aceptar/rechazar planes asignados

---

## 12. NOTIFICACIONES

### 12.1. Tipos de Notificaciones

- **Nuevo caso asignado:** Al investigador/jefe de área
- **Solicitud de información:** Al reportante
- **Plan de acción enviado:** Al jefe de área
- **Plan aceptado/rechazado:** A Seguridad Operativa
- **SLA próximo a vencer:** Al responsable
- **SLA vencido:** Al responsable y supervisor
- **Caso cerrado:** A todos los involucrados
- **Prórroga solicitada:** A Seguridad Operativa
- **Prórroga aprobada/rechazada:** Al solicitante

### 12.2. Canales de Notificación

- **In-app:** Notificaciones en la interfaz
- **Email:** Correos automáticos
- **SMS:** Para casos críticos (opcional)
- **WebSocket:** Tiempo real para actualizaciones

---

## 13. REPORTES Y ANALÍTICA

### 13.1. Métricas Principales

- **Casos por etapa:** Distribución de casos en cada etapa
- **SLA cumplidos:** Porcentaje de casos dentro de SLA
- **Tiempo de resolución:** Promedio por tipo de caso
- **Casos por área:** Distribución por área responsable
- **Riesgos por categoría:** Distribución de matriz de riesgo
- **Planes de acción:** Estado y cumplimiento
- **Tendencias:** Evolución temporal de casos

### 13.2. Reportes Disponibles

- **Reporte de SLA:** Casos vencidos vs cumplidos
- **Reporte de áreas:** Casos por área y tiempo de resolución
- **Reporte de riesgos:** Distribución de matriz de riesgo
- **Reporte de planes:** Cumplimiento de planes de acción
- **Reporte de investigaciones:** Tiempos y calidad
- **Reporte mensual:** Resumen ejecutivo mensual

---

## 14. REQUISITOS DE IMPLEMENTACIÓN

### 14.1. Backend

- **Framework:** Node.js + Express o NestJS
- **Base de datos:** PostgreSQL (recomendado) o MongoDB
- **Autenticación:** JWT + OAuth2
- **File storage:** AWS S3 o Azure Blob Storage
- **Email:** SendGrid o AWS SES
- **Logging:** Winston o Pino
- **Testing:** Jest + Supertest
- **Documentación:** Swagger/OpenAPI

### 14.2. Frontend

- **Framework:** React + TypeScript + Vite
- **State management:** Redux Toolkit o Zustand
- **Routing:** React Router
- **UI Library:** Componentes personalizados (como en prototipo)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Testing:** React Testing Library + Vitest
- **Build:** Vite

### 14.3. Infraestructura

- **Hosting:** AWS, Azure o Google Cloud
- **CDN:** CloudFront o Cloudflare
- **Monitoring:** Datadog o New Relic
- **CI/CD:** GitHub Actions o GitLab CI
- **Container:** Docker + Kubernetes (opcional)

---

## 15. CONSIDERACIONES DE SEGURIDAD

### 15.1. Autenticación y Autorización

- JWT con expiración configurable
- Roles y permisos granulares
- Rate limiting en endpoints sensibles
- Validación de inputs en todos los endpoints
- Sanitización de datos para prevenir XSS

### 15.2. Protección de Datos

- Encriptación de datos sensibles en reposo
- HTTPS obligatorio en producción
- Backup automatizado de base de datos
- Logs de auditoría para acciones críticas
- Cumplimiento de GDPR/leyes locales

### 15.3. Control de Acceso

- RBAC (Role-Based Access Control)
- Filtrado de datos por área
- Anonimización opcional de reportes
- Control de versiones de documentos

---

## 16. PLAN DE MIGRACIÓN

### 16.1. Fase 1: Backend (4-6 semanas)
1. Configuración de proyecto y base de datos
2. Implementación de modelos y migraciones
3. Endpoints de autenticación
4. CRUD de casos
5. Endpoints de planes de acción
6. Endpoints de evidencias
7. Implementación de reglas de negocio
8. Testing unitario y de integración

### 16.2. Fase 2: Frontend (4-6 semanas)
1. Configuración de proyecto
2. Implementación de store global
3. Componentes UI base
4. Vista de lista de casos (Seguridad Operativa)
5. Vista de detalle de caso (Seguridad Operativa)
6. Vista de lista de planes (Jefe de Área)
7. Vista de detalle de plan (Jefe de Área)
8. Integración con backend
9. Testing de componentes

### 16.3. Fase 3: Integración y Testing (2-3 semanas)
1. Testing end-to-end
2. Testing de carga
3. Corrección de bugs
4. Optimización de performance
5. Revisión de seguridad
6. Documentación final

### 16.4. Fase 4: Despliegue (1-2 semanas)
1. Configuración de infraestructura
2. Migración de datos (si aplica)
3. Despliegue en staging
4. Testing en staging
5. Despliegue en producción
6. Monitoreo post-lanzamiento

---

## 17. APÉNDICES

### 17.1. Glosario

- **SOP:** Safety Operational Procedure (Procedimiento Operativo de Seguridad)
- **SLA:** Service Level Agreement (Acuerdo de Nivel de Servicio)
- **SLA:** Sistema de Línea 1 (Metro de Lima)
- **Matriz de Riesgo 5×5:** Sistema de evaluación de riesgo con 5 niveles de probabilidad y 5 niveles de severidad
- **Workflow de 7 etapas:** Flujo de gestión de casos con 7 etapas principales

### 17.2. Referencias

- Prototipo actual: SIGMA L1 (React + localStorage)
- Planilla oficial SOP de Seguridad Operativa
- Normativas de seguridad del Metro de Lima
- Mejores prácticas de gestión de incidentes

---

## 18. CONTACTO Y SOPORTE

Para consultas técnicas sobre este informe, contactar al equipo de desarrollo.

**Versión del documento:** 1.0
**Fecha de creación:** Agosto 2026
**Última actualización:** Agosto 2026

---

*Este documento es confidencial y propiedad del Metro de Lima. No debe ser distribuido sin autorización.*
