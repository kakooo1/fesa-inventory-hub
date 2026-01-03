-- Add ready_for_pickup column to material_requests
ALTER TABLE material_requests
ADD COLUMN IF NOT EXISTS ready_for_pickup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ready_for_pickup_date TIMESTAMP WITH TIME ZONE;
