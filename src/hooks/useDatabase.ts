import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'material' | 'tool' | 'equipment' | 'clothing' | 'epp';
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
  borrower_name?: string;
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
  role: 'admin' | 'supervisor' | 'technician' | 'bodeguero';
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
      // Check if there are active loans for this item
      const { data: activeLoans } = await supabase
        .from('loans')
        .select('id')
        .eq('item_id', id)
        .is('returned_at', null);

      if (activeLoans && activeLoans.length > 0) {
        throw new Error('No se puede eliminar este artículo porque tiene préstamos activos. Devuelve todos los préstamos primero.');
      }

      // Try to delete
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) {
        // Check if it's a foreign key constraint error
        if (error.message.includes('foreign key constraint')) {
          throw new Error('No se puede eliminar este artículo porque está siendo usado en solicitudes de materiales. Cancela o rechaza las solicitudes primero.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Artículo eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + (error as Error).message);
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
      // Get the loan to capture who returned it
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', id)
        .single();

      // Update the loan
      const { error } = await supabase
        .from('loans')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Get current available quantity
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', item_id)
        .single();
      
      if (itemError) throw itemError;

      const newAvailableQty = item.available_quantity + quantity;

      // Restore available quantity
      await supabase
        .from('inventory_items')
        .update({ available_quantity: newAvailableQty })
        .eq('id', item_id);

      // Create stock history entry for the return
      if (loan) {
        await supabase
          .from('stock_history')
          .insert({
            material_id: item_id,
            quantity_change: quantity,
            previous_quantity: item.available_quantity,
            new_quantity: newAvailableQty,
            operation_type: 'return',
            performed_by: loan.borrowed_by,
            notes: `Devolución de préstamo #${id.slice(0, 8)}`,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
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
      queryClient.invalidateQueries({ queryKey: ['current-profile'] });
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
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'supervisor' | 'technician' | 'bodeguero' }) => {
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

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, name, role }: { email: string; password: string; name: string; role: 'admin' | 'supervisor' | 'technician' | 'bodeguero' }) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const userId = authData.user.id;

      // 2. Update profile (trigger creates it, we just update the name)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          active: true,
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // 3. Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
        });

      if (roleError) throw roleError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Usuario creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear usuario: ' + error.message);
    },
  });
}

// ============ MATERIAL REQUESTS ============
export interface MaterialRequest {
  id: string;
  requester_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'dispatched' | 'completed';
  request_date: string;
  approved_by: string | null;
  approved_date: string | null;
  ready_for_pickup: boolean;
  ready_for_pickup_date: string | null;
  picked_up: boolean;
  picked_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialRequestItem {
  id: string;
  request_id: string;
  material_id: string;
  quantity_requested: number;
  quantity_approved: number | null;
  quantity_dispatched: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  inventory_items?: InventoryItem; // Joined data
}

export interface MaterialRequestWithItems extends MaterialRequest {
  material_request_items?: MaterialRequestItem[];
  requester?: Profile; // Joined data
  approver?: Profile; // Joined data
}

export interface StockHistory {
  id: string;
  material_id: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  operation_type: 'entry' | 'approval' | 'dispatch' | 'adjustment' | 'return';
  related_request_id: string | null;
  performed_by: string;
  notes: string | null;
  created_at: string;
}

// Queries
export function useMaterialRequests(status?: string, requester_id?: string) {
  return useQuery({
    queryKey: ['material-requests', status, requester_id],
    queryFn: async () => {
      let query = supabase
        .from('material_requests')
        .select('*, profiles!requester_id(id, name, email), approved_by_profile:profiles!approved_by(id, name, email), material_request_items(*, inventory_items(*))')
        .order('request_date', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      if (requester_id) {
        query = query.eq('requester_id', requester_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data as MaterialRequestWithItems[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useMaterialRequestDetail(requestId: string) {
  return useQuery({
    queryKey: ['material-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_requests')
        .select('*, profiles!requester_id(id, name, email), approved_by_profile:profiles!approved_by(id, name, email), material_request_items(*, inventory_items(*))')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      return data as MaterialRequestWithItems;
    },
  });
}

export function useStockHistory(materialId?: string) {
  return useQuery({
    queryKey: ['stock-history', materialId],
    queryFn: async () => {
      let query = supabase
        .from('stock_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (materialId) {
        query = query.eq('material_id', materialId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as StockHistory[];
    },
  });
}

// Mutations
export function useCreateMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requester_id,
      items,
      notes,
    }: {
      requester_id: string;
      items: Array<{ material_id: string; quantity_requested: number; notes?: string }>;
      notes?: string;
    }) => {
      // Create the request
      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .insert({ requester_id, notes, status: 'pending' })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create the items
      const itemsToInsert = items.map(item => ({
        request_id: request.id,
        material_id: item.material_id,
        quantity_requested: item.quantity_requested,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('material_request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Create notifications - only notify ADMIN about new requests
      const notificationData = {
        title: 'Nueva Solicitud de Materiales',
        description: notes || 'Se ha creado una nueva solicitud de materiales',
        notification_type: 'material_request' as const,
        vehicle_id: null,
        material_request_id: request.id,
        created_by: requester_id,
      };

      // Notify only ADMIN
      await supabase.from('notifications').insert({
        ...notificationData,
        recipient_role: 'admin',
      });

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Solicitud creada correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear solicitud: ' + error.message);
    },
  });
}

export function useApproveMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      approvedBy,
      partialApprovals,
    }: {
      requestId: string;
      approvedBy: string;
      partialApprovals?: Array<{ itemId: string; quantity: number }>;
    }) => {
      // Get request with items including inventory details
      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .select('*, material_request_items(*, inventory_items(*))')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update each request item and deduct from stock
      for (const item of request.material_request_items) {
        const approvedQty = partialApprovals?.find(pa => pa.itemId === item.id)?.quantity || item.quantity_requested;

        // Update request item
        await supabase
          .from('material_request_items')
          .update({ quantity_approved: approvedQty })
          .eq('id', item.id);

        // Get current inventory
        const { data: material, error: matError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('id', item.material_id)
          .single();

        if (matError) throw matError;

        const newAvailableQty = Math.max(0, material.available_quantity - approvedQty);

        // Update inventory
        await supabase
          .from('inventory_items')
          .update({ available_quantity: newAvailableQty })
          .eq('id', item.material_id);

        // Create stock history entry
        await supabase
          .from('stock_history')
          .insert({
            material_id: item.material_id,
            quantity_change: -approvedQty,
            previous_quantity: material.available_quantity,
            new_quantity: newAvailableQty,
            operation_type: 'approval',
            related_request_id: requestId,
            performed_by: approvedBy,
            notes: `Aprobación de solicitud para ${approvedQty} unidades`,
          });

        // If it's a TOOL, create a LOAN automatically
        if (material.category === 'tool') {
          const expectedReturnDate = new Date();
          expectedReturnDate.setDate(expectedReturnDate.getDate() + 30); // Default: 30 days

          // Get borrower name from profiles
          const { data: borrowerProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', request.requester_id)
            .single();

          const borrowerName = borrowerProfile?.name || request.requester_id;

          await supabase.from('loans').insert({
            item_id: material.id,
            quantity: approvedQty,
            borrowed_by: request.requester_id,
            borrower_name: borrowerName,
            borrowed_at: new Date().toISOString(),
            expected_return: expectedReturnDate.toISOString(),
            notes: `Préstamo automático de solicitud #${requestId.slice(0, 8)}`,
            created_by: approvedBy,
          });

          // Notify the borrower that a tool loan was created
          const { data: borrowerRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', request.requester_id)
            .single();

          if (borrowerRole?.role === 'supervisor') {
            await supabase.from('notifications').insert({
              title: 'Herramienta Agregada a Tus Préstamos',
              description: `La herramienta "${material.name}" (${approvedQty} unidades) ha sido agregada automáticamente a tus préstamos con vencimiento en 30 días`,
              notification_type: 'material_request',
              vehicle_id: null,
              material_request_id: requestId,
              created_by: approvedBy,
              recipient_role: 'supervisor',
            });
          }
        }
      }

      // Update request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from('material_requests')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_date: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create notifications when request is approved
      // 1. Notify BODEGUERO to prepare for dispatch
      await supabase.from('notifications').insert({
        title: 'Solicitud Aprobada - Lista para Despacho',
        description: 'Una solicitud de materiales ha sido aprobada y está lista para preparar el despacho',
        notification_type: 'material_request',
        vehicle_id: null,
        material_request_id: requestId,
        created_by: approvedBy,
        recipient_role: 'bodeguero',
      });

      // 2. Notify SUPERVISOR (if they created the request) that their request is approved
      if (request.requester_id) {
        // Get requester role to see if they are supervisor
        const { data: requesterRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', request.requester_id)
          .single();

        if (requesterRole?.role === 'supervisor') {
          await supabase.from('notifications').insert({
            title: 'Tu Solicitud de Materiales Fue Aprobada',
            description: 'Tu solicitud ha sido aprobada. El bodeguero está preparando los materiales para retiro',
            notification_type: 'material_request',
            vehicle_id: null,
            material_request_id: requestId,
            created_by: approvedBy,
            recipient_role: 'supervisor',
          });
        }
      }

      return updatedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      // Invalidate all notification queries regardless of userRole filter
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Solicitud aprobada y stock actualizado');
    },
    onError: (error) => {
      toast.error('Error al aprobar solicitud: ' + error.message);
    },
  });
}

export function useRejectMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, rejectedBy }: { requestId: string; rejectedBy: string }) => {
      const { data, error } = await supabase
        .from('material_requests')
        .update({
          status: 'rejected',
          approved_by: rejectedBy,
          approved_date: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      toast.success('Solicitud rechazada');
    },
    onError: (error) => {
      toast.error('Error al rechazar solicitud: ' + error.message);
    },
  });
}

export function useDispatchMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, dispatchedBy }: { requestId: string; dispatchedBy: string }) => {
      // Get request with items
      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .select('*, material_request_items(*)')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update each request item
      for (const item of request.material_request_items) {
        await supabase
          .from('material_request_items')
          .update({ quantity_dispatched: item.quantity_approved || item.quantity_requested })
          .eq('id', item.id);

        // Create stock history entry
        await supabase
          .from('stock_history')
          .insert({
            material_id: item.material_id,
            quantity_change: 0, // Stock ya fue deducido en aprobación
            previous_quantity: 0,
            new_quantity: 0,
            operation_type: 'dispatch',
            related_request_id: requestId,
            performed_by: dispatchedBy,
            notes: `Despacho de ${item.quantity_approved || item.quantity_requested} unidades`,
          });
      }

      // Update request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from('material_requests')
        .update({ status: 'dispatched' })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      toast.success('Solicitud despachada correctamente');
    },
    onError: (error) => {
      toast.error('Error al despachar solicitud: ' + error.message);
    },
  });
}

// ============ NOTIFICATIONS ============
export interface Notification {
  id: string;
  title: string;
  description: string | null;
  notification_type: 'vehicle_report' | 'material_request';
  vehicle_id: string | null;
  material_request_id: string | null;
  created_by: string;
  recipient_role: 'admin' | 'supervisor' | 'technician' | 'bodeguero';
  read_at: string | null;
  read_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'read_at' | 'read_by' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
    },
  });
}

export function useGetNotifications(userRole?: string) {
  return useQuery({
    queryKey: ['notifications', userRole],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by user role if provided
      if (userRole) {
        query = query.eq('recipient_role', userRole);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 1000 * 30, // 30 segundos
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString(), read_by: userId })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkReadyForPickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, markedBy }: { requestId: string; markedBy: string }) => {
      // Get request details to notify requester (supervisor)
      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .select('requester_id')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from('material_requests')
        .update({
          ready_for_pickup: true,
          ready_for_pickup_date: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Notify supervisor that their request is ready for pickup
      if (request.requester_id) {
        const { data: requesterRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', request.requester_id)
          .single();

        if (requesterRole?.role === 'supervisor') {
          await supabase.from('notifications').insert({
            title: 'Tu Solicitud está Lista para Retiro',
            description: 'Los materiales solicitados están listos y disponibles para retiro',
            notification_type: 'material_request',
            vehicle_id: null,
            material_request_id: requestId,
            created_by: markedBy,
            recipient_role: 'supervisor',
          });
        }
      }

      return updatedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      // Invalidate all notification queries regardless of userRole filter
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Solicitud marcada como lista para retiro');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useMarkAsPickedUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, pickedUpBy }: { requestId: string; pickedUpBy: string }) => {
      // Get the request with all its items
      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .select(`
          *,
          material_request_items(
            id,
            material_id,
            quantity_approved,
            inventory_items(id, name, category)
          )
        `)
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;
      if (!request) throw new Error('Solicitud no encontrada');

      // Create loans for tools
      if (request.material_request_items) {
        for (const item of request.material_request_items) {
          const inventoryItem = item.inventory_items as any;
          
          // If it's a tool, create a loan
          if (inventoryItem && inventoryItem.category === 'tool') {
            const { error: loanError } = await supabase
              .from('loans')
              .insert({
                item_id: inventoryItem.id,
                quantity: item.quantity_approved || 0,
                borrowed_by: pickedUpBy,
                borrowed_at: new Date().toISOString(),
                expected_return: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
                notes: `Prestado desde solicitud de materiales #${requestId}`,
                created_by: pickedUpBy,
              });

            if (loanError) throw loanError;
          }
        }
      }

      // Update request status to returned and mark as picked up
      const { data: updatedRequest, error: updateError } = await supabase
        .from('material_requests')
        .update({
          status: 'returned',
          picked_up: true,
          picked_up_date: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedRequest;
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['material-requests'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['loans'],
        refetchType: 'all'
      });
      queryClient.refetchQueries({
        queryKey: ['material-requests'],
        type: 'active'
      });
      queryClient.refetchQueries({
        queryKey: ['loans'],
        type: 'active'
      });
      toast.success('Solicitud marcada como retirada. Préstamos creados para herramientas');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// ============ EQUIPMENT REPAIRS ============
export interface EquipmentRepair {
  id: string;
  equipment_name: string;
  source: string;
  description: string | null;
  status: 'ingresado' | 'en_reparacion' | 'reparado' | 'no_reparable';
  entry_date: string;
  exit_date: string | null;
  estimated_repair_date: string | null;
  technician_assigned_to: string | null;
  notes: string | null;
  parts_replaced: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useEquipmentRepairs() {
  return useQuery({
    queryKey: ['equipment-repairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_repairs')
        .select('*')
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data as EquipmentRepair[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateEquipmentRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<EquipmentRepair, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('equipment_repairs')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data as EquipmentRepair;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Equipo agregado a reparación');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useUpdateEquipmentRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<EquipmentRepair> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment_repairs')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as EquipmentRepair;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Equipo actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeleteEquipmentRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_repairs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Equipo eliminado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}
