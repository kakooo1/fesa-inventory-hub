-- Script de diagnóstico para "testo manometro"
-- Ejecuta esto en el SQL Editor de Supabase para investigar el problema

-- Paso 1: Ver si "testo manometro" existe y su categoría
SELECT 
    id,
    name,
    category,
    quantity,
    available_quantity
FROM public.inventory_items
WHERE name ILIKE '%testo%' OR name ILIKE '%manometro%'
LIMIT 10;

-- Paso 2: Ver todas las solicitudes que incluyen "testo manometro"
SELECT 
    mr.id as request_id,
    mr.status,
    mr.requester_id,
    mr.approved_by,
    mr.approved_date,
    mri.quantity_requested,
    mri.quantity_approved,
    ii.name
FROM public.material_requests mr
JOIN public.material_request_items mri ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE ii.name ILIKE '%testo%' OR ii.name ILIKE '%manometro%'
ORDER BY mr.created_at DESC;

-- Paso 3: Ver si existen préstamos para "testo manometro"
SELECT 
    l.id,
    l.quantity,
    l.borrowed_by,
    l.borrowed_at,
    l.expected_return,
    l.notes,
    ii.name
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
WHERE ii.name ILIKE '%testo%' OR ii.name ILIKE '%manometro%';

-- Paso 4: Crear préstamos faltantes para "testo manometro" si es necesario
INSERT INTO public.loans (item_id, quantity, borrowed_by, borrowed_at, expected_return, notes, created_by)
SELECT 
    ii.id,
    mri.quantity_approved,
    mr.requester_id,
    COALESCE(mr.approved_date, NOW()),
    COALESCE(mr.approved_date, NOW()) + INTERVAL '30 days',
    'Préstamo automático retroactivo de solicitud #' || SUBSTRING(mr.id::text, 1, 8),
    mr.approved_by
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE 
    (ii.name ILIKE '%testo%' OR ii.name ILIKE '%manometro%')
    AND ii.category = 'tool'
    AND mr.status = 'approved'
    AND mr.requester_id IS NOT NULL
    AND mr.approved_by IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.loans l 
        WHERE l.item_id = ii.id 
        AND l.borrowed_by::text = mr.requester_id::text
    )
ON CONFLICT DO NOTHING;

-- Paso 5: Mostrar los préstamos después de crearlos
SELECT 
    l.id,
    ii.name,
    l.quantity,
    l.borrowed_by,
    l.borrowed_at,
    l.expected_return
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
WHERE ii.name ILIKE '%testo%' OR ii.name ILIKE '%manometro%'
ORDER BY l.borrowed_at DESC;
