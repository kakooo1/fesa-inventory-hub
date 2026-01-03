-- Mostrar TODO para diagnosticar el problema de préstamos
-- Este script muestra toda la información en un solo resultado

-- Ver TODOS los items en inventario
SELECT '1_ITEMS' as seccion, id, name, category FROM public.inventory_items ORDER BY name;

-- Ver TODAS las solicitudes
SELECT '2_SOLICITUDES' as seccion, id, status, requester_id, approved_by, approved_date FROM public.material_requests ORDER BY created_at DESC;

-- Ver TODOS los items en solicitudes (detalles)
SELECT 
    '3_ITEMS_EN_SOLICITUDES' as seccion,
    mr.id as solicitud_id,
    mr.status as solicitud_status,
    ii.name as item_name,
    ii.category,
    mri.quantity_requested,
    mri.quantity_approved
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
ORDER BY mr.created_at DESC;

-- Ver TODOS los préstamos
SELECT '4_PRESTAMOS' as seccion, id, item_id, quantity, borrowed_by, borrowed_at FROM public.loans ORDER BY borrowed_at DESC;
