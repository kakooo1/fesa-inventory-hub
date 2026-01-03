-- Ver TODAS las restricciones que apuntan a inventory_items
SELECT 
    c.conname as constraint_name,
    t.relname as table_name,
    a.attname as column_name,
    CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END as delete_rule
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
AND c.confrelid = (SELECT oid FROM pg_class WHERE relname = 'inventory_items')
ORDER BY t.relname, c.conname;
