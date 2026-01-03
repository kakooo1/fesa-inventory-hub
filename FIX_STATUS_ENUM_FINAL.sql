-- Convertir status a ENUM eliminando constraint CHECK primero

-- Step 1: Encontrar y eliminar el constraint CHECK
ALTER TABLE public.material_requests
DROP CONSTRAINT IF EXISTS material_requests_status_check;

-- Step 2: Eliminar el ENUM anterior si existe
DROP TYPE IF EXISTS public.material_request_status CASCADE;

-- Step 3: Crear el ENUM con todos los valores válidos
CREATE TYPE public.material_request_status AS ENUM ('pending', 'approved', 'dispatched', 'returned', 'rejected');

-- Step 4: Quitar el DEFAULT temporalmente
ALTER TABLE public.material_requests
ALTER COLUMN status DROP DEFAULT;

-- Step 5: Convertir la columna a usar el ENUM
ALTER TABLE public.material_requests
ALTER COLUMN status TYPE public.material_request_status USING status::public.material_request_status;

-- Step 6: Establecer el DEFAULT nuevamente
ALTER TABLE public.material_requests
ALTER COLUMN status SET DEFAULT 'pending'::public.material_request_status;

-- Confirmar
SELECT 'Status constraint removed and ENUM created successfully' as message;
SELECT DISTINCT status FROM public.material_requests;
