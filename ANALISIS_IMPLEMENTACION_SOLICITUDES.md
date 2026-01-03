# Análisis de Implementación: Sistema de Solicitudes y Stock de Materiales

## 📋 ANÁLISIS DE ARQUITECTURA ACTUAL

### Estructura Existente
- **Backend:** Supabase (PostgreSQL)
- **Frontend:** React + TypeScript + React Router + React Query
- **Autenticación:** Supabase Auth con roles en tabla `user_roles`
- **Roles Actuales:** `admin` | `supervisor` | `technician`
- **Datos de Inventario:** Tabla `inventory_items` con categorías (material, tool, equipment)

### Autorización por Rol (Actual)
- **Admin:** Acceso total a todas las secciones
- **Supervisor:** Acceso limitado (perfil por defecto)
- **Technician:** Acceso limitado (perfil por defecto)

---

## 🔧 CAMBIOS REQUERIDOS

### 1. MIGRACIONES DE BASE DE DATOS (SQL)

#### A. Crear tabla `material_requests`
```sql
CREATE TABLE public.material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(user_id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' -- pending, approved, rejected, dispatched, completed
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES profiles(user_id),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_material_requests_status ON public.material_requests(status);
CREATE INDEX idx_material_requests_requester ON public.material_requests(requester_id);
CREATE INDEX idx_material_requests_approved_by ON public.material_requests(approved_by);
```

#### B. Crear tabla `material_request_items` (detalle)
```sql
CREATE TABLE public.material_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_requested INT NOT NULL,
  quantity_approved INT,
  quantity_dispatched INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_request_items_request ON public.material_request_items(request_id);
CREATE INDEX idx_request_items_material ON public.material_request_items(material_id);
```

#### C. Actualizar tabla `inventory_items` (si no existe `stock_history`)
```sql
-- Agregar columnas si no existen
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES profiles(user_id),
ADD COLUMN IF NOT EXISTS warehouse_location VARCHAR(100);
```

#### D. Crear tabla `stock_history` (auditoría)
```sql
CREATE TABLE public.stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  operation_type VARCHAR(50) NOT NULL, -- entry, approval, dispatch, adjustment
  related_request_id UUID REFERENCES material_requests(id),
  performed_by UUID NOT NULL REFERENCES profiles(user_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_stock_history_material ON public.stock_history(material_id);
CREATE INDEX idx_stock_history_operation ON public.stock_history(operation_type);
CREATE INDEX idx_stock_history_request ON public.stock_history(related_request_id);
```

---

### 2. CAMBIOS EN ROLES - USER_ROLES Table

Actualizar roles existentes y sus permisos:

```sql
-- Los roles ya existen: admin, supervisor, technician
-- Necesitas agregar una tabla de permisos o usar lógica en backend

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission)
);

-- Inserts para permisos por rol
INSERT INTO public.role_permissions (role, permission) VALUES
-- ADMIN
('admin', 'view_all_requests'),
('admin', 'approve_requests'),
('admin', 'reject_requests'),
('admin', 'manage_stock'),
('admin', 'view_stock'),
('admin', 'create_users'),
('admin', 'view_stock_history'),

-- SUPERVISOR
('supervisor', 'create_request'),
('supervisor', 'view_own_requests'),
('supervisor', 'view_request_status'),

-- BODEGUERO (nuevo rol)
('bodeguero', 'manage_inventory'),
('bodeguero', 'view_stock'),
('bodeguero', 'dispatch_requests'),
('bodeguero', 'view_approved_requests');
```

> **NOTA IMPORTANTE:** Necesitarás actualizar tu `AuthContext.tsx` para incluir el rol 'bodeguero':
> ```typescript
> role: 'admin' | 'supervisor' | 'technician' | 'bodeguero'
> ```

---

### 3. CAMBIOS EN FRONTEND

#### A. Actualizar AuthContext (src/contexts/AuthContext.tsx)
```typescript
// Agregar 'bodeguero' al tipo de rol
role: 'admin' | 'supervisor' | 'technician' | 'bodeguero'
```

#### B. Crear Custom Hooks en useDatabase.ts

**Hooks para Solicitudes:**
```typescript
export function useMaterialRequests(filters?: { status?: string; requester_id?: string }) {
  // GET todas las solicitudes (filtrable por estado/requester)
}

export function useCreateMaterialRequest() {
  // POST nueva solicitud
}

export function useApproveMaterialRequest() {
  // PATCH aprobar solicitud (resta stock automáticamente)
}

export function useRejectMaterialRequest() {
  // PATCH rechazar solicitud
}

export function useDispatchMaterialRequest() {
  // PATCH despachar solicitud
}

export function useStockHistory(materialId?: string) {
  // GET historial de cambios de stock
}
```

#### C. Crear Componentes Nuevos

**Carpeta:** `src/components/requests/`
- `MaterialRequestForm.tsx` - Formulario para crear solicitudes (Supervisor)
- `MaterialRequestList.tsx` - Lista de solicitudes pendientes (Admin)
- `WarehouseDispatchBoard.tsx` - Panel de despacho (Bodeguero)
- `RequestDetailDialog.tsx` - Detalle de una solicitud
- `StockHistoryChart.tsx` - Gráfico de historial de stock

#### D. Crear Nueva Página

**Archivo:** `src/pages/MaterialRequests.tsx`
- Mostrar diferentes vistas según rol
- Supervisor: Crear solicitud + Ver mis solicitudes
- Admin: Panel de aprobaciones
- Bodeguero: Panel de despacho

#### E. Actualizar Navegación

**Archivo:** `src/components/layout/Sidebar.tsx`
- Agregar enlace a "Solicitudes de Materiales"
- Icon: `FileText` o `Package`

#### F. Actualizar Rutas

**Archivo:** `src/App.tsx`
```typescript
<Route 
  path="/material-requests" 
  element={<ProtectedRoute><MaterialRequests /></ProtectedRoute>} 
/>
```

---

## 📊 FLUJO DE NEGOCIO DETALLADO

### 1. **SUPERVISOR - Crear Solicitud**
```
┌─────────────┐
│  Supervisor │
└──────┬──────┘
       │ Accede a "Solicitudes"
       ▼
┌─────────────────────────────┐
│ Ve: Crear Solicitud (botón) │
│ NO VE: Stock disponible     │
└──────┬──────────────────────┘
       │ Clic en "Crear Solicitud"
       ▼
┌──────────────────────────────────┐
│ Formulario:                      │
│ - Material (select)              │
│ - Cantidad (input)               │
│ - Notas (textarea)               │
│ - Botón "Enviar Solicitud"       │
└──────┬───────────────────────────┘
       │ POST /material-requests
       ▼
✅ Status: "pending" en BD
```

**Restricción:** La API backend NO debe devolver `available_quantity` al frontend para supervisores

---

### 2. **ADMIN - Aprobar Solicitud**
```
┌───────────────────────┐
│      Admin            │
└──────┬────────────────┘
       │ Accede a Dashboard / Solicitudes
       ▼
┌────────────────────────────────────┐
│ Ve: Lista de solicitudes "pending" │
│ Cada solicitud muestra:            │
│ - Requester                        │
│ - Materiales solicitados           │
│ - Fecha de solicitud               │
│ - Botón "Aceptar" | "Rechazar"     │
└──────┬─────────────────────────────┘
       │ Clic "Aceptar"
       ▼
┌────────────────────────────────────────┐
│ BACKEND (lógica crítica):              │
│ 1. Validar stock disponible            │
│ 2. Restar cantidad del stock           │
│ 3. Cambiar status a "approved"         │
│ 4. Registrar en stock_history          │
│ 5. Notificar al bodeguero              │
└──────┬─────────────────────────────────┘
       │ PATCH /material-requests/:id
       ▼
✅ Status: "approved" en BD
✅ Stock reducido en inventory_items
✅ Entrada en stock_history
```

**Validación Crítica:** Si `requested_qty > available_qty`, mostrar alerta y permitir aprobar cantidad parcial

---

### 3. **BODEGUERO - Despachar Solicitud**
```
┌────────────┐
│ Bodeguero  │
└──────┬─────┘
       │ Accede a "Panel de Despacho"
       ▼
┌──────────────────────────────────┐
│ Ve: Solo solicitudes "approved"  │
│ Cada una muestra:                │
│ - Materiales a despachar         │
│ - Stock actual (VISIBLE)         │
│ - Botón "Despachar Solicitud"    │
└──────┬───────────────────────────┘
       │ Clic "Despachar"
       ▼
┌────────────────────────────────────┐
│ Cambiar status a "dispatched"      │
│ Registrar en stock_history         │
│ (stock ya fue restado en approval) │
└──────┬───────────────────────────────┘
       │ PATCH /material-requests/:id
       ▼
✅ Status: "dispatched" en BD
```

---

## 🔒 RESTRICCIONES DE API (Backend)

### Endpoint: GET /material-requests

```typescript
// ADMIN: Ve todas las solicitudes
SELECT * FROM material_requests
WHERE status = 'pending' (o todas)

// SUPERVISOR: Ve solo sus solicitudes
SELECT * FROM material_requests
WHERE requester_id = current_user_id

// BODEGUERO: Ve solo aprobadas
SELECT * FROM material_requests
WHERE status = 'approved'

// IMPORTANTE: NUNCA devolver available_quantity a supervisores
// Esta columna solo en respuestas a admin/bodeguero
```

### Endpoint: GET /inventory-items

```typescript
// SUPERVISOR: NO recibe available_quantity en respuesta
// ADMIN/BODEGUERO: Reciben available_quantity

SELECT id, name, category, quantity, unit, ... (sin available_quantity)
// Para supervisores

SELECT id, name, category, quantity, available_quantity, unit, ... (completo)
// Para admin/bodeguero
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Phase 1: Backend (SQL + Hooks)
- [ ] Crear migraciones SQL
- [ ] Crear custom hooks en useDatabase.ts
- [ ] Actualizar AuthContext para incluir 'bodeguero'

### Phase 2: Frontend - Componentes Base
- [ ] Crear MaterialRequestForm.tsx
- [ ] Crear MaterialRequestList.tsx
- [ ] Crear MaterialRequestsPage.tsx
- [ ] Actualizar Sidebar.tsx

### Phase 3: Frontend - Lógica por Rol
- [ ] Implementar visibilidad condicional de stock
- [ ] Agregar lógica de aprobación
- [ ] Panel de despacho

### Phase 4: Validaciones y Seguridad
- [ ] Validar permisos en queries
- [ ] Implementar RLS (Row Level Security) en Supabase
- [ ] Auditoría con stock_history

### Phase 5: Testing
- [ ] Flujo Supervisor → solicitud
- [ ] Flujo Admin → aprobación + resta de stock
- [ ] Flujo Bodeguero → despacho

---

## 🎯 ORDEN RECOMENDADO DE EJECUCIÓN

1. **Primero:** Crear migraciones SQL en Supabase
2. **Segundo:** Actualizar AuthContext.tsx
3. **Tercero:** Crear hooks en useDatabase.ts
4. **Cuarto:** Crear componentes y páginas
5. **Quinto:** Conectar todo y testear flujos

---

## 📂 ESTRUCTURA DE CARPETAS FINAL

```
src/
├── components/
│   ├── requests/
│   │   ├── MaterialRequestForm.tsx
│   │   ├── MaterialRequestList.tsx
│   │   ├── WarehouseDispatchBoard.tsx
│   │   └── RequestDetailDialog.tsx
│   └── ...
├── pages/
│   ├── MaterialRequests.tsx
│   └── ...
├── hooks/
│   └── useDatabase.ts (actualizado)
└── ...
```

---

## ❓ PREGUNTAS ANTES DE IMPLEMENTAR

1. ¿El rol "bodeguero" es nuevo o es sinónimo de "technician"?
2. ¿Necesitas notificaciones en tiempo real cuando se aprueba una solicitud?
3. ¿El stock debe validarse en el momento de aprobar o al despachar?
4. ¿Quieres historial de solicitudes rechazadas?
5. ¿Los supervisores pueden ver el estado de sus solicitudes (pending/approved)?
