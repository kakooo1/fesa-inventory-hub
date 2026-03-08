-- ============================================================================
-- MIGRATION: Fix User Management System
-- Date: 2026-01-29
-- Description: Adds delete_user function and ensures proper cascading
-- ============================================================================

-- 1. Ensure all foreign keys are set to CASCADE properly
-- ============================================================================

-- Check and fix profiles foreign key
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
  END IF;
  
  -- Add the constraint with CASCADE
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
END $$;

-- Check and fix user_roles foreign key
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' 
    AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
  END IF;
  
  -- Add the constraint with CASCADE
  ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
END $$;

-- 2. Create the delete_user function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Delete from auth.users (this will cascade to profiles and user_roles)
  DELETE FROM auth.users WHERE id = user_id;
  
  -- If we reach here, deletion was successful
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception with more context
    RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.delete_user(UUID) IS 
  'Safely deletes a user from auth.users and all related tables. Must be called by admins only.';

-- 3. Update the handle_new_user trigger to be more robust
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  user_name TEXT;
BEGIN
  -- Get the name from metadata or use email
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, name, email, active)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    true
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  
  -- Check if this is the first user (make them admin)
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- Insert or update role
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'technician')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger (drop and create to ensure it's updated)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify the setup
-- ============================================================================
-- Check that constraints are properly set
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  rc.update_rule, 
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('profiles', 'user_roles')
  AND tc.constraint_type = 'FOREIGN KEY';
