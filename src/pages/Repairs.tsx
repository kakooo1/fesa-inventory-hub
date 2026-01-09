import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useEquipmentRepairs, useCreateEquipmentRepair, useUpdateEquipmentRepair, useDeleteEquipmentRepair, EquipmentRepair } from '@/hooks/useEquipmentRepairs';
import { useInventoryItems } from '@/hooks/useDatabase';
import { RepairDialog, RepairFormData } from '@/components/equipments/RepairDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Repairs() {
  const { userProfile } = useAuth();
  const { data: repairs = [], isLoading } = useEquipmentRepairs();
  const { data: equipments = [] } = useInventoryItems('equipment');
  const createRepair = useCreateEquipmentRepair();
  const updateRepair = useUpdateEquipmentRepair();
  const deleteRepair = useDeleteEquipmentRepair();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRepair, setEditRepair] = useState<EquipmentRepair | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState<EquipmentRepair | null>(null);

  // Get technicians list
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles(name)')
        .eq('role', 'technician');

      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.user_id,
        name: item.profiles?.name || 'Técnico',
      }));
    },
  });

  const isSupervisor = userProfile?.role === 'admin' || userProfile?.role === 'supervisor';
  const isTechnician = userProfile?.role === 'technician';

  const filteredRepairs = useMemo(() => {
    let filtered = repairs;

    // Filter by search term
    if (search) {
      filtered = filtered.filter((r) =>
        r.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.repair_notes?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Technicians only see repairs assigned to them
    if (isTechnician) {
      filtered = filtered.filter((r) => r.assigned_to === userProfile?.id);
    }

    return filtered;
  }, [repairs, search, statusFilter, isTechnician, userProfile?.id]);

  const handleEdit = (repair: EquipmentRepair) => {
    setEditRepair(repair);
    setDialogOpen(true);
  };

  const handleDelete = (repair: EquipmentRepair) => {
    setRepairToDelete(repair);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (repairToDelete) {
      deleteRepair.mutate(repairToDelete.id);
      setDeleteDialogOpen(false);
      setRepairToDelete(null);
    }
  };

  const handleSubmit = (data: RepairFormData) => {
    if (editRepair) {
      // Update existing repair
      const updateData: any = {
        id: editRepair.id,
      };

      // Supervisors can update status and assignments
      if (isSupervisor) {
        updateData.status = data.status;
        updateData.assigned_to = data.assigned_to || null;
        updateData.repair_notes = data.repair_notes;
        if (data.status === 'completed' && data.exit_date) {
          updateData.exit_date = data.exit_date;
        }
      }

      // Technicians can only update technician_notes
      if (isTechnician && editRepair.assigned_to === userProfile?.id) {
        updateData.technician_notes = data.technician_notes;
      }

      updateRepair.mutate(updateData);
    } else {
      // Create new repair (supervisors only)
      if (isSupervisor && userProfile) {
        createRepair.mutate({
          equipment_id: data.equipment_id,
          created_by: userProfile.id,
          entry_date: data.entry_date || new Date().toISOString().split('T')[0],
          repair_notes: data.repair_notes,
        });
      }
    }
    setEditRepair(null);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
      case 'pending':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const columns = [
    {
      key: 'equipment_name',
      header: 'Equipo',
      render: (repair: EquipmentRepair) => (
        <div>
          <p className="font-medium">{repair.equipment_name}</p>
          <p className="text-xs text-muted-foreground">{repair.repair_notes}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (repair: EquipmentRepair) => (
        <StatusBadge status={getStatusColor(repair.status)}>
          {getStatusLabel(repair.status)}
        </StatusBadge>
      ),
    },
    {
      key: 'assigned_to_name',
      header: 'Técnico Asignado',
      render: (repair: EquipmentRepair) => (
        <span>{repair.assigned_to_name || 'Sin asignar'}</span>
      ),
    },
    {
      key: 'entry_date',
      header: 'Fecha de Ingreso',
      render: (repair: EquipmentRepair) => (
        <span>{new Date(repair.entry_date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'technician_notes',
      header: 'Notas del Técnico',
      render: (repair: EquipmentRepair) => (
        <div className="text-sm max-w-xs truncate">
          {repair.technician_notes || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      render: (repair: EquipmentRepair) => (
        <div className="flex justify-end gap-2">
          {(isSupervisor || (isTechnician && repair.assigned_to === userProfile?.id)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleEdit(repair); }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isSupervisor && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(repair); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading || !userProfile) {
    return (
      <MainLayout>
        <PageHeader title="Reparaciones" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Reparaciones de Equipos"
        description="Gestiona las reparaciones de equipos"
        actions={
          isSupervisor && (
            <Button onClick={() => { setEditRepair(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reparación
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por equipo o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {filteredRepairs.length === 0 && !search && statusFilter === 'all' && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reparaciones</h3>
          <p className="text-muted-foreground mb-4">
            {isSupervisor
              ? 'Comienza creando una nueva reparación'
              : 'No tienes reparaciones asignadas'}
          </p>
          {isSupervisor && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reparación
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {(filteredRepairs.length > 0 || search || statusFilter) && (
        <DataTable
          columns={columns}
          data={filteredRepairs}
          keyExtractor={(item) => item.id}
          emptyMessage="No se encontraron reparaciones"
        />
      )}

      {/* Repair Dialog */}
      <RepairDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={
          editRepair
            ? {
                id: editRepair.id,
                equipment_id: editRepair.equipment_id,
                equipment_name: editRepair.equipment_name || '',
                status: editRepair.status,
                assigned_to: editRepair.assigned_to || undefined,
                assigned_to_name: editRepair.assigned_to_name || undefined,
                repair_notes: editRepair.repair_notes,
                technician_notes: editRepair.technician_notes,
                entry_date: editRepair.entry_date,
                completed_at: editRepair.completed_at || undefined,
              }
            : undefined
        }
        isEdit={!!editRepair}
        technicians={technicians}
        readOnly={false}
        canEditStatus={isSupervisor}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reparación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la reparación de "{repairToDelete?.equipment_name}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
