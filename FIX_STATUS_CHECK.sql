-- Script simple: solo agregar 'returned' al constraint CHECK

-- Step 1: Eliminar el constraint CHECK antiguo
ALTER TABLE public.material_requests
DROP CONSTRAINT IF EXISTS material_requests_status_check;

-- Step 2: Agregar nuevo constraint CHECK que incluya 'returned'
ALTER TABLE public.material_requests
ADD CONSTRAINT material_requests_status_check
CHECK (status IN ('pending', 'approved', 'dispatched', 'returned', 'rejected'));

-- Confirmar
SELECT 'Status check constraint updated to include "returned"' as message;
SELECT DISTINCT status FROM public.material_requests;
