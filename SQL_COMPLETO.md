# ✅ SQL COMPLETO - Listo para Copiar y Pegar

Copia cada bloque SQL, abre Supabase → SQL Editor → Nueva Query → Pega y ejecuta.

---

## 🔢 SQL #1 - Tabla de Solicitudes

**Copia TODO esto y ejecuta:**

```sql
-- Create material_requests table
CREATE TABLE public.material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'dispatched', 'completed')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  approved_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_material_requests_status ON public.material_requests(status);
CREATE INDEX idx_material_requests_requester ON public.material_requests(requester_id);
CREATE INDEX idx_material_requests_approved_by ON public.material_requests(approved_by);
CREATE INDEX idx_material_requests_request_date ON public.material_requests(request_date);

COMMENT ON TABLE public.material_requests IS 'Solicitudes de materiales por supervisores';
COMMENT ON COLUMN public.material_requests.status IS 'Estados: pending, approved, rejected, dispatched, completed';
```

✅ Clic en "Ejecutar"

---

## 🔢 SQL #2 - Detalle de Solicitudes

**Copia TODO esto y ejecuta:**

```sql
-- Create material_request_items table (details of each request)
CREATE TABLE public.material_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_requested INT NOT NULL CHECK (quantity_requested > 0),
  quantity_approved INT,
  quantity_dispatched INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_request_items_request ON public.material_request_items(request_id);
CREATE INDEX idx_request_items_material ON public.material_request_items(material_id);

COMMENT ON TABLE public.material_request_items IS 'Detalle de materiales en cada solicitud';
```

✅ Clic en "Ejecutar"

---

## 🔢 SQL #3 - Historial de Stock

**Copia TODO esto y ejecuta:**

```sql
-- Create stock_history table for audit trail
CREATE TABLE public.stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL CHECK (previous_quantity >= 0),
  new_quantity INT NOT NULL CHECK (new_quantity >= 0),
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('entry', 'approval', 'dispatch', 'adjustment', 'return')),
  related_request_id UUID REFERENCES public.material_requests(id) ON DELETE SET NULL,
  performed_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_stock_history_material ON public.stock_history(material_id);
CREATE INDEX idx_stock_history_operation ON public.stock_history(operation_type);
CREATE INDEX idx_stock_history_request ON public.stock_history(related_request_id);
CREATE INDEX idx_stock_history_date ON public.stock_history(created_at);

COMMENT ON TABLE public.stock_history IS 'Historial de cambios de stock para auditoría';
COMMENT ON COLUMN public.stock_history.operation_type IS 'Tipos: entry (entrada), approval (aprobación), dispatch (despacho), adjustment (ajuste), return (devolución)';
```

✅ Clic en "Ejecutar"

---

## 🔢 SQL #4 - Permisos por Rol

**Copia TODO esto y ejecuta:**

```sql
-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission)
);

CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission, description) VALUES
-- ADMIN
('admin', 'view_all_requests', 'Ver todas las solicitudes de materiales'),
('admin', 'approve_requests', 'Aprobar o rechazar solicitudes'),
('admin', 'reject_requests', 'Rechazar solicitudes'),
('admin', 'manage_inventory', 'Gestionar inventario completo'),
('admin', 'view_stock', 'Ver cantidad de stock disponible'),
('admin', 'create_users', 'Crear nuevos usuarios'),
('admin', 'view_stock_history', 'Ver historial de cambios de stock'),
('admin', 'manage_all_items', 'Crear, editar y eliminar items'),

-- SUPERVISOR
('supervisor', 'create_request', 'Crear solicitudes de materiales'),
('supervisor', 'view_own_requests', 'Ver sus propias solicitudes'),
('supervisor', 'view_request_status', 'Ver estado de solicitudes'),

-- BODEGUERO (warehouse staff)
('bodeguero', 'manage_inventory', 'Gestionar entradas de inventario'),
('bodeguero', 'view_stock', 'Ver cantidad de stock disponible'),
('bodeguero', 'dispatch_requests', 'Despachar solicitudes aprobadas'),
('bodeguero', 'view_approved_requests', 'Ver solicitudes aprobadas para despacho'),
('bodeguero', 'view_stock_history', 'Ver historial de cambios de stock');

COMMENT ON TABLE public.role_permissions IS 'Matriz de permisos por rol';
```

✅ Clic en "Ejecutar"

---

## ✅ ¡LISTO!

Si los 4 SQL ejecutaron sin errores, el sistema está activado.

### Pasos después:
1. Abre tu app: `http://localhost:5173`
2. Loguéate como **SUPERVISOR**
3. Ve a "Solicitudes" en la navbar
4. ¡Crea tu primera solicitud!
