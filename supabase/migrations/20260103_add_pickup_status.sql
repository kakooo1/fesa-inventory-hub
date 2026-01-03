-- Add picked_up column to material_requests for tracking supervisor pickup
ALTER TABLE material_requests
ADD COLUMN IF NOT EXISTS picked_up BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS picked_up_date TIMESTAMP WITH TIME ZONE;
