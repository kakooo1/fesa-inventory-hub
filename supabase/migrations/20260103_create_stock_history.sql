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

-- Create indexes for stock_history
CREATE INDEX idx_stock_history_material ON public.stock_history(material_id);
CREATE INDEX idx_stock_history_operation ON public.stock_history(operation_type);
CREATE INDEX idx_stock_history_request ON public.stock_history(related_request_id);
CREATE INDEX idx_stock_history_date ON public.stock_history(created_at);

-- Add comment to table
COMMENT ON TABLE public.stock_history IS 'Historial de cambios de stock para auditoría';
COMMENT ON COLUMN public.stock_history.operation_type IS 'Tipos: entry (entrada), approval (aprobación), dispatch (despacho), adjustment (ajuste), return (devolución)';
