-- Crear retroactivamente préstamos para herramientas en solicitudes aprobadas
-- Ejecuta este script en el SQL Editor de Supabase

-- Paso 1: Crear préstamos automáticos para todas las herramientas en solicitudes aprobadas que no tengan préstamo
INSERT INTO public.loans (item_id, quantity, borrowed_by, borrowed_at, expected_return, notes, created_by)
SELECT 
    mri.material_id,
    COALESCE(mri.quantity_approved, mri.quantity_requested),
    mr.requester_id,
    COALESCE(mr.approved_date, NOW()),
    COALESCE(mr.approved_date, NOW()) + INTERVAL '30 days',
    'Préstamo automático retroactivo de solicitud #' || SUBSTRING(mr.id::text, 1, 8),
    mr.approved_by
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE 
    -- Solo para herramientas
    ii.category = 'tool'
    -- Que están en solicitudes aprobadas
    AND mr.status = 'approved'
    -- Que tengan requester_id válido
    AND mr.requester_id IS NOT NULL
    -- Que tengan approved_by válido
    AND mr.approved_by IS NOT NULL
    -- Que no tengan préstamo asociado
    AND NOT EXISTS (
        SELECT 1 FROM public.loans l 
        WHERE l.item_id = mri.material_id 
        AND l.borrowed_by::text = mr.requester_id::text
    )
ON CONFLICT DO NOTHING;

-- Paso 2: Verificar cuántos préstamos se crearon
SELECT COUNT(*) as prestamos_creados 
FROM public.loans 
WHERE notes LIKE 'Préstamo automático retroactivo%';

-- Paso 3: Mostrar los préstamos creados
SELECT 
    l.id,
    ii.name as herramienta,
    l.quantity,
    l.borrowed_by as usuario_id,
    l.borrowed_at,
    l.expected_return
FROM public.loans l
JOIN public.inventory_items ii ON ii.id = l.item_id
WHERE l.notes LIKE 'Préstamo automático retroactivo%'
ORDER BY l.borrowed_at DESC;
