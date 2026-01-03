-- Agregar columna borrower_name a la tabla loans si no existe
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS borrower_name TEXT;

-- Actualizar los préstamos existentes con el ID del usuario (por ahora)
-- Más adelante podemos obtener el nombre real
UPDATE public.loans
SET borrower_name = borrowed_by::text
WHERE borrower_name IS NULL;

-- Ver los préstamos con la nueva columna
SELECT 
    l.id,
    ii.name as herramienta,
    l.quantity,
    l.borrower_name as prestado_a,
    l.borrowed_at,
    l.expected_return
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
ORDER BY l.borrowed_at DESC;
