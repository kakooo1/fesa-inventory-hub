-- Update vehicle_status enum to use 'ok' instead of 'active'
ALTER TYPE public.vehicle_status RENAME VALUE 'active' TO 'ok';

-- Update default status for vehicles table
ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT 'ok';
