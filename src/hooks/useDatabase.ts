import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'material' | 'tool' | 'equipment';
  quantity: number;
  available_quantity: number;
  unit: string;
  min_stock: number;
  location: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  item_id: string;
  quantity: number;
  borrowed_by: string;
  borrowed_at: string;
  expected_return: string;
  returned_at: string | null;
  notes: string | null;
  created_by: string | null;
  item?: InventoryItem;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  current_km: number;
  status: 'active' | 'maintenance' | 'inactive';
  assigned_to: string | null;
  last_maintenance: string | null;
  next_maintenance_km: number | null;
  created_at: string;
  updated_at: string;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  km_at_maintenance: number;
  date: string;
  cost: number;
  performed_by: string;
  created_by: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'supervisor' | 'technician';
}

// ============ INVENTORY ITEMS ============
export function useInventoryItems(category?: 'material' | 'tool' | 'equipment') {
  return useQuery({
    queryKey: ['inventory-items', category],
    queryFn: async () => {
      let query = supabase.from('inventory_items').select('*').order('name');
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InventoryItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes era cacheTime)
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Artículo agregado correctamente');
    },
    onError: (error) => {
      toast.error('Error al agregar: ' + error.message);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Artículo actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Artículo eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}

// ============ LOANS ============
export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*, inventory_items(*)')
        .order('borrowed_at', { ascending: false });
      if (error) throw error;
      return data.map(loan => ({
        ...loan,
        item: loan.inventory_items as InventoryItem,
      })) as (Loan & { item: InventoryItem })[];
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loan: { item_id: string; quantity: number; borrowed_by: string; expected_return: string; notes?: string }) => {
      // First get the current item
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('available_quantity')
        .eq('id', loan.item_id)
        .single();
      
      if (itemError) throw itemError;
      
      // Create the loan
      const { data, error } = await supabase
        .from('loans')
        .insert(loan)
        .select()
        .single();
      if (error) throw error;

      // Update available quantity
      await supabase
        .from('inventory_items')
        .update({ available_quantity: item.available_quantity - loan.quantity })
        .eq('id', loan.item_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Préstamo registrado');
    },
    onError: (error) => {
      toast.error('Error al registrar préstamo: ' + error.message);
    },
  });
}

export function useReturnLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item_id, quantity }: { id: string; item_id: string; quantity: number }) => {
      // Update the loan
      const { error } = await supabase
        .from('loans')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Get current available quantity
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('available_quantity')
        .eq('id', item_id)
        .single();
      
      if (itemError) throw itemError;

      // Restore available quantity
      await supabase
        .from('inventory_items')
        .update({ available_quantity: item.available_quantity + quantity })
        .eq('id', item_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Artículo devuelto');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// ============ VEHICLES ============
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('plate');
      if (error) throw error;
      return data as Vehicle[];
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehículo agregado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...vehicle }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehículo actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehículo eliminado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// ============ MAINTENANCES ============
export function useMaintenances(vehicleId?: string) {
  return useQuery({
    queryKey: ['maintenances', vehicleId],
    queryFn: async () => {
      let query = supabase.from('maintenances').select('*').order('date', { ascending: false });
      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Maintenance[];
    },
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (maintenance: Omit<Maintenance, 'id' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('maintenances')
        .insert(maintenance)
        .select()
        .single();
      if (error) throw error;

      // Update vehicle km and last maintenance
      await supabase
        .from('vehicles')
        .update({ 
          current_km: maintenance.km_at_maintenance,
          last_maintenance: maintenance.date,
        })
        .eq('id', maintenance.vehicle_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Mantención registrada');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// ============ PROFILES & USERS ============
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      return profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role as 'admin' | 'supervisor' | 'technician') || 'technician',
        };
      });
    },
  });
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!profile) return null;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        ...profile,
        role: roleData?.role || 'technician',
      };
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, name, active }: { userId: string; name: string; active: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ name, active })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'supervisor' | 'technician' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      toast.success('Rol actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar rol: ' + error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete profile (cascade will handle user_roles)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Usuario eliminado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}
