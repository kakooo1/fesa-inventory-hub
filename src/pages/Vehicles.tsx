import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Truck, Settings, Gauge } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicles, useDeleteVehicle, Vehicle } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleFormDialog } from '@/components/vehicles/VehicleFormDialog';
import { MaintenanceFormDialog } from '@/components/vehicles/MaintenanceFormDialog';
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

export default function Vehicles() {
  const { userProfile } = useAuth();
  const { data: vehicles = [], isLoading } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  
  const [search, setSearch] = useState('');
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'supervisor';
  const canDelete = userProfile?.role === 'admin';

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setVehicleDialogOpen(true);
  };

  const handleMaintenance = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMaintenanceDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle.mutate(vehicleToDelete.id);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
  };

  const columns: Column<Vehicle>[] = [
    { 
      key: 'plate', 
      header: 'Patente',
      render: (v) => (
        <span className="font-mono font-bold text-primary">{v.plate}</span>
      )
    },
    { 
      key: 'vehicle', 
      header: 'Vehículo',
      render: (v) => (
        <div>
          <p className="font-medium">{v.brand} {v.model}</p>
          <p className="text-sm text-muted-foreground">Año {v.year}</p>
        </div>
      )
    },
    { 
      key: 'km', 
      header: 'Kilometraje',
      render: (v) => (
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{v.current_km.toLocaleString()} km</span>
        </div>
      )
    },
    { key: 'assignedTo', header: 'Asignado a', render: (v) => v.assigned_to || '-' },
    { 
      key: 'maintenance', 
      header: 'Próxima mantención',
      render: (v) => {
        if (!v.next_maintenance_km) return '-';
        const remaining = v.next_maintenance_km - v.current_km;
        const isNear = remaining <= 1000;
        return (
          <div className={isNear ? 'text-warning font-medium' : ''}>
            {remaining > 0 ? `En ${remaining.toLocaleString()} km` : 'Vencida'}
          </div>
        );
      }
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (v) => (
        <StatusBadge status={
          v.status === 'active' ? 'success' : 
          v.status === 'maintenance' ? 'warning' : 'neutral'
        }>
          {v.status === 'active' ? 'Activo' : v.status === 'maintenance' ? 'En mantención' : 'Inactivo'}
        </StatusBadge>
      )
    },
    { 
      key: 'actions', 
      header: 'Acciones',
      className: 'text-right',
      render: (v) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleMaintenance(v); }}
            title="Registrar mantención"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleEdit(v); }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(v); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Vehículos" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Vehículos"
        description="Gestiona la flota de vehículos y sus mantenciones"
        actions={
          canEdit && (
            <Button onClick={() => { setEditVehicle(null); setVehicleDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-success/10 text-success p-3 rounded-lg">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</p>
            <p className="text-sm text-muted-foreground">Activos</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-lg">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</p>
            <p className="text-sm text-muted-foreground">En mantención</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{vehicles.length}</p>
            <p className="text-sm text-muted-foreground">Total flota</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por patente, marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && !search && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay vehículos</h3>
          <p className="text-muted-foreground mb-4">Registra el primer vehículo de la flota</p>
          {canEdit && (
            <Button onClick={() => setVehicleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {(filteredVehicles.length > 0 || search) && (
        <DataTable
          columns={columns}
          data={filteredVehicles}
          keyExtractor={(v) => v.id}
          emptyMessage="No se encontraron vehículos"
        />
      )}

      {/* Vehicle Form Dialog */}
      <VehicleFormDialog
        open={vehicleDialogOpen}
        onOpenChange={setVehicleDialogOpen}
        vehicle={editVehicle}
      />

      {/* Maintenance Form Dialog */}
      <MaintenanceFormDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        vehicle={selectedVehicle}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el vehículo {vehicleToDelete?.plate} del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
