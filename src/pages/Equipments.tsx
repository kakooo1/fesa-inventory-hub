
import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Monitor } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, InventoryItem } from '@/hooks/useDatabase';
import { EquipmentFormDialog } from '@/components/equipments/EquipmentFormDialog';
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

export default function Equipments() {
  const { userProfile } = useAuth();
  const { data: items = [], isLoading } = useInventoryItems('equipment');
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'supervisor';
  const canDelete = userProfile?.role === 'admin';

  const filteredItems = useMemo(() => 
    items.filter(i =>
      i.name?.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  const handleEdit = (item) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      // deleteEquipment.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (item) => (
        <div>
          <p className="font-medium">{item.name}</p>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'marca',
      header: 'Marca',
      render: (item) => <span>{item.location || '-'}</span>
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item) => (
        <span className={item.available_quantity <= (item.min_stock ?? 2) ? 'text-destructive font-semibold' : 'font-medium'}>
          {item.available_quantity} / {item.quantity}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          {canEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  ];

  if (isLoading || !userProfile) {
    return (
      <MainLayout>
        <PageHeader title="Equipos" />
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
        title="Equipos"
        description="Gestiona el inventario de equipos"
        actions={
          canEdit && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
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
            placeholder="Buscar equipos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !search && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay equipos</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando tu primer equipo</p>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {(filteredItems.length > 0 || search) && (
        <DataTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          emptyMessage="No se encontraron equipos"
        />
      )}

      {/* Form Dialog */}
      <EquipmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data, mode) => {
          if (mode === 'update' && !editItem && data.selectedId) {
            // Agregar stock a equipo existente (cuando selecciona uno)
            const existingEquip = items.find((item) => item.id === data.selectedId);
            if (existingEquip) {
              updateItem.mutate({ 
                id: existingEquip.id, 
                quantity: existingEquip.quantity + data.cantidad,
                available_quantity: existingEquip.available_quantity + data.cantidad,
              });
            }
          } else if (editItem) {
            // Editar equipo
            const equipmentName = `${data.marca} ${data.capacidad} ${data.modelo}`.trim();
            updateItem.mutate({ 
              id: editItem.id, 
              name: equipmentName, 
              quantity: data.cantidad, 
              available_quantity: data.cantidad, 
              category: 'equipment',
              description: `Marca: ${data.marca}, Capacidad: ${data.capacidad}, Modelo: ${data.modelo}`,
              location: data.marca
            });
          } else {
            // Crear nuevo equipo
            const equipmentName = `${data.marca} ${data.capacidad} ${data.modelo}`.trim();
            createItem.mutate({ 
              name: equipmentName, 
              quantity: data.cantidad, 
              available_quantity: data.cantidad, 
              category: 'equipment', 
              unit: 'unidad', 
              min_stock: 1, 
              location: data.marca,
              description: `Marca: ${data.marca}, Capacidad: ${data.capacidad}, Modelo: ${data.modelo}`
            });
          }
          setEditItem(null);
        }}
        initialData={editItem ? { 
          name: editItem.name, 
          marca: editItem.location || '',
          capacidad: '',
          modelo: '',
          cantidad: editItem.quantity,
          existencias: []
        } : undefined}
        isEdit={!!editItem}
        existingEquipments={items.map((item) => ({
          id: item.id,
          name: item.name,
          marca: item.location || '',
          capacidad: '',
          modelo: '',
          quantity: item.quantity,
        }))}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará "{itemToDelete?.name}" del inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (itemToDelete) {
                deleteItem.mutate(itemToDelete.id);
                setDeleteDialogOpen(false);
                setItemToDelete(null);
              }
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
