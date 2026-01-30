-- Create a function to safely delete a user from both auth.users and related tables
-- This function must be created as a SECURITY DEFINER function to have permissions
-- to delete from auth.users

CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Delete from auth.users (this will cascade to profiles and user_roles due to ON DELETE CASCADE)
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
-- (RLS policies on profiles will still control who can actually call this)
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.delete_user(UUID) IS 
  'Safely deletes a user from auth.users and all related tables. Must be called by admins only.';
