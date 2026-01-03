-- Arreglar la restricción en stock_history que tiene RESTRICT
-- Esta es la que está causando el error 409

-- Step 1: Drop the RESTRICT constraint
ALTER TABLE public.stock_history
DROP CONSTRAINT IF EXISTS stock_history_material_id_fkey;

-- Step 2: Add new constraint with ON DELETE CASCADE
ALTER TABLE public.stock_history
ADD CONSTRAINT stock_history_material_id_fkey 
FOREIGN KEY (material_id) 
REFERENCES public.inventory_items(id) 
ON DELETE CASCADE;

-- Confirmation
SELECT 'Stock history constraint fixed successfully!' as message;

-- Verify all constraints are now CASCADE
SELECT 
    c.conname as constraint_name,
    t.relname as table_name,
    CASE c.confdeltype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'r' THEN 'RESTRICT'
    END as delete_rule
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE c.contype = 'f'
AND c.confrelid = (SELECT oid FROM pg_class WHERE relname = 'inventory_items')
ORDER BY t.relname;
