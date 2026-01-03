-- Diagnóstico detallado del problema
-- Copia el resultado de cada query para que podamos diagnosticar

-- Query 1: Verificar que el item existe y su configuración
SELECT 
    'ITEM' as tipo,
    id,
    name,
    category,
    quantity as qty_total,
    available_quantity as qty_disponible
FROM public.inventory_items
WHERE name ILIKE '%manometro%'
LIMIT 5;

-- Query 2: Ver TODAS las solicitudes de material (no filtradas)
SELECT 
    'SOLICITUD' as tipo,
    mr.id,
    mr.status,
    mr.requester_id,
    mr.approved_by,
    mr.approved_date,
    COUNT(mri.id) as cantidad_items
FROM public.material_requests mr
LEFT JOIN public.material_request_items mri ON mr.id = mri.request_id
GROUP BY mr.id, mr.status, mr.requester_id, mr.approved_by, mr.approved_date
ORDER BY mr.created_at DESC
LIMIT 10;

-- Query 3: Ver solicitudes que mencionen manometro específicamente
SELECT 
    'SOLICITUD-MANOMETRO' as tipo,
    mr.id as request_id,
    mr.status,
    mr.created_at,
    mr.approved_date,
    mr.requester_id,
    mr.approved_by,
    ii.name,
    mri.quantity_requested,
    mri.quantity_approved
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE ii.name ILIKE '%manometro%'
ORDER BY mr.created_at DESC;

-- Query 4: Ver TODOS los préstamos existentes
SELECT 
    'PRESTAMO' as tipo,
    l.id,
    ii.name as herramienta,
    l.quantity,
    l.borrowed_by,
    l.borrowed_at,
    l.expected_return
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
ORDER BY l.borrowed_at DESC
LIMIT 20;

-- Query 5: Contar registros en cada tabla
SELECT 
    'COUNT' as tipo,
    (SELECT COUNT(*) FROM public.inventory_items)::text as inventory_items,
    (SELECT COUNT(*) FROM public.material_requests)::text as material_requests,
    (SELECT COUNT(*) FROM public.material_request_items)::text as material_request_items,
    (SELECT COUNT(*) FROM public.loans)::text as loans;
