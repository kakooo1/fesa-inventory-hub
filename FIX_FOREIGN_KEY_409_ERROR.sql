-- Fix the foreign key constraint to allow deletion
-- Execute this SQL in the Supabase SQL Editor to fix the 409 error

-- Step 1: Drop the old RESTRICT constraint
ALTER TABLE public.material_request_items
DROP CONSTRAINT IF EXISTS material_request_items_material_id_fkey;

-- Step 2: Add new constraint with ON DELETE CASCADE
ALTER TABLE public.material_request_items
ADD CONSTRAINT material_request_items_material_id_fkey 
FOREIGN KEY (material_id) 
REFERENCES public.inventory_items(id) 
ON DELETE CASCADE;

-- Step 3: Also check and fix loans table if needed
ALTER TABLE public.loans
DROP CONSTRAINT IF EXISTS loans_item_id_fkey;

ALTER TABLE public.loans
ADD CONSTRAINT loans_item_id_fkey 
FOREIGN KEY (item_id) 
REFERENCES public.inventory_items(id) 
ON DELETE CASCADE;

-- Confirmation message
SELECT 'Foreign key constraints fixed successfully!' as message;
