-- Add technical review date column to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN technical_review_date DATE;

-- Add comment for clarity
COMMENT ON COLUMN public.vehicles.technical_review_date IS 'Fecha de la última revisión técnica del vehículo';
