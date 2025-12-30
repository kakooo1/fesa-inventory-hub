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
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

const formSchema = z.object({
  itemId: z.string().min(1, 'Selecciona un artículo'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  borrowedBy: z.string().min(1, 'El nombre es requerido').max(100),
  expectedReturn: z.string().min(1, 'La fecha de devolución es requerida'),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanFormDialog({ open, onOpenChange }: LoanFormDialogProps) {
  const { items, createLoan } = useApp();

  const availableItems = items.filter(i => i.availableQuantity > 0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: '',
      quantity: 1,
      borrowedBy: '',
      expectedReturn: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        itemId: '',
        quantity: 1,
        borrowedBy: '',
        expectedReturn: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        notes: '',
      });
    }
  }, [open, form]);

  const selectedItem = items.find(i => i.id === form.watch('itemId'));
  const maxQuantity = selectedItem?.availableQuantity || 1;

  const onSubmit = (data: FormData) => {
    const item = items.find(i => i.id === data.itemId);
    if (!item) return;

    if (data.quantity > item.availableQuantity) {
      toast.error('La cantidad excede el stock disponible');
      return;
    }

    createLoan({
      itemId: data.itemId,
      itemName: item.name,
      quantity: data.quantity,
      borrowedBy: data.borrowedBy,
      expectedReturn: new Date(data.expectedReturn),
      notes: data.notes,
    });

    toast.success('Préstamo registrado correctamente');
    onOpenChange(false);
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
              name="itemId"
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
                          {item.name} ({item.availableQuantity} disponibles)
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
                name="expectedReturn"
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
              name="borrowedBy"
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
              <Button type="submit">
                Registrar Préstamo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
