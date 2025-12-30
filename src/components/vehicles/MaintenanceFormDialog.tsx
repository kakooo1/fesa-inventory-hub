import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { Vehicle } from '@/types/inventory';
import { toast } from 'sonner';
import { format } from 'date-fns';

const formSchema = z.object({
  type: z.string().min(1, 'El tipo de mantención es requerido').max(100),
  description: z.string().min(1, 'La descripción es requerida').max(500),
  kmAtMaintenance: z.coerce.number().min(0, 'El kilometraje debe ser 0 o más'),
  date: z.string().min(1, 'La fecha es requerida'),
  cost: z.coerce.number().min(0, 'El costo debe ser 0 o más'),
  performedBy: z.string().min(1, 'El responsable es requerido').max(100),
});

type FormData = z.infer<typeof formSchema>;

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
}

export function MaintenanceFormDialog({ open, onOpenChange, vehicle }: MaintenanceFormDialogProps) {
  const { addMaintenance } = useApp();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      description: '',
      kmAtMaintenance: vehicle?.currentKm || 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      cost: 0,
      performedBy: '',
    },
  });

  useEffect(() => {
    if (open && vehicle) {
      form.reset({
        type: '',
        description: '',
        kmAtMaintenance: vehicle.currentKm,
        date: format(new Date(), 'yyyy-MM-dd'),
        cost: 0,
        performedBy: '',
      });
    }
  }, [open, vehicle, form]);

  const onSubmit = (data: FormData) => {
    if (!vehicle) return;

    addMaintenance({
      vehicleId: vehicle.id,
      type: data.type,
      description: data.description,
      kmAtMaintenance: data.kmAtMaintenance,
      date: new Date(data.date),
      cost: data.cost,
      performedBy: data.performedBy,
    });

    toast.success('Mantención registrada correctamente');
    onOpenChange(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Mantención</DialogTitle>
          <DialogDescription>
            Vehículo: {vehicle.brand} {vehicle.model} - {vehicle.plate}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de mantención</FormLabel>
                  <FormControl>
                    <Input placeholder="Cambio de aceite, Revisión general..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kmAtMaintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="performedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Realizado por</FormLabel>
                    <FormControl>
                      <Input placeholder="Taller, técnico..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalles de la mantención realizada..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Mantención
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
