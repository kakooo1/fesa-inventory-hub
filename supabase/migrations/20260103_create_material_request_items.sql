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

-- Create indexes for material_request_items
CREATE INDEX idx_request_items_request ON public.material_request_items(request_id);
CREATE INDEX idx_request_items_material ON public.material_request_items(material_id);

-- Add comment to table
COMMENT ON TABLE public.material_request_items IS 'Detalle de materiales en cada solicitud';
