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
import { useCreateInventoryItem, useUpdateInventoryItem, InventoryItem } from '@/hooks/useDatabase';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  unit: z.string().min(1, 'La unidad es requerida'),
  min_stock: z.coerce.number().min(0, 'El stock mínimo debe ser 0 o más'),
  location: z.string().min(1, 'La ubicación es requerida'),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: 'material' | 'tool' | 'clothing' | 'epp';
  item?: InventoryItem | null;
}

export function ItemFormDialog({ open, onOpenChange, category, item }: ItemFormDialogProps) {
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const isEditing = !!item;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      unit: 'unidad',
      min_stock: 1,
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
        min_stock: item.min_stock,
        location: item.location,
        description: item.description || '',
      });
    } else {
      form.reset({
        name: '',
        quantity: 1,
        unit: 'unidad',
        min_stock: 1,
        location: '',
        description: '',
      });
    }
  }, [item, form, open]);

  const onSubmit = (data: FormData) => {
    if (isEditing && item) {
      updateItem.mutate({ 
        id: item.id, 
        ...data,
        category,
      });
    } else {
      createItem.mutate({
        name: data.name,
        quantity: data.quantity,
        available_quantity: data.quantity,
        unit: data.unit,
        min_stock: data.min_stock,
        location: data.location,
        description: data.description || null,
        category,
      });
    }
    onOpenChange(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'material': return 'Material';
      case 'tool': return 'Herramienta';
      case 'clothing': return 'Prenda';
      case 'epp': return 'EPP';
      default: return 'Item';
    }
  };

  const title = isEditing 
    ? `Editar ${getCategoryLabel(category)}`
    : `Agregar ${getCategoryLabel(category)}`;

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
                name="min_stock"
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
              <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                {isEditing ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
