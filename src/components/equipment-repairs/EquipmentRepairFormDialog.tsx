import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateEquipmentRepair, useUpdateEquipmentRepair, EquipmentRepair } from '@/hooks/useDatabase';

const formSchema = z.object({
  equipment_name: z.string().min(1, 'El nombre es requerido').max(100),
  source: z.string().min(1, 'La procedencia es requerida'),
  description: z.string().max(500).optional(),
  status: z.enum(['ingresado', 'en_reparacion', 'reparado', 'no_reparable']),
  notes: z.string().max(1000).optional(),
  estimated_repair_date: z.string().optional(),
  parts_replaced: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EquipmentRepairFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repair?: EquipmentRepair | null;
}

export function EquipmentRepairFormDialog({ open, onOpenChange, repair }: EquipmentRepairFormDialogProps) {
  const { userProfile } = useAuth();
  const createRepair = useCreateEquipmentRepair();
  const updateRepair = useUpdateEquipmentRepair();
  const isEditing = !!repair;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_name: repair?.equipment_name || '',
      source: repair?.source || '',
      description: repair?.description || '',
      status: repair?.status || 'ingresado',
      notes: repair?.notes || '',
      estimated_repair_date: repair?.estimated_repair_date?.split('T')[0] || '',
      parts_replaced: repair?.parts_replaced || '',
    },
  });

  useEffect(() => {
    if (open && repair) {
      form.reset({
        equipment_name: repair.equipment_name,
        source: repair.source,
        description: repair.description || '',
        status: repair.status,
        notes: repair.notes || '',
        estimated_repair_date: repair.estimated_repair_date?.split('T')[0] || '',
        parts_replaced: repair.parts_replaced || '',
      });
    } else if (open && !repair) {
      form.reset({
        equipment_name: '',
        source: '',
        description: '',
        status: 'ingresado',
        notes: '',
        estimated_repair_date: '',
        parts_replaced: '',
      });
    }
  }, [open, repair, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing && repair) {
      updateRepair.mutate({
        id: repair.id,
        ...data,
        estimated_repair_date: data.estimated_repair_date || null,
      });
    } else {
      createRepair.mutate({
        ...data,
        entry_date: new Date().toISOString(),
        exit_date: null,
        technician_assigned_to: null,
        created_by: userProfile?.user_id || null,
        estimated_repair_date: data.estimated_repair_date || null,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Equipo en Reparación' : 'Agregar Equipo en Reparación'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre del Equipo */}
            <FormField
              control={form.control}
              name="equipment_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Equipo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Compresor Atlas Copco"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Procedencia */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedencia *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Taller de Mecánica, Cliente XYZ, Almacén"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Motor quemado, falla en compresor..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ingresado">Ingresado</SelectItem>
                      <SelectItem value="en_reparacion">En Reparación</SelectItem>
                      <SelectItem value="reparado">Reparado</SelectItem>
                      <SelectItem value="no_reparable">No Reparable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha Estimada de Reparación */}
            <FormField
              control={form.control}
              name="estimated_repair_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Estimada de Reparación</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partes Reemplazadas */}
            <FormField
              control={form.control}
              name="parts_replaced"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partes Reemplazadas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Cilindro principal, Sello de aceite, Válvula de entrada"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createRepair.isPending || updateRepair.isPending}>
                {isEditing ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
