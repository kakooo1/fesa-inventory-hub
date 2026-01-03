-- Actualizar el tipo de enum para material_requests.status
-- Agregar 'returned' como status válido

-- Primero, crear el nuevo tipo
CREATE TYPE public.material_request_status_new AS ENUM ('pending', 'approved', 'dispatched', 'returned', 'rejected');

-- Remover el DEFAULT temporalmente
ALTER TABLE public.material_requests
ALTER COLUMN status DROP DEFAULT;

-- Migrar los datos
ALTER TABLE public.material_requests
  ALTER COLUMN status TYPE public.material_request_status_new USING status::text::public.material_request_status_new;

-- Restaurar el DEFAULT
ALTER TABLE public.material_requests
ALTER COLUMN status SET DEFAULT 'pending'::public.material_request_status_new;

-- Eliminar el tipo antiguo
DROP TYPE public.material_request_status;

-- Renombrar el nuevo tipo
ALTER TYPE public.material_request_status_new RENAME TO material_request_status;

-- Confirmar
SELECT 'Material request status updated to include "returned"' as message;
SELECT DISTINCT status FROM public.material_requests;
