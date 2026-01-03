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

-- Create indexes for material_requests
CREATE INDEX idx_material_requests_status ON public.material_requests(status);
CREATE INDEX idx_material_requests_requester ON public.material_requests(requester_id);
CREATE INDEX idx_material_requests_approved_by ON public.material_requests(approved_by);
CREATE INDEX idx_material_requests_request_date ON public.material_requests(request_date);

-- Add comment to table
COMMENT ON TABLE public.material_requests IS 'Solicitudes de materiales por supervisores';
COMMENT ON COLUMN public.material_requests.status IS 'Estados: pending, approved, rejected, dispatched, completed';
