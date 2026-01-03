-- Convertir status a ENUM de forma segura
-- Primero crear el ENUM
CREATE TYPE public.material_request_status AS ENUM ('pending', 'approved', 'dispatched', 'returned', 'rejected');

-- Quitar el DEFAULT temporalmente
ALTER TABLE public.material_requests
ALTER COLUMN status DROP DEFAULT;

-- Convertir la columna a usar el ENUM
ALTER TABLE public.material_requests
ALTER COLUMN status TYPE public.material_request_status USING status::public.material_request_status;

-- Establecer el DEFAULT nuevamente
ALTER TABLE public.material_requests
ALTER COLUMN status SET DEFAULT 'pending'::public.material_request_status;

-- Confirmar
SELECT 'Status column converted to ENUM successfully' as message;
SELECT DISTINCT status FROM public.material_requests;
