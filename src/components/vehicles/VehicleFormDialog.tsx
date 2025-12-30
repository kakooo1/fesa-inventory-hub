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
import { useCreateVehicle, useUpdateVehicle, Vehicle } from '@/hooks/useDatabase';

const formSchema = z.object({
  plate: z.string().min(1, 'La patente es requerida').max(10),
  brand: z.string().min(1, 'La marca es requerida').max(50),
  model: z.string().min(1, 'El modelo es requerido').max(50),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  current_km: z.coerce.number().min(0, 'El kilometraje debe ser 0 o más'),
  status: z.enum(['active', 'maintenance', 'inactive']),
  assigned_to: z.string().max(100).optional(),
  next_maintenance_km: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
}

export function VehicleFormDialog({ open, onOpenChange, vehicle }: VehicleFormDialogProps) {
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const isEditing = !!vehicle;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      current_km: 0,
      status: 'active',
      assigned_to: '',
      next_maintenance_km: 0,
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        current_km: vehicle.current_km,
        status: vehicle.status,
        assigned_to: vehicle.assigned_to || '',
        next_maintenance_km: vehicle.next_maintenance_km || 0,
      });
    } else {
      form.reset({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        current_km: 0,
        status: 'active',
        assigned_to: '',
        next_maintenance_km: 0,
      });
    }
  }, [vehicle, form, open]);

  const onSubmit = (data: FormData) => {
    const vehicleData = {
      plate: data.plate.toUpperCase(),
      brand: data.brand,
      model: data.model,
      year: data.year,
      current_km: data.current_km,
      status: data.status,
      assigned_to: data.assigned_to || null,
      next_maintenance_km: data.next_maintenance_km || null,
      last_maintenance: null,
    };

    if (isEditing && vehicle) {
      updateVehicle.mutate({ id: vehicle.id, ...vehicleData });
    } else {
      createVehicle.mutate(vehicleData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Vehículo' : 'Agregar Vehículo'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patente</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ABCD-12" 
                      {...field} 
                      className="uppercase font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota, Chevrolet..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Hilux, N300..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje actual</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="maintenance">En mantención</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_maintenance_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próxima mantención (km)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignado a (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del conductor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending}>
                {isEditing ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
