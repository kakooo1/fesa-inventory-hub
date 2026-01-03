-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission)
);

-- Create index for role_permissions
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission, description) VALUES
-- ADMIN permissions
('admin', 'view_all_requests', 'Ver todas las solicitudes de materiales'),
('admin', 'approve_requests', 'Aprobar o rechazar solicitudes'),
('admin', 'reject_requests', 'Rechazar solicitudes'),
('admin', 'manage_inventory', 'Gestionar inventario completo'),
('admin', 'view_stock', 'Ver cantidad de stock disponible'),
('admin', 'create_users', 'Crear nuevos usuarios'),
('admin', 'view_stock_history', 'Ver historial de cambios de stock'),
('admin', 'manage_all_items', 'Crear, editar y eliminar items'),

-- SUPERVISOR permissions
('supervisor', 'create_request', 'Crear solicitudes de materiales'),
('supervisor', 'view_own_requests', 'Ver sus propias solicitudes'),
('supervisor', 'view_request_status', 'Ver estado de solicitudes'),

-- BODEGUERO (warehouse staff) permissions
('bodeguero', 'manage_inventory', 'Gestionar entradas de inventario'),
('bodeguero', 'view_stock', 'Ver cantidad de stock disponible'),
('bodeguero', 'dispatch_requests', 'Despachar solicitudes aprobadas'),
('bodeguero', 'view_approved_requests', 'Ver solicitudes aprobadas para despacho'),
('bodeguero', 'view_stock_history', 'Ver historial de cambios de stock');

-- Add comment to table
COMMENT ON TABLE public.role_permissions IS 'Matriz de permisos por rol';
