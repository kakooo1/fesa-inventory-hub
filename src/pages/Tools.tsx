import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventoryItems, useDeleteInventoryItem, InventoryItem } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { ItemFormDialog } from '@/components/inventory/ItemFormDialog';
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

export default function Tools() {
  const { userProfile } = useAuth();
  const { data: items = [], isLoading } = useInventoryItems('tool');
  const deleteItem = useDeleteInventoryItem();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'supervisor' || userProfile?.role === 'bodeguero';
  const canDelete = userProfile?.role === 'admin' || userProfile?.role === 'bodeguero';

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns: Column<InventoryItem>[] = [
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
      key: 'stock', 
      header: 'Disponibilidad',
      render: (item) => {
        const borrowed = item.quantity - item.available_quantity;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.available_quantity}</span>
            <span className="text-muted-foreground">/ {item.quantity}</span>
            {borrowed > 0 && (
              <span className="text-xs text-warning">({borrowed} prestadas)</span>
            )}
          </div>
        );
      }
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (item) => {
        const allBorrowed = item.available_quantity === 0;
        const someBorrowed = item.available_quantity < item.quantity;
        return (
          <StatusBadge status={allBorrowed ? 'danger' : someBorrowed ? 'warning' : 'success'}>
            {allBorrowed ? 'No disponible' : someBorrowed ? 'Parcialmente disponible' : 'Disponible'}
          </StatusBadge>
        );
      }
    },
    { key: 'location', header: 'Ubicación' },
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

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Herramientas" />
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
        title="Herramientas"
        description="Gestiona las herramientas de trabajo"
        actions={
          canEdit && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Herramienta
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar herramientas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !search && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay herramientas</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando tu primera herramienta</p>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Herramienta
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
          emptyMessage="No se encontraron herramientas"
        />
      )}

      {/* Form Dialog */}
      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category="tool"
        item={editItem}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar herramienta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará "{itemToDelete?.name}" del inventario. Esta acción no se puede deshacer.
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
