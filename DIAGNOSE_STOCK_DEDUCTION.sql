-- Diagnosticar problema de descuento en herramientas
-- Ver cantidad disponible de "testo manometro"
SELECT 
    'INVENTARIO' as tipo,
    name,
    category,
    quantity,
    available_quantity
FROM public.inventory_items
WHERE name ILIKE '%testo%';

-- Ver historial de stock para testo manometro
SELECT 
    'STOCK_HISTORY' as tipo,
    sh.operation_type,
    sh.quantity_change,
    sh.previous_quantity,
    sh.new_quantity,
    sh.performed_by,
    sh.created_at
FROM public.stock_history sh
JOIN public.inventory_items ii ON ii.id = sh.material_id
WHERE ii.name ILIKE '%testo%'
ORDER BY sh.created_at DESC;

-- Ver si hay préstamos activos de testo manometro
SELECT 
    'PRESTAMOS_ACTIVOS' as tipo,
    l.id,
    l.quantity,
    l.borrower_name,
    l.borrowed_at,
    l.returned_at
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
WHERE ii.name ILIKE '%testo%'
AND l.returned_at IS NULL;

-- Ver solicitudes de testo manometro con estado
SELECT 
    'SOLICITUDES' as tipo,
    mr.status,
    mri.quantity_requested,
    mri.quantity_approved,
    mri.quantity_dispatched,
    ii.name
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE ii.name ILIKE '%testo%';
