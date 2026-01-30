import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUpdateProfile, useUpdateUserRole, useCreateUser, Profile } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

const editFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  role: z.enum(['admin', 'supervisor', 'technician', 'bodeguero']),
  active: z.boolean(),
});

const createFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'supervisor', 'technician', 'bodeguero']),
});

type EditFormData = z.infer<typeof editFormSchema>;
type CreateFormData = z.infer<typeof createFormSchema>;

type ProfileWithRole = Profile & { role: 'admin' | 'supervisor' | 'technician' | 'bodeguero' };

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ProfileWithRole | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const updateProfile = useUpdateProfile();
  const updateRole = useUpdateUserRole();
  const createUserMutation = useCreateUser();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: '',
      role: 'technician',
      active: true,
    },
  });

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'technician',
    },
  });

  useEffect(() => {
    if (user) {
      editForm.reset({
        name: user.name,
        role: user.role,
        active: user.active,
      });
    } else {
      createForm.reset({
        name: '',
        email: '',
        password: '',
        role: 'technician',
      });
    }
  }, [user, editForm, createForm, open]);

  const onSubmitEdit = async (data: EditFormData) => {
    try {
      if (!user) return;

      // Update profile first
      await updateProfile.mutateAsync({
        userId: user.user_id,
        name: data.name,
        active: data.active,
      });

      // Update role if changed
      if (data.role !== user.role) {
        await updateRole.mutateAsync({
          userId: user.user_id,
          role: data.role,
        });
      }

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se guardaron correctamente",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  const onSubmitCreate = async (data: CreateFormData) => {
    try {
      await createUserMutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });

      toast({
        title: "Usuario creado",
        description: "El usuario se creó correctamente",
      });
      
      createForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error al crear usuario",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  };


  if (user) {
    // Edit mode
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">El email no puede ser modificado</p>
              </div>

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="technician">Técnico</SelectItem>
                        <SelectItem value="bodeguero">Bodeguero</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuario activo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Los usuarios inactivos no pueden acceder al sistema
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateProfile.isPending || updateRole.isPending}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  // Create mode
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Usuario</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
            <FormField
              control={createForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Mínimo 6 caracteres" 
                      {...field} 
                    />
                  </FormControl>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="show-password"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="show-password" className="text-sm text-muted-foreground cursor-pointer">
                      Mostrar contraseña
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="bodeguero">Bodeguero</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
