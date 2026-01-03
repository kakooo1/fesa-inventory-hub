-- Verificar tablas de usuario disponibles
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%' OR table_name LIKE '%profile%'
ORDER BY table_name;

-- Si existe tabla profiles
SELECT DISTINCT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY column_name;

-- Ver estructura de auth.users
SELECT DISTINCT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY column_name;
