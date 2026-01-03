import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Shield, UserCog } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfiles, useUpdateProfile, useUpdateUserRole, useDeleteUser, Profile } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';
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
import { Navigate } from 'react-router-dom';

const roleLabels = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  technician: 'Técnico',
  bodeguero: 'Bodeguero',
};

const roleIcons = {
  admin: Shield,
  supervisor: UserCog,
  technician: Users,
  bodeguero: Users,
};

type ProfileWithRole = Profile & { role: 'admin' | 'supervisor' | 'technician' | 'bodeguero' };

export default function UsersPage() {
  const { userProfile, user } = useAuth();
  const { data: profiles = [], isLoading } = useProfiles();
  const deleteUser = useDeleteUser();
  
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<ProfileWithRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ProfileWithRole | null>(null);

  // Only admins can access this page
  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = (profiles as ProfileWithRole[]).filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (profile: ProfileWithRole) => {
    setEditUser(profile);
    setDialogOpen(true);
  };

  const handleDelete = (profile: ProfileWithRole) => {
    if (profile.user_id === user?.id) {
      return;
    }
    setUserToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.user_id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const columns: Column<ProfileWithRole>[] = [
    { 
      key: 'name', 
      header: 'Usuario',
      render: (profile) => {
        const RoleIcon = roleIcons[profile.role];
        return (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <RoleIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'role', 
      header: 'Rol',
      render: (profile) => (
        <StatusBadge status={
          profile.role === 'admin' ? 'info' : 
          profile.role === 'supervisor' ? 'warning' : 'neutral'
        }>
          {roleLabels[profile.role]}
        </StatusBadge>
      )
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (profile) => (
        <StatusBadge status={profile.active ? 'success' : 'danger'}>
          {profile.active ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Fecha creación',
      render: (profile) => format(new Date(profile.created_at), 'dd MMM yyyy', { locale: es })
    },
    { 
      key: 'actions', 
      header: 'Acciones',
      className: 'text-right',
      render: (profile) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleEdit(profile); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete(profile); }}
            disabled={profile.user_id === user?.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Usuarios" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <PageHeader 
            title="Usuarios"
            description="Gestiona los usuarios y permisos del sistema"
          />
        </div>
        <Button 
          onClick={() => {
            setEditUser(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{profiles.filter(u => u.role === 'admin').length}</p>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-lg">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{profiles.filter(u => u.role === 'supervisor').length}</p>
            <p className="text-sm text-muted-foreground">Supervisores</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{profiles.filter(u => u.role === 'technician').length}</p>
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
        keyExtractor={(profile) => profile.id}
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
