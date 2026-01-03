-- Fix foreign key constraints to allow deletion with cascading updates
-- This allows deleting inventory items even if they are referenced in material requests

-- Drop the old constraint and recreate it with ON DELETE CASCADE
ALTER TABLE public.material_request_items
DROP CONSTRAINT material_request_items_material_id_fkey;

ALTER TABLE public.material_request_items
ADD CONSTRAINT material_request_items_material_id_fkey 
FOREIGN KEY (material_id) 
REFERENCES public.inventory_items(id) 
ON DELETE CASCADE;

-- Also ensure loans table has proper cascade if it references inventory_items
-- This prevents errors when deleting tools that have loans
ALTER TABLE public.loans
DROP CONSTRAINT IF EXISTS loans_item_id_fkey;

ALTER TABLE public.loans
ADD CONSTRAINT loans_item_id_fkey 
FOREIGN KEY (item_id) 
REFERENCES public.inventory_items(id) 
ON DELETE CASCADE;
