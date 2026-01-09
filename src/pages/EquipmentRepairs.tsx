import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipmentRepairs, useDeleteEquipmentRepair, EquipmentRepair } from '@/hooks/useDatabase';
import { EquipmentRepairFormDialog } from '@/components/equipment-repairs/EquipmentRepairFormDialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
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

export default function EquipmentRepairs() {
  const { userProfile } = useAuth();
  const { data: repairs = [], isLoading } = useEquipmentRepairs();
  const deleteRepair = useDeleteEquipmentRepair();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRepair, setEditRepair] = useState<EquipmentRepair | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState<EquipmentRepair | null>(null);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'bodeguero' || userProfile?.role === 'technician' || userProfile?.role === 'supervisor';
  const canDelete = userProfile?.role === 'admin' || userProfile?.role === 'bodeguero';
  const isSupervisor = userProfile?.role === 'supervisor';

  const filteredRepairs = repairs.filter(r => {
    // Supervisores solo ven equipos que ellos crearon
    if (isSupervisor && r.created_by !== userProfile?.user_id) {
      return false;
    }
    
    return r.equipment_name.toLowerCase().includes(search.toLowerCase()) ||
      r.source.toLowerCase().includes(search.toLowerCase());
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ingresado':
        return <StatusBadge status="info">Ingresado</StatusBadge>;
      case 'en_reparacion':
        return <StatusBadge status="warning">En Reparación</StatusBadge>;
      case 'reparado':
        return <StatusBadge status="success">Reparado</StatusBadge>;
      case 'no_reparable':
        return <StatusBadge status="danger">No Reparable</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const columns: Column<EquipmentRepair>[] = [
    { 
      key: 'equipment_name', 
      header: 'Equipo',
      render: (repair) => (
        <div>
          <p className="font-medium">{repair.equipment_name}</p>
          {repair.description && (
            <p className="text-sm text-muted-foreground">{repair.description}</p>
          )}
        </div>
      )
    },
    { 
      key: 'source', 
      header: 'Procedencia',
      render: (repair) => <span className="text-sm">{repair.source}</span>
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (repair) => getStatusBadge(repair.status)
    },
    { 
      key: 'entry_date', 
      header: 'Ingreso',
      render: (repair) => (
        <span className="text-sm">
          {formatDistanceToNow(new Date(repair.entry_date), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      )
    },
    { 
      key: 'estimated_repair_date', 
      header: 'Fecha Estimada',
      render: (repair) => (
        <span className="text-sm">
          {repair.estimated_repair_date 
            ? new Date(repair.estimated_repair_date).toLocaleDateString('es-ES')
            : '-'
          }
        </span>
      )
    },
  ];

  if (isLoading || !userProfile) {
    return (
      <MainLayout>
        <PageHeader title="Equipos en Reparación" />
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
        title="Equipos en Reparación"
        description="Control de equipos ingresados al taller para reparación"
        actions={
          canEdit && (
            <Button onClick={() => { setEditRepair(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipo o procedencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredRepairs.length === 0 && !search && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay equipos en reparación</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando el primer equipo al taller</p>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {(filteredRepairs.length > 0 || search) && (
        <DataTable
          columns={columns}
          data={filteredRepairs}
          keyExtractor={(repair) => repair.id}
          emptyMessage="No se encontraron equipos"
        />
      )}

      {/* Form Dialog */}
      <EquipmentRepairFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        repair={editRepair}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar equipo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{repairToDelete?.equipment_name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
