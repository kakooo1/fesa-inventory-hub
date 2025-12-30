import { useEffect } from 'react';
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
import { useUpdateProfile, useUpdateUserRole, Profile } from '@/hooks/useDatabase';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  role: z.enum(['admin', 'supervisor', 'technician']),
  active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type ProfileWithRole = Profile & { role: 'admin' | 'supervisor' | 'technician' };

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ProfileWithRole | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const updateProfile = useUpdateProfile();
  const updateRole = useUpdateUserRole();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role: 'technician',
      active: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        role: user.role,
        active: user.active,
      });
    } else {
      form.reset({
        name: '',
        role: 'technician',
        active: true,
      });
    }
  }, [user, form, open]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    // Update profile
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

    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
