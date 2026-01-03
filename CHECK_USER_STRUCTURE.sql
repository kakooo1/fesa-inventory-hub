-- Ver estructura de tablas relacionadas con usuarios
SELECT table_name, column_name 
FROM information_schema.columns
WHERE table_schema = 'public' AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%role%')
ORDER BY table_name, ordinal_position;

-- Ver datos de user_roles
SELECT * FROM public.user_roles LIMIT 5;

-- Ver si existe tabla profiles
SELECT * FROM public.profiles LIMIT 5;

-- Ver si hay otra tabla con nombres
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
