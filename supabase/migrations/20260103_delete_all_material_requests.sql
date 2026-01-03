-- Borrar todas las solicitudes de materiales
-- Los items asociados se borrarán automáticamente por CASCADE
DELETE FROM public.material_requests;

SELECT 'All material requests deleted successfully' as message;
