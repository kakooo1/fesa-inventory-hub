-- Create equipment repair status enum
CREATE TYPE public.repair_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create equipment_repairs table
CREATE TABLE public.equipment_repairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.inventory_items(id) ON DELETE RESTRICT NOT NULL,
  status repair_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_by_name TEXT NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  repair_notes TEXT,
  technician_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_equipment_repairs_equipment_id ON public.equipment_repairs(equipment_id);
CREATE INDEX idx_equipment_repairs_assigned_to ON public.equipment_repairs(assigned_to);
CREATE INDEX idx_equipment_repairs_status ON public.equipment_repairs(status);
CREATE INDEX idx_equipment_repairs_created_by ON public.equipment_repairs(created_by);

-- Enable Row Level Security
ALTER TABLE public.equipment_repairs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment_repairs
-- Everyone can view repairs
CREATE POLICY "Everyone can view equipment repairs" ON public.equipment_repairs
  FOR SELECT
  USING (true);

-- Only supervisors can create repairs
CREATE POLICY "Supervisors can create equipment repairs" ON public.equipment_repairs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'supervisor'
    )
  );

-- Only supervisors can update repair status and assignments, or technicians can update their own notes
CREATE POLICY "Supervisors can update all repairs" ON public.equipment_repairs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'supervisor'
    )
  );

-- Technicians can only update technician_notes on repairs assigned to them
CREATE POLICY "Technicians can update their assigned repairs notes" ON public.equipment_repairs
  FOR UPDATE
  USING (
    assigned_to = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'technician'
    )
  )
  WITH CHECK (
    -- Can only update technician_notes, not other fields
    assigned_to = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'technician'
    )
  );

-- Only supervisors can delete repairs
CREATE POLICY "Supervisors can delete equipment repairs" ON public.equipment_repairs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'supervisor'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_equipment_repairs_updated_at
  BEFORE UPDATE ON public.equipment_repairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
