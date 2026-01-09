import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shirt } from 'lucide-react';
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

export default function Clothing() {
  const { userProfile } = useAuth();
  const { data: items = [], isLoading } = useInventoryItems('clothing');
  const deleteItem = useDeleteInventoryItem();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const canEdit = userProfile?.role === 'admin' || userProfile?.role === 'bodeguero';
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
      header: 'Stock',
      render: (item) => {
        const isLow = item.available_quantity <= item.min_stock;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-destructive font-semibold' : 'font-medium'}>
              {item.available_quantity}
            </span>
            <span className="text-sm text-muted-foreground">
              / {item.quantity}
            </span>
          </div>
        );
      }
    },
    { 
      key: 'unit', 
      header: 'Unidad',
      render: (item) => <span className="text-sm">{item.unit}</span>
    },
    { 
      key: 'location', 
      header: 'Ubicación',
      render: (item) => <span className="text-sm">{item.location}</span>
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (item) => {
        const isLow = item.available_quantity <= item.min_stock;
        const isCritical = item.available_quantity === 0;
        
        if (isCritical) {
          return <StatusBadge status="danger">Sin stock</StatusBadge>;
        }
        
        if (isLow) {
          return <StatusBadge status="warning">Stock bajo</StatusBadge>;
        }
        
        return <StatusBadge status="success">Disponible</StatusBadge>;
      }
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
        <PageHeader title="Ropa y Uniformes" />
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
        title="Ropa y Uniformes"
        description="Gestiona el inventario de ropa y uniformes"
        actions={
          canEdit && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Prenda
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ropa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !search && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Shirt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ropa</h3>
          <p className="text-muted-foreground mb-4">Comienza agregando tu primer uniforme o prenda al inventario</p>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Prenda
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
          emptyMessage="No se encontraron prendas"
        />
      )}

      {/* Form Dialog */}
      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category="clothing"
        item={editItem}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar prenda</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar "{itemToDelete?.name}"? Esta acción no se puede deshacer.
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
