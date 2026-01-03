-- Ver las reglas DELETE específicas de las restricciones
SELECT 
    c.conname as constraint_name,
    t.relname as table_name,
    CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END as delete_rule
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE c.contype = 'f'
AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND t.relname IN ('material_request_items', 'loans')
ORDER BY t.relname, c.conname;
