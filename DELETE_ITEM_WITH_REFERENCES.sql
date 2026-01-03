-- Permitir eliminar un artículo borrando sus referencias en solicitudes
-- Reemplaza 'ARTÍCULO_ID' con el ID del artículo que quieres eliminar

-- Paso 1: Primero verifica qué solicitudes usan este artículo
SELECT 
    'Solicitudes que usan este artículo:' as info;
SELECT 
    mr.id as solicitud_id,
    mr.status,
    ii.name as artículo,
    mri.quantity_requested
FROM public.material_request_items mri
JOIN public.material_requests mr ON mr.id = mri.request_id
JOIN public.inventory_items ii ON ii.id = mri.material_id
WHERE ii.id = 'ARTÍCULO_ID'
ORDER BY mr.created_at DESC;

-- Paso 2: Elimina los items de solicitud que referencian este artículo
DELETE FROM public.material_request_items
WHERE material_id = 'ARTÍCULO_ID';

-- Paso 3: Ahora intenta eliminar el artículo
DELETE FROM public.inventory_items
WHERE id = 'ARTÍCULO_ID';

-- Paso 4: Confirma que se eliminó
SELECT 'Artículo eliminado correctamente' as resultado;
SELECT COUNT(*) as artículos_restantes FROM public.inventory_items;
