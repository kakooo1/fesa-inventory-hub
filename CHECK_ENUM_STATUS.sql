-- Script seguro que verifica antes de cambiar

-- Ver qué tipos ENUM existen
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- Ver el tipo específico de material_requests
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'material_requests' AND column_name = 'status';
