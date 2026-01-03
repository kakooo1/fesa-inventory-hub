-- Ver estructura y datos de la tabla profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Ver datos de profiles
SELECT * FROM public.profiles LIMIT 5;
