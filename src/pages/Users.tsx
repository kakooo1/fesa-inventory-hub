import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Shield, UserCog } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { User } from '@/types/inventory';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { format } from 'date-fns';
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
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const roleLabels = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  technician: 'Técnico',
};

const roleIcons = {
  admin: Shield,
  supervisor: UserCog,
  technician: Users,
};

export default function UsersPage() {
  const { users, deleteUser, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Only admins can access this page
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      toast.success('Usuario eliminado correctamente');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const columns: Column<User>[] = [
    { 
      key: 'name', 
      header: 'Usuario',
      render: (user) => {
        const RoleIcon = roleIcons[user.role];
        return (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <RoleIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'role', 
      header: 'Rol',
      render: (user) => (
        <StatusBadge status={
          user.role === 'admin' ? 'info' : 
          user.role === 'supervisor' ? 'warning' : 'neutral'
        }>
          {roleLabels[user.role]}
        </StatusBadge>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (user) => (
        <StatusBadge status={user.active ? 'success' : 'danger'}>
          {user.active ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Fecha creación',
      render: (user) => format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })
    },
    { 
      key: 'actions', 
      header: 'Acciones',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
            disabled={user.id === currentUser?.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <MainLayout>
      <PageHeader 
        title="Usuarios"
        description="Gestiona los usuarios y permisos del sistema"
        actions={
          <Button onClick={() => { setEditUser(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Usuario
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-lg">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'supervisor').length}</p>
            <p className="text-sm text-muted-foreground">Supervisores</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'technician').length}</p>
            <p className="text-sm text-muted-foreground">Técnicos</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(user) => user.id}
        emptyMessage="No se encontraron usuarios"
      />

      {/* Form Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a "{userToDelete?.name}" del sistema. Esta acción no se puede deshacer.
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
