-- Este archivo contiene las actualizaciones necesarias para las tablas en Supabase
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- ⚠️ ADVERTENCIA: Este script eliminará y recreará las siguientes tablas:
-- - material_requests
-- - material_request_items
-- - stock_history
-- - notifications
-- - equipment_repairs
-- 
-- Esto significa que PERDERÁS todos los datos existentes en estas tablas.
-- Si tienes datos importantes, haz un backup antes de ejecutar este script.

-- 1. Actualizar el enum de categorías en inventory_items para incluir equipment, clothing, epp
ALTER TABLE inventory_items 
DROP CONSTRAINT IF EXISTS inventory_items_category_check;

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_items_category_check 
CHECK (category IN ('material', 'tool', 'equipment', 'clothing', 'epp'));

-- 2. Actualizar el enum de roles en user_roles para incluir bodeguero
ALTER TABLE user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('admin', 'supervisor', 'technician', 'bodeguero'));

-- 3. Verificar que existan las tablas necesarias
-- Si alguna no existe, créala con estos comandos:

-- Tabla material_requests - Eliminar y recrear para asegurar estructura correcta
DROP TABLE IF EXISTS material_requests CASCADE;

CREATE TABLE material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'dispatched', 'returned')),
  approved_by UUID REFERENCES profiles(user_id),
  approved_date TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES profiles(user_id),
  rejected_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  ready_for_pickup BOOLEAN DEFAULT FALSE,
  marked_ready_by UUID REFERENCES profiles(user_id),
  marked_ready_at TIMESTAMP WITH TIME ZONE,
  picked_up_by UUID REFERENCES profiles(user_id),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla material_request_items
DROP TABLE IF EXISTS material_request_items CASCADE;

CREATE TABLE material_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  quantity_approved INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla stock_history
DROP TABLE IF EXISTS stock_history CASCADE;

CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('adjustment', 'loan', 'return', 'request_approved', 'request_rejected')),
  changed_by UUID REFERENCES profiles(user_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla notifications - Primero eliminar la tabla vieja y crear nueva
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('admin', 'supervisor', 'technician', 'bodeguero')),
  recipient_id UUID REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla equipment_repairs
DROP TABLE IF EXISTS equipment_repairs CASCADE;

CREATE TABLE equipment_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('interno', 'externo')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ingresado' CHECK (status IN ('ingresado', 'en_reparacion', 'reparado', 'no_reparable')),
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_repair_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  technician_assigned_to UUID REFERENCES profiles(user_id),
  created_by UUID NOT NULL REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_material_requests_requester ON material_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
CREATE INDEX IF NOT EXISTS idx_material_request_items_request ON material_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_material ON stock_history(material_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_role, recipient_id);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_technician ON equipment_repairs(technician_assigned_to);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_status ON equipment_repairs(status);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_material_requests_updated_at BEFORE UPDATE ON material_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_repairs_updated_at BEFORE UPDATE ON equipment_repairs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_repairs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para material_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON material_requests;
CREATE POLICY "Users can view their own requests" ON material_requests
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM profiles) OR
    requester_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero'))
  );

DROP POLICY IF EXISTS "Users can create requests" ON material_requests;
CREATE POLICY "Users can create requests" ON material_requests
  FOR INSERT WITH CHECK (
    requester_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can update requests" ON material_requests;
CREATE POLICY "Admins can update requests" ON material_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero'))
  );

-- Políticas RLS para material_request_items
DROP POLICY IF EXISTS "Users can view request items" ON material_request_items;
CREATE POLICY "Users can view request items" ON material_request_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM material_requests mr 
      WHERE mr.id = request_id 
      AND (mr.requester_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero')))
    )
  );

DROP POLICY IF EXISTS "Users can insert request items" ON material_request_items;
CREATE POLICY "Users can insert request items" ON material_request_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM material_requests mr 
      WHERE mr.id = request_id 
      AND mr.requester_id = auth.uid()
    )
  );

-- Políticas RLS para stock_history
DROP POLICY IF EXISTS "Users can view stock history" ON stock_history;
CREATE POLICY "Users can view stock history" ON stock_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero', 'supervisor'))
  );

DROP POLICY IF EXISTS "Admins can insert stock history" ON stock_history;
CREATE POLICY "Admins can insert stock history" ON stock_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero'))
  );

-- Políticas RLS para notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = recipient_role)
  );

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = recipient_role)
  );

-- Políticas RLS para equipment_repairs
DROP POLICY IF EXISTS "Users can view equipment repairs" ON equipment_repairs;
CREATE POLICY "Users can view equipment repairs" ON equipment_repairs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'technician', 'bodeguero'))
  );

DROP POLICY IF EXISTS "Supervisors can create equipment repairs" ON equipment_repairs;
CREATE POLICY "Supervisors can create equipment repairs" ON equipment_repairs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'technician'))
  );

DROP POLICY IF EXISTS "Users can update their equipment repairs" ON equipment_repairs;
CREATE POLICY "Users can update their equipment repairs" ON equipment_repairs
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    technician_assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'bodeguero'))
  );

-- Verificar que todo esté correcto
SELECT 
  'inventory_items category constraint' as check_name,
  COUNT(*) as count
FROM pg_constraint 
WHERE conname = 'inventory_items_category_check'
UNION ALL
SELECT 
  'user_roles role constraint' as check_name,
  COUNT(*) as count
FROM pg_constraint 
WHERE conname = 'user_roles_role_check'
UNION ALL
SELECT 
  'material_requests table' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'material_requests'
UNION ALL
SELECT 
  'material_request_items table' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'material_request_items'
UNION ALL
SELECT 
  'stock_history table' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'stock_history'
UNION ALL
SELECT 
  'notifications table' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'notifications'
UNION ALL
SELECT 
  'equipment_repairs table' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_name = 'equipment_repairs';
