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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { InventoryItem, ItemCategory } from '@/types/inventory';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  unit: z.string().min(1, 'La unidad es requerida'),
  minStock: z.coerce.number().min(0, 'El stock mínimo debe ser 0 o más'),
  location: z.string().min(1, 'La ubicación es requerida'),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ItemCategory;
  item?: InventoryItem | null;
}

export function ItemFormDialog({ open, onOpenChange, category, item }: ItemFormDialogProps) {
  const { addItem, updateItem } = useApp();
  const isEditing = !!item;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      unit: category === 'material' ? 'unidad' : 'unidad',
      minStock: 1,
      location: '',
      description: '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        location: item.location,
        description: item.description || '',
      });
    } else {
      form.reset({
        name: '',
        quantity: 1,
        unit: 'unidad',
        minStock: 1,
        location: '',
        description: '',
      });
    }
  }, [item, form, open]);

  const onSubmit = (data: FormData) => {
    if (isEditing && item) {
      updateItem(item.id, { ...data, category });
      toast.success(`${category === 'material' ? 'Material' : 'Herramienta'} actualizado`);
    } else {
      addItem({
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock,
        location: data.location,
        description: data.description,
        category,
      });
      toast.success(`${category === 'material' ? 'Material' : 'Herramienta'} agregado`);
    }
    onOpenChange(false);
  };

  const title = isEditing 
    ? `Editar ${category === 'material' ? 'Material' : 'Herramienta'}`
    : `Agregar ${category === 'material' ? 'Material' : 'Herramienta'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del artículo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="kg, metros, unidad..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Bodega A, Estante 1..." {...field} />
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
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción del artículo..."
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
                {isEditing ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
