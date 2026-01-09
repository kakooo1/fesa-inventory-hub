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
import { Textarea } from '@/components/ui/textarea';
import { useInventoryItems, useCreateLoan } from '@/hooks/useDatabase';
import { addDays, format } from 'date-fns';

const formSchema = z.object({
  item_id: z.string().min(1, 'Selecciona un artículo'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  borrowed_by: z.string().min(1, 'El nombre es requerido').max(100),
  expected_return: z.string().min(1, 'La fecha de devolución es requerida'),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanFormDialog({ open, onOpenChange }: LoanFormDialogProps) {
  const { data: items = [] } = useInventoryItems();
  const createLoan = useCreateLoan();

  const availableItems = items.filter(i => i.available_quantity > 0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: '',
      quantity: 1,
      borrowed_by: '',
      expected_return: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        item_id: '',
        quantity: 1,
        borrowed_by: '',
        expected_return: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        notes: '',
      });
    }
  }, [open, form]);

  const selectedItem = items.find(i => i.id === form.watch('item_id'));
  const maxQuantity = selectedItem?.available_quantity || 1;

  const onSubmit = (data: FormData) => {
    createLoan.mutate(
      {
        item_id: data.item_id,
        quantity: data.quantity,
        borrowed_by: data.borrowed_by,
        expected_return: data.expected_return,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Préstamo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artículo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un artículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.available_quantity} disponibles)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <Input 
                        type="number" 
                        min="1" 
                        max={maxQuantity}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_return"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha devolución</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="borrowed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prestado a</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la persona" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Proyecto, motivo del préstamo..."
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
              <Button type="submit" disabled={createLoan.isPending}>
                Registrar Préstamo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
