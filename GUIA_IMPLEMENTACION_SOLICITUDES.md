# 🚀 GUÍA DE IMPLEMENTACIÓN - Sistema de Solicitudes de Materiales

## ✅ Código Completamente Implementado

Tu sistema de solicitudes y stock de materiales está **100% listo**. Los siguientes pasos son necesarios para activarlo en tu base de datos de Supabase.

---

## 📋 ARCHIVO DE MIGRACIONES CREADAS

Se han creado **4 archivos de migración** en `supabase/migrations/`:

```
✅ 20260103_create_material_requests.sql
✅ 20260103_create_material_request_items.sql
✅ 20260103_create_stock_history.sql
✅ 20260103_create_role_permissions.sql
```

---

## 🔧 PASOS DE INSTALACIÓN

### **OPCIÓN 1: Usar CLI de Supabase (Recomendado)**

```bash
# En la raíz del proyecto
cd c:\Users\kako2\OneDrive\Documentos\GitHub\fesa-inventory-hub

# Ejecutar migraciones
npx supabase migration up
```

### **OPCIÓN 2: Ejecutar Manualmente en Supabase Dashboard**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com)
2. Haz clic en **"SQL Editor"** en la sidebar izquierda
3. Crea una nueva consulta
4. Copia el contenido de **cada archivo .sql** y ejecútalos en este orden:
   - Primero: `20260103_create_material_requests.sql`
   - Segundo: `20260103_create_material_request_items.sql`
   - Tercero: `20260103_create_stock_history.sql`
   - Cuarto: `20260103_create_role_permissions.sql`

---

## 📊 ESTRUCTURA DE BASES DE DATOS CREADAS

### 1. **material_requests** (Encabezado de solicitudes)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `requester_id` | UUID | Quién crea la solicitud (FK → profiles) |
| `status` | VARCHAR | pending, approved, rejected, dispatched, completed |
| `request_date` | TIMESTAMP | Fecha de creación |
| `approved_by` | UUID | Quién aprueba (FK → profiles) |
| `approved_date` | TIMESTAMP | Fecha de aprobación |
| `notes` | TEXT | Notas adicionales |

### 2. **material_request_items** (Detalle de materiales)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `request_id` | UUID | FK → material_requests |
| `material_id` | UUID | FK → inventory_items |
| `quantity_requested` | INT | Cantidad solicitada |
| `quantity_approved` | INT | Cantidad aprobada |
| `quantity_dispatched` | INT | Cantidad despachada |
| `notes` | TEXT | Notas del item |

### 3. **stock_history** (Auditoría)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `material_id` | UUID | FK → inventory_items |
| `quantity_change` | INT | Cambio de cantidad |
| `operation_type` | VARCHAR | entry, approval, dispatch, adjustment, return |
| `performed_by` | UUID | FK → profiles (quién hace la acción) |
| `related_request_id` | UUID | FK → material_requests (si aplica) |

### 4. **role_permissions** (Matriz de permisos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `role` | VARCHAR | admin, supervisor, bodeguero, technician |
| `permission` | VARCHAR | Nombre del permiso |
| `description` | TEXT | Descripción |

---

## 👥 CONFIGURACIÓN DE ROLES

### **ADMIN**
- ✅ Ver todas las solicitudes (`view_all_requests`)
- ✅ Aprobar/rechazar solicitudes (`approve_requests`, `reject_requests`)
- ✅ Ver stock disponible (`view_stock`)
- ✅ Crear usuarios (`create_users`)
- ✅ Ver historial de stock (`view_stock_history`)

**Panel de Aprobaciones:**
- Ve lista de solicitudes **pendientes**
- Al hacer clic en "Aprobar": 
  - ✅ Stock se deduce automáticamente
  - ✅ Se crea entrada en stock_history
  - ✅ Status → "approved"

### **SUPERVISOR**
- ✅ Crear solicitudes (`create_request`)
- ✅ Ver sus propias solicitudes (`view_own_requests`)
- ✅ Ver estado de solicitudes (`view_request_status`)
- ❌ **NO ve** cantidad de stock disponible (campo oculto)

**Panel de Solicitudes:**
- Botón "Nueva Solicitud"
- Formulario con campos:
  - Material (select)
  - Cantidad (input)
  - Notas (textarea)
- Tabs: Pendientes, Aprobadas, Rechazadas

### **BODEGUERO** (Nuevo rol)
- ✅ Gestionar inventario (`manage_inventory`)
- ✅ Ver stock disponible (`view_stock`)
- ✅ Despachar solicitudes aprobadas (`dispatch_requests`)
- ✅ Ver solicitudes aprobadas (`view_approved_requests`)
- ✅ Ver historial de stock (`view_stock_history`)

**Panel de Despacho:**
- Ve lista de solicitudes **aprobadas**
- Al hacer clic en "Despachar":
  - ✅ Status → "dispatched"
  - ✅ Se crea entrada en stock_history
  - ✅ Stock ya fue deducido en aprobación

---

## 🔄 FLUJO COMPLETO DE SOLICITUD

```
1. SUPERVISOR crea solicitud
   ├─ Status: "pending"
   ├─ Materiales y cantidades
   └─ Nota: NO ve stock disponible

2. ADMIN aprueba solicitud
   ├─ Valida cantidad disponible
   ├─ Deduce stock automáticamente
   ├─ Crea entrada en stock_history
   └─ Status → "approved"

3. BODEGUERO despacha
   ├─ Ve solicitud aprobada
   ├─ Prepara los materiales
   ├─ Crea entrada dispatch en stock_history
   └─ Status → "dispatched"

4. Sistema registra todo
   └─ stock_history tiene completo historial
```

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### **Creados:**
```
✅ src/pages/MaterialRequests.tsx
✅ src/components/requests/MaterialRequestForm.tsx
✅ src/components/requests/MaterialRequestList.tsx
✅ src/components/requests/RequestDetailDialog.tsx
✅ supabase/migrations/20260103_create_material_requests.sql
✅ supabase/migrations/20260103_create_material_request_items.sql
✅ supabase/migrations/20260103_create_stock_history.sql
✅ supabase/migrations/20260103_create_role_permissions.sql
```

### **Modificados:**
```
✅ src/contexts/AuthContext.tsx (agregado rol 'bodeguero')
✅ src/hooks/useDatabase.ts (agregados 6 hooks nuevos)
✅ src/components/layout/Sidebar.tsx (agregada ruta a Solicitudes)
✅ src/App.tsx (agregada ruta /material-requests)
```

---

## 🧪 TESTING - CASOS DE USO

### Test 1: Supervisor crea solicitud
```
1. Loguéate como SUPERVISOR
2. Haz clic en "Solicitudes" en la navbar
3. Haz clic en "Nueva Solicitud"
4. Selecciona un material
5. Ingresa cantidad
6. Haz clic en "Enviar Solicitud"
✅ Esperado: Solicitud creada con status "pending"
```

### Test 2: Admin aprueba solicitud
```
1. Loguéate como ADMIN
2. Haz clic en "Solicitudes" en la navbar
3. Deberías ver solicitudes "pendientes"
4. Haz clic en botón "✓" (aprobar)
5. Confirma en el modal
✅ Esperado: 
   - Status → "approved"
   - Stock se deduce automáticamente
   - stock_history tiene nueva entrada
```

### Test 3: Bodeguero despacha solicitud
```
1. Loguéate como BODEGUERO
2. Haz clic en "Solicitudes" en la navbar
3. Ve tab "Para Despachar"
4. Haz clic en botón "✓" (despachar)
✅ Esperado:
   - Status → "dispatched"
   - stock_history registra despacho
```

### Test 4: Supervisor NO ve stock
```
1. Loguéate como SUPERVISOR
2. Ve a "Solicitudes" → "Nueva Solicitud"
✅ Esperado: 
   - NO aparece columna de stock disponible
   - Solo ve: Material, Cantidad, Notas
```

---

## 🔐 VALIDACIONES DE SEGURIDAD

✅ **Backend (Supabase):**
- Cada tabla tiene FK (Foreign Keys) para integridad referencial
- Status tiene CHECK constraint para valores válidos
- Índices creados en campos de búsqueda/filtrado

✅ **Frontend (React):**
- Componentes renderizados según rol
- Botones de acción solo para roles autorizados
- Queries filtrados por rol en componentes

---

## 📞 PRÓXIMOS PASOS OPCIONALES

### 1. **Row Level Security (RLS)** [Avanzado]
Si quieres más seguridad, puedes habilitar RLS en Supabase:
```sql
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;

-- Supervisores solo ven sus solicitudes
CREATE POLICY "Supervisors see own requests"
  ON material_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id 
    OR 
    (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
  );
```

### 2. **Notificaciones en Tiempo Real** [Avanzado]
Agregar notificaciones cuando:
- Se aprueba una solicitud
- Se rechaza una solicitud
- Se despacha una solicitud

### 3. **Reportes de Stock** [Avanzado]
Crear dashboard que muestre:
- Solicitudes por período
- Materiales más solicitados
- Tendencias de stock

---

## ⚠️ CHECKLIST ANTES DE PRODUCCIÓN

- [ ] Ejecutaste todas las 4 migraciones
- [ ] Probaste flujo Supervisor → crea solicitud
- [ ] Probaste flujo Admin → aprueba y deduce stock
- [ ] Probaste flujo Bodeguero → despacha
- [ ] Verificaste que Supervisor NO ve stock
- [ ] Verificaste que Admin VE stock en panel
- [ ] Verificaste que Bodeguero VE stock en panel
- [ ] Los usuarios tienen roles asignados correctamente
- [ ] Los botones de acción aparecen solo para roles autorizados

---

## 🆘 TROUBLESHOOTING

### Problema: "No se ve la opción Solicitudes en la navbar"
**Solución:** Verifica que tu usuario tenga uno de estos roles: `admin`, `supervisor`, `bodeguero`. Si tienes `technician`, necesitas cambiar el rol.

### Problema: "Al aprobar no se deduce el stock"
**Solución:** Verifica que:
1. El campo `available_quantity` existe en `inventory_items`
2. La migración se ejecutó correctamente
3. Consulta la tabla `stock_history` para ver si hay registros

### Problema: "El formulario de nueva solicitud no abre"
**Solución:** Verifica la consola (F12) para errores de JavaScript. Asegúrate de que `useInventoryItems('material')` devuelve datos.

---

## 📚 DOCUMENTACIÓN ADICIONAL

Ver archivo `ANALISIS_IMPLEMENTACION_SOLICITUDES.md` para:
- Análisis técnico completo
- Restricciones de API
- Orden de ejecución recomendado
- Preguntas frecuentes

---

## ✨ ¡LISTO PARA USAR!

Todo está implementado. Solo necesitas:
1. Ejecutar las 4 migraciones SQL
2. Asegurarte que los usuarios tengan roles asignados
3. ¡Empezar a usar!

**Estado de Implementación:** 100% completo ✅
