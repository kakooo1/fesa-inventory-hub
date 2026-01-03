-- Crear préstamos para herramientas en solicitudes DISPATCHED
-- El problema era que buscábamos status='approved' pero los que tenemos son status='dispatched'

-- Paso 1: Verificar que no haya préstamos duplicados antes de crear
SELECT 'Préstamos existentes antes:' as paso;
SELECT COUNT(*) as total_prestamos FROM public.loans;

-- Paso 2: Crear préstamos para todas las herramientas en solicitudes dispatched
INSERT INTO public.loans (item_id, quantity, borrowed_by, borrowed_at, expected_return, notes, created_by)
SELECT 
    mri.material_id,
    COALESCE(mri.quantity_approved, mri.quantity_requested),
    mr.requester_id,
    COALESCE(mr.approved_date, NOW()),
    COALESCE(mr.approved_date, NOW()) + INTERVAL '30 days',
    'Préstamo automático - solicitud #' || SUBSTRING(mr.id::text, 1, 8),
    mr.approved_by
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE 
    -- Solo para herramientas
    ii.category = 'tool'
    -- En solicitudes dispatched
    AND (mr.status = 'approved' OR mr.status = 'dispatched')
    -- Que tengan datos válidos
    AND mr.requester_id IS NOT NULL
    AND mr.approved_by IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.loans l 
        WHERE l.item_id = mri.material_id 
        AND l.borrowed_by::text = mr.requester_id::text
    )
ON CONFLICT DO NOTHING;

-- Paso 3: Mostrar resultado final con nombre del usuario
SELECT 'Préstamos creados:' as paso;
SELECT 
    l.id,
    ii.name as herramienta,
    l.quantity,
    COALESCE(au.email, l.borrowed_by::text) as prestado_a,
    l.borrowed_at,
    l.expected_return,
    l.notes
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
LEFT JOIN auth.users au ON au.id::text = l.borrowed_by::text
ORDER BY l.borrowed_at DESC;

-- Paso 4: Actualizar el primer préstamo a 3 unidades
UPDATE public.loans
SET quantity = 3
WHERE id = (
    SELECT l.id FROM public.loans l
    JOIN public.inventory_items ii ON ii.id = l.item_id
    WHERE ii.category = 'tool'
    ORDER BY l.borrowed_at DESC 
    LIMIT 1
);

-- Paso 5: Mostrar préstamos finales después de la actualización
SELECT 'Préstamos finales:' as paso;
SELECT 
    l.id,
    ii.name as herramienta,
    l.quantity,
    COALESCE(au.email, l.borrowed_by::text) as prestado_a,
    l.borrowed_at,
    l.expected_return
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
LEFT JOIN auth.users au ON au.id::text = l.borrowed_by::text
ORDER BY l.borrowed_at DESC;
