-- Verificar el estado actual de las restricciones de clave foránea
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table_name,
    ccu.column_name AS referenced_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND (tc.table_name = 'material_request_items' OR tc.table_name = 'loans')
ORDER BY tc.table_name;

-- Ver reglas DELETE de las restricciones
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND (table_name = 'material_request_items' OR table_name = 'loans')
AND constraint_type = 'FOREIGN KEY';
