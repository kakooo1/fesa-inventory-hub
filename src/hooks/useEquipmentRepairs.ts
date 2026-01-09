import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EquipmentRepair {
  id: string;
  equipment_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string | null;
  created_by: string;
  entry_date: string;
  exit_date: string | null;
  repair_notes: string;
  technician_notes: string;
  created_at: string;
  updated_at: string;
  equipment_name?: string;
}

// Get all equipment repairs with equipment names
export function useEquipmentRepairs(status?: string) {
  return useQuery({
    queryKey: ['equipment-repairs', status],
    queryFn: async () => {
      let query = (supabase as any)
        .from('equipment_repairs')
        .select(`
          *,
          inventory_items:equipment_id(name)
        `)
        .order('entry_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        equipment_name: item.inventory_items?.name || 'Equipo desconocido'
      })) as EquipmentRepair[];
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}

// Get equipment repairs by technician
export function useMyEquipmentRepairs(technicianId: string) {
  return useQuery({
    queryKey: ['equipment-repairs-mine', technicianId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('equipment_repairs')
        .select(`
          *,
          inventory_items:equipment_id(name)
        `)
        .eq('assigned_to', technicianId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        equipment_name: item.inventory_items?.name || 'Equipo desconocido'
      })) as EquipmentRepair[];
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    enabled: !!technicianId,
  });
}

// Create equipment repair
export function useCreateEquipmentRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      equipment_id: string;
      created_by: string;
      entry_date: string;
      repair_notes: string;
    }) => {
      const { data: repair, error } = await (supabase as any)
        .from('equipment_repairs')
        .insert({
          equipment_id: data.equipment_id,
          status: 'pending',
          created_by: data.created_by,
          entry_date: data.entry_date,
          repair_notes: data.repair_notes,
          technician_notes: '',
        })
        .select()
        .single();

      if (error) throw error;
      return repair;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Reparación creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear reparación: ' + error.message);
    },
  });
}

// Update equipment repair
export function useUpdateEquipmentRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      assigned_to?: string | null;
      repair_notes?: string;
      technician_notes?: string;
      exit_date?: string | null;
    }) => {
      const updateData: any = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to;
      if (data.repair_notes !== undefined) updateData.repair_notes = data.repair_notes;
      if (data.technician_notes !== undefined) updateData.technician_notes = data.technician_notes;
      if (data.exit_date !== undefined) updateData.exit_date = data.exit_date;

      const { data: repair, error } = await (supabase as any)
        .from('equipment_repairs')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return repair;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Reparación actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar reparación: ' + error.message);
    },
  });
}

// Delete equipment repair
export function useDeleteEquipmentRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('equipment_repairs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-repairs'] });
      toast.success('Reparación eliminada exitosamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar reparación: ' + error.message);
    },
  });
}
